'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!phone || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Sign in failed');
      }

      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/portal');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      imageSrc="/images/plaza_storefront.jpg"
      imageAlt="Commercial Plaza Storefront"
      badge="SIGN IN"
      title="Welcome back"
      subtitle="Sign in to view your shop details, rent balance, and payment receipts."
      footer={
        <div className="space-y-2">
          <p>
            First time using the portal?{' '}
            <Link href="/activate" className="font-semibold text-[#1b1c1c] underline underline-offset-4">
              Activate your account
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-[#ba1a1a] bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg">
            {error}
          </div>
        )}

        <PhoneInput
          value={phone}
          onChange={setPhone}
          label="Registered Phone Number"
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#444748]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#5e5e5e] hover:text-[#1b1c1c] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#c4c7c7] bg-[#fcf9f8] text-[#1b1c1c] outline-none focus:border-[#1b1c1c] focus:ring-1 focus:ring-[#1b1c1c]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-[#1b1c1c] hover:bg-black text-white font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
