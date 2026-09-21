'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SecureAccountPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('activate_phone');
    if (!saved) {
      router.push('/activate');
      return;
    }
    setPhone(saved);
    setTenantName(sessionStorage.getItem('activate_name') || '');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create password');
      }

      // Auto login with new password
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, password, isEmail: false }),
      });

      // Clear activation session
      sessionStorage.removeItem('activate_phone');
      sessionStorage.removeItem('activate_name');

      router.push('/shop');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      imageSrc="/images/tenant_handshake.jpg"
      imageAlt="Tenant and property manager agreement handshake"
      badge="FINAL STEP"
      title="Create your password"
      subtitle={
        tenantName
          ? `Welcome, ${tenantName}! Choose a secure password for your repeat logins.`
          : 'Choose a password for your repeat sign-ins.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-[#ba1a1a] bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#444748] mb-1.5">
            Create Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#c4c7c7] bg-[#fcf9f8] text-[#1b1c1c] outline-none focus:border-[#1b1c1c] focus:ring-1 focus:ring-[#1b1c1c]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#444748] mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
            minLength={6}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#c4c7c7] bg-[#fcf9f8] text-[#1b1c1c] outline-none focus:border-[#1b1c1c] focus:ring-1 focus:ring-[#1b1c1c]"
          />
        </div>

        <div className="space-y-2 py-1 text-xs text-[#5e5e5e]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
            <span>Used for every future login — no SMS OTP needed.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
            <span>Persistent session keeps you logged in on this phone.</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-[#1b1c1c] hover:bg-black text-white font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? (
            <span>Activating account...</span>
          ) : (
            <>
              <span>Complete Activation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
