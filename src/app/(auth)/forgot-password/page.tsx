'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { PinInput } from '@/components/auth/PinInput';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter your phone number');
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
      if (!res.ok) throw new Error(data.error || 'Failed to send reset code');

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (val = code) => {
    if (val.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: val }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');

      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccess('Password updated successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      imageSrc="/images/shopkeeper_portrait.jpg"
      imageAlt="Nigerian shopkeeper portrait"
      badge={`RESET STEP ${step} OF 3`}
      title="Reset your password"
      subtitle={
        step === 1
          ? 'Enter your registered phone number to receive a verification code.'
          : step === 2
          ? `Enter the 6-digit code sent to +234 ${phone}`
          : 'Choose a new password for your account.'
      }
      footer={
        <Link href="/login" className="inline-flex items-center gap-1 text-xs text-[#5e5e5e] hover:text-[#1b1c1c]">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      }
    >
      {error && (
        <div className="p-3 text-xs font-medium text-[#ba1a1a] bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-xs font-medium text-[#15803d] bg-[#dcfce7] border border-[#bbf7d0] rounded-lg mb-4">
          {success}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <PhoneInput
            value={phone}
            onChange={setPhone}
            label="Registered Phone Number"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-[#1b1c1c] hover:bg-black text-white font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Sending code...' : 'Send Reset Code'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <PinInput
            value={code}
            onChange={setCode}
            onComplete={handleVerifyOtp}
            disabled={loading}
          />

          <button
            type="button"
            onClick={() => handleVerifyOtp()}
            disabled={loading || code.length < 6}
            className="w-full py-3 px-4 rounded-lg bg-[#1b1c1c] hover:bg-black text-white font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#444748] mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#c4c7c7] bg-[#fcf9f8] text-[#1b1c1c] outline-none focus:border-[#1b1c1c] focus:ring-1 focus:ring-[#1b1c1c]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#444748] mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#c4c7c7] bg-[#fcf9f8] text-[#1b1c1c] outline-none focus:border-[#1b1c1c] focus:ring-1 focus:ring-[#1b1c1c]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-[#1b1c1c] hover:bg-black text-white font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Updating password...' : 'Update Password'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </AuthCard>
  );
}
