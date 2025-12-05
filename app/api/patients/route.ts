import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { encrypt, decrypt } from '@/lib/encryption';
import { PatientSchema } from '@/lib/schemas';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true });

        if (error) throw error;

        // Decrypt SSN and Notes
        const decryptedData = data.map((patient: any) => {
            const decryptedSSN = patient.ssn ? decrypt(patient.ssn) : undefined;
            const decryptedNotes = patient.notes ? decrypt(patient.notes) : undefined;

            return {
                ...patient,
                ssn: decryptedSSN || patient.ssn, // Fallback
                notes: decryptedNotes || patient.notes // Fallback
            };
        });

        return NextResponse.json(decryptedData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const validation = PatientSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Validation failed', errors: validation.error.issues }, { status: 400 });
        }

        const patientData = { ...validation.data };

        // Encrypt SSN
        if (patientData.ssn) {
            patientData.ssn = encrypt(patientData.ssn);
        }

        // Encrypt Notes
        if (patientData.notes) {
            patientData.notes = encrypt(patientData.notes);
        }

        const { data, error } = await supabase
            .from('patients')
            .insert({
                ...patientData,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;

        // Return decrypted data
        const responseData = { ...data };
        if (responseData.ssn) {
            responseData.ssn = decrypt(responseData.ssn);
        }
        if (responseData.notes) {
            responseData.notes = decrypt(responseData.notes);
        }

        return NextResponse.json(responseData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
