import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SignUpSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Zod Validation
    const validationResult = SignUpSchema.safeParse(body);

    if (!validationResult.success) {
      const missing = validationResult.error.issues.map(issue => issue.message);
      return NextResponse.json(
        { error: `Le mot de passe doit contenir : ${missing.join(', ')}.` },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
