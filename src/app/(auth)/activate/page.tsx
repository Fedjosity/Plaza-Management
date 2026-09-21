'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function ActivatePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError('Please enter your 10-digit phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send activation code');
      }

      // Store phone in sessionStorage for subsequent steps
      sessionStorage.setItem('activate_phone', phone);
      if (data.tenantName) {
        sessionStorage.setItem('activate_name', data.tenantName);
      }
      if (data.devCode) {
        sessionStorage.setItem('activate_dev_code', data.devCode);
      }

      router.push('/activate/verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      imageSrc="/images/sms_phone_check.jpg"
      imageAlt="Tenant checking SMS on smartphone"
      badge="STEP 1 OF 3"
      title="Verify your number"
      subtitle="Enter the phone number registered with the plaza manager to receive your 6-digit activation code."
      footer={
        <p>
          Already have your password set?{' '}
          <Link href="/login" className="font-semibold text-[#1b1c1c] underline underline-offset-4">
            Sign in here
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSendOtp} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-[#ba1a1a] bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg">
            {error}
          </div>
        )}

        <PhoneInput
          value={phone}
          onChange={setPhone}
          label="Your Mobile Number"
          required
        />

        <div className="p-3 rounded-lg bg-[#f6f3f2] border border-[#e4e2e1] text-xs text-[#5e5e5e] space-y-1">
          <p className="font-semibold text-[#1b1c1c]">Note for Shop Tenants:</p>
          <p>
            Your number must match the mobile number your plaza manager recorded when your shop was assigned.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-[#1b1c1c] hover:bg-black text-white font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? (
            <span>Sending code...</span>
          ) : (
            <>
              <span>Receive 6-Digit Code</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5e5e5e] hover:text-[#1b1c1c]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
