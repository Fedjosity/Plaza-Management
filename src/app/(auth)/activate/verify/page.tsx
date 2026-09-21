'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { PinInput } from '@/components/auth/PinInput';
import { ArrowRight, ArrowLeft, RotateCw } from 'lucide-react';

export default function VerifyCodePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [devCode, setDevCode] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('activate_phone');
    if (!saved) {
      router.push('/activate');
      return;
    }
    setPhone(saved);
    const code = sessionStorage.getItem('activate_dev_code');
    if (code) setDevCode(code);
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (submittedCode = code) => {
    if (submittedCode.length < 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: submittedCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      router.push('/activate/secure');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to resend code');
      }

      setCountdown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      imageSrc="/images/sms_phone_check.jpg"
      imageAlt="Verifying SMS code"
      badge="STEP 2 OF 3"
      title="Enter 6-digit code"
      subtitle={`Enter the confirmation code sent to +234 ${phone}`}
      footer={
        <div className="flex items-center justify-between text-xs text-[#5e5e5e]">
          <Link href="/activate" className="inline-flex items-center gap-1 hover:text-[#1b1c1c]">
            <ArrowLeft className="w-3.5 h-3.5" /> Change number
          </Link>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="font-semibold text-[#1b1c1c] disabled:text-[#858383] disabled:cursor-not-allowed inline-flex items-center gap-1 hover:underline"
          >
            <RotateCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {devCode && (
          <div className="p-3 text-xs rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
            <span><strong>Dev Test Code:</strong> {devCode}</span>
            <button
              type="button"
              onClick={() => {
                setCode(devCode);
                handleVerify(devCode);
              }}
              className="text-xs font-bold underline hover:text-emerald-950 cursor-pointer"
            >
              Autofill & Verify
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 text-xs font-medium text-[#ba1a1a] bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg">
            {error}
          </div>
        )}

        <PinInput
          value={code}
          onChange={setCode}
          onComplete={handleVerify}
          disabled={loading}
        />

        <button
          type="button"
          onClick={() => handleVerify()}
          disabled={loading || code.length < 6}
          className="w-full py-3 px-4 rounded-lg bg-[#1b1c1c] hover:bg-black text-white font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 cursor-pointer"
        >
          {loading ? (
            <span>Verifying...</span>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </AuthCard>
  );
}
