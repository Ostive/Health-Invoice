import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { encrypt, decrypt } from '@/lib/encryption'
import { logAuditAction } from '@/lib/audit'
import { InvoiceSchema } from '@/lib/schemas'

export async function GET() {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

        if (error) {
            // Handle missing table error gracefully
            if (error.code === '42P01') {
                return NextResponse.json([])
            }
            throw error
        }

        // Decrypt sensitive data (SSN, Notes, Item Descriptions)
        const decryptedData = data.map((invoice: any) => {
            const decryptedInvoice = { ...invoice };

            // Decrypt Client SSN
            if (decryptedInvoice.client && decryptedInvoice.client.ssn) {
                const decryptedSSN = decrypt(decryptedInvoice.client.ssn);
                // Fallback to original if decryption fails (returns empty) but original wasn't empty
                // This handles existing unencrypted data
                decryptedInvoice.client.ssn = decryptedSSN || decryptedInvoice.client.ssn;
            }

            // Decrypt Notes
            if (decryptedInvoice.notes) {
                const decryptedNotes = decrypt(decryptedInvoice.notes);
                decryptedInvoice.notes = decryptedNotes || decryptedInvoice.notes;
            }

            // Decrypt Items
            if (decryptedInvoice.items && Array.isArray(decryptedInvoice.items)) {
                decryptedInvoice.items = decryptedInvoice.items.map((item: any) => {
                    if (item.description) {
                        const decryptedDesc = decrypt(item.description);
                        return {
                            ...item,
                            description: decryptedDesc || item.description
                        };
                    }
                    return item;
                });
            }

            // Map patient_id to patientId
            if (decryptedInvoice.patient_id) {
                decryptedInvoice.patientId = decryptedInvoice.patient_id;
                delete decryptedInvoice.patient_id;
            }

            return decryptedInvoice;
        })

        // Log Audit Action (Async, don't await to not block response)
        logAuditAction({
            action: 'VIEW_INVOICES',
            resourceType: 'invoice',
            userId: user.id,
            details: { count: data.length }
        });

        return NextResponse.json(decryptedData)
    } catch (error: any) {
        console.error('Error fetching invoices:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { invoice } = body

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice data is required' }, { status: 400 })
        }

        // Validation with Zod
        const validationResult = InvoiceSchema.safeParse(invoice);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(e => e.message);
            return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
        }

        // Use validated data
        const validatedInvoice = validationResult.data;

        // Encrypt sensitive data (SSN, Notes, Items)
        const invoiceToSave = { ...validatedInvoice }

        // Encrypt SSN
        if (invoiceToSave.client && invoiceToSave.client.ssn) {
            invoiceToSave.client = {
                ...invoiceToSave.client,
                ssn: encrypt(invoiceToSave.client.ssn)
            }
        }

        // Encrypt Notes
        if (invoiceToSave.notes) {
            invoiceToSave.notes = encrypt(invoiceToSave.notes);
        }

        // Encrypt Item Descriptions
        if (invoiceToSave.items && Array.isArray(invoiceToSave.items)) {
            invoiceToSave.items = invoiceToSave.items.map((item: any) => ({
                ...item,
                description: item.description ? encrypt(item.description) : item.description
            }));
        }

        const payload = {
            ...invoiceToSave,
            user_id: user.id,
            updated_at: new Date().toISOString(),
            // For new invoices, force number to null to let DB trigger generate it
            ...(!validatedInvoice.id && {
                created_at: new Date().toISOString(),
                number: null
            }),
            patient_id: validatedInvoice.patientId || null
        }



        const { data, error } = await supabase
            .from('invoices')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .single()


        if (error) console.error('API: Error saving invoice:', error);

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Invoice number already exists' }, { status: 409 })
            }
            throw error
        }

        // Log Audit Action
        const actionType = invoice.id ? 'UPDATE_INVOICE' : 'CREATE_INVOICE';
        logAuditAction({
            action: actionType,
            resourceType: 'invoice',
            resourceId: data.id,
            userId: user.id,
            details: { invoiceNumber: data.number }
        });

        // Return decrypted data to client
        const responseData = { ...data }

        // Decrypt SSN
        if (responseData.client && responseData.client.ssn) {
            responseData.client = {
                ...responseData.client,
                ssn: decrypt(responseData.client.ssn)
            }
        }

        // Decrypt Notes
        if (responseData.notes) {
            responseData.notes = decrypt(responseData.notes);
        }

        // Decrypt Items
        if (responseData.items && Array.isArray(responseData.items)) {
            responseData.items = responseData.items.map((item: any) => ({
                ...item,
                description: item.description ? decrypt(item.description) : item.description
            }));
        }

        // Map patient_id to patientId
        if (responseData.patient_id) {
            responseData.patientId = responseData.patient_id;
            delete responseData.patient_id;
        }

        return NextResponse.json({ data: responseData, success: true })

    } catch (error: any) {
        console.error('Error saving invoice:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
