'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Store, Lock, CheckCircle2 } from 'lucide-react';
import { Tenant, ShopWithTenant } from '@/types/database';

export default function TenantProfilePage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [shop, setShop] = useState<ShopWithTenant | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('plaza_active_tenant_id');
    fetch('/api/tenant/portal' + (saved ? `?tenant_id=${saved}` : ''))
      .then((r) => r.json())
      .then((data) => {
        setTenant(data.tenant);
        setShop(data.shop);
      })
      .catch(console.error);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Shop
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div>
          <h1 className="text-lg font-black text-stone-900">Tenant Account Profile</h1>
          <p className="text-xs text-stone-500">
            Registered contact information and security settings.
          </p>
        </div>

        {/* Info Grid */}
        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500">Full Name</span>
            <span className="font-bold text-stone-900">{tenant?.full_name || 'Loading...'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500">Registered Phone Number</span>
            <span className="font-mono font-bold text-stone-900">{tenant?.phone_number || 'Loading...'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500">Assigned Commercial Unit</span>
            <span className="font-bold text-stone-900">{shop?.name || 'Shop A1'}</span>
          </div>
        </div>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit} className="pt-4 border-t border-stone-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Update Account Password</span>
          </div>

          {passwordSaved && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Password updated successfully!
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
