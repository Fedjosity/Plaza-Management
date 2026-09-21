import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhoneNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const hash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    const supabase = createAdminClient();

    // 1. Check valid unconsumed OTP
    const { data: record, error: otpErr } = await supabase
      .from('otp_codes')
      .select('id, expires_at')
      .eq('phone_number', normalizedPhone)
      .eq('code_hash', hash)
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpErr || !record) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // 2. Mark code consumed
    await supabase
      .from('otp_codes')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', record.id);

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully',
    });
  } catch (err: any) {
    console.error('OTP verify error:', err);
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
