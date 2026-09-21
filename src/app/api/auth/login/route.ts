import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizePhoneNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { identifier, password, isEmail } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Please enter your login details and password' }, { status: 400 });
    }

    const supabase = await createClient();

    let emailToAuth = identifier.trim();
    if (!isEmail) {
      const normalizedPhone = normalizePhoneNumber(identifier);
      emailToAuth = `${normalizedPhone.replace('+', '')}@plaza.internal`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Invalid phone number or password. If this is your first time, please activate your account.' },
        { status: 401 }
      );
    }

    const role = data.user?.user_metadata?.role || (isEmail ? 'admin' : 'tenant');

    return NextResponse.json({
      success: true,
      role,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.full_name,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Sign in failed' }, { status: 500 });
  }
}
