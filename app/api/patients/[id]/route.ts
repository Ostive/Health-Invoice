import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { encrypt, decrypt } from '@/lib/encryption';
import { PatientSchema } from '@/lib/schemas';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { id } = await params;

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

        const { data, error } = await supabase
            .from('patients')
            .update({
                ...patientData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id) // Security check
            .select()
            .single();

        if (error) throw error;

        const responseData = { ...data };
        if (responseData.ssn) {
            responseData.ssn = decrypt(responseData.ssn);
        }

        return NextResponse.json(responseData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { id } = await params;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
