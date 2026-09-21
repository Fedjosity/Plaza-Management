'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Building2, Landmark, Shield, User, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-stone-900">Plaza Configuration & Settings</h1>
        <p className="text-xs text-stone-500">
          Manage commercial plaza details, property manager contact, and bank transfer accounts.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Plaza Profile */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-3">
            <Building2 className="w-4 h-4" />
            <span>Commercial Plaza Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Plaza Name
              </label>
              <input
                type="text"
                defaultValue="Ikeja Central Commercial Plaza"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Plaza Location
              </label>
              <input
                type="text"
                defaultValue="Awolowo Way, Ikeja, Lagos"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Property Manager Info */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-3">
            <User className="w-4 h-4" />
            <span>Lead Property Manager</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-stone-200 shrink-0">
              <Image
                src="/images/manager_portrait.jpg"
                alt="Property Manager"
                fill
                className="object-cover grayscale"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-stone-900">Chief Alabi Durojaiye</h3>
              <p className="text-xs text-stone-500">Commercial Plaza Operations & Rent Recovery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Manager Phone (for tenant calls)
              </label>
              <input
                type="text"
                defaultValue="+234 802 999 8888"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs font-mono font-medium focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Admin Notification Email
              </label>
              <input
                type="email"
                defaultValue="admin@plaza.internal"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Bank Account for Offline Transfers */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-3">
            <Landmark className="w-4 h-4" />
            <span>Bank Account Details (Displayed on Tenant Pay Rent Page)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Bank Name</label>
              <input
                type="text"
                defaultValue="Zenith Bank"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Account Number</label>
              <input
                type="text"
                defaultValue="1012345678"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Account Name</label>
              <input
                type="text"
                defaultValue="Ikeja Central Commercial Plaza Ltd"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
