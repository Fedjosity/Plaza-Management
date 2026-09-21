'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Store, Plus, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { PhoneInput } from '@/components/auth/PhoneInput';

export default function AddShopPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [rentRate, setRentRate] = useState('');
  const [hasTenant, setHasTenant] = useState(true);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [paidUntil, setPaidUntil] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rentRate) {
      setError('Please provide shop name and rent rate');
      return;
    }

    if (hasTenant && (!tenantName || !tenantPhone)) {
      setError('Please provide tenant name and phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rent_rate: Number(rentRate),
          tenant_name: hasTenant ? tenantName : null,
          tenant_phone: hasTenant ? tenantPhone : null,
          initial_paid_until: paidUntil || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create shop');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shops Directory
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {/* Header Strip with visual */}
        <div className="relative p-6 bg-stone-900 text-white overflow-hidden">
          <Image
            src="/images/electronics_shop.jpg"
            alt="Retail Shop"
            fill
            className="object-cover opacity-20"
          />
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
              SCREEN B3 • PLAZA SETUP
            </span>
            <h1 className="text-xl font-bold">Register New Shop Unit</h1>
            <p className="text-xs text-stone-300 mt-0.5">
              Add a commercial store unit and optionally link a shopkeeper with an instant activation invite.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shop Unit Details */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              1. Shop Unit Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Shop Name / Unit Number *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shop A2, Stall 14"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Monthly Rent Rate (₦) *
              </label>
              <input
                type="number"
                value={rentRate}
                onChange={(e) => setRentRate(e.target.value)}
                placeholder="e.g. 75000"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Tenant Assignment Toggle */}
          <div className="pt-4 border-t border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                2. Tenant Assignment
              </h2>
              <label className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTenant}
                  onChange={(e) => setHasTenant(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                Assign tenant now
              </label>
            </div>

            {hasTenant && (
              <div className="space-y-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tenant Full Name *
                  </label>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="e.g. Amaka Obi"
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tenant Phone Number (for WhatsApp & OTP) *
                  </label>
                  <PhoneInput
                    value={tenantPhone}
                    onChange={setTenantPhone}
                    placeholder="802 345 6789"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Initial Paid Until Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={paidUntil}
                    onChange={(e) => setPaidUntil(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    If the tenant has already made an upfront payment, specify the date here.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Creating Shop...' : 'Save & Register Shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
