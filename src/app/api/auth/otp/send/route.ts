import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhoneNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const supabase = createAdminClient();

    // 1. Verify tenant exists in database
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('id, full_name, auth_status')
      .eq('phone_number', normalizedPhone)
      .single();

    if (tenantErr || !tenant) {
      return NextResponse.json(
        { error: 'No tenant found with this phone number. Please contact your plaza manager.' },
        { status: 404 }
      );
    }

    // 2. Generate secure 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // 3. Save hashed OTP to public.otp_codes
    await supabase.from('otp_codes').insert({
      phone_number: normalizedPhone,
      code_hash: hash,
      expires_at: expiresAt,
    });

    // 4. Send SMS or simulate in development
    const apiKey = process.env.TERMII_API_KEY;
    const isDev = !apiKey || apiKey === 'sample_key';

    if (isDev) {
      console.log('-------------------------------------------');
      console.log(`[DEV OTP CODE] for ${normalizedPhone}: ${code}`);
      console.log('-------------------------------------------');
    } else {
      // Dispatch Termii SMS
      try {
        await fetch('https://api.ng.termii.com/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: normalizedPhone,
            from: process.env.TERMII_SENDER_ID || 'PlazaMgmt',
            sms: `Your Plaza Management verification code is ${code}. Valid for 5 minutes.`,
            type: 'plain',
            channel: 'generic',
            api_key: apiKey,
          }),
        });
      } catch (smsErr) {
        console.error('Failed to send SMS via Termii:', smsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      tenantName: tenant.full_name,
      // For testing convenience in dev
      ...(isDev ? { devCode: code } : {}),
    });
  } catch (err: any) {
    console.error('OTP send error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
