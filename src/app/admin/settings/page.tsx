'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Landmark, 
  User, 
  Save, 
  CheckCircle2, 
  LogOut, 
  ShieldCheck, 
  Phone, 
  Mail 
} from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Form states with defaults
  const [plazaName, setPlazaName] = useState('Ikeja Central Commercial Plaza');
  const [plazaLocation, setPlazaLocation] = useState('Awolowo Way, Ikeja, Lagos');
  const [managerName, setManagerName] = useState('Chief Alabi Durojaiye');
  const [managerTitle, setManagerTitle] = useState('Commercial Plaza Operations & Rent Recovery');
  const [managerPhone, setManagerPhone] = useState('+234 802 999 8888');
  const [adminEmail, setAdminEmail] = useState('admin@plaza.internal');
  const [bankName, setBankName] = useState('Zenith Bank');
  const [accountNumber, setAccountNumber] = useState('1012345678');
  const [accountName, setAccountName] = useState('Ikeja Central Commercial Plaza Ltd');

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('plaza_admin_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.plazaName) setPlazaName(parsed.plazaName);
        if (parsed.plazaLocation) setPlazaLocation(parsed.plazaLocation);
        if (parsed.managerName) setManagerName(parsed.managerName);
        if (parsed.managerTitle) setManagerTitle(parsed.managerTitle);
        if (parsed.managerPhone) setManagerPhone(parsed.managerPhone);
        if (parsed.adminEmail) setAdminEmail(parsed.adminEmail);
        if (parsed.bankName) setBankName(parsed.bankName);
        if (parsed.accountNumber) setAccountNumber(parsed.accountNumber);
        if (parsed.accountName) setAccountName(parsed.accountName);
      } else {
        const singleName = localStorage.getItem('plaza_manager_name');
        if (singleName) setManagerName(singleName);
      }
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settingsToSave = {
        plazaName,
        plazaLocation,
        managerName,
        managerTitle,
        managerPhone,
        adminEmail,
        bankName,
        accountNumber,
        accountName,
      };
      localStorage.setItem('plaza_admin_settings', JSON.stringify(settingsToSave));
      localStorage.setItem('plaza_manager_name', managerName);

      // Dispatch event so AdminHeader updates instantly
      window.dispatchEvent(new CustomEvent('plaza-manager-updated', { detail: { name: managerName } }));
      window.dispatchEvent(new Event('storage'));

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-stone-900">Plaza Configuration & Settings</h1>
          <p className="text-xs text-stone-500">
            Manage commercial plaza details, admin manager profile, and bank transfer accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-red-600" />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings and administrator profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Plaza Profile */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-3">
            <Building2 className="w-4 h-4 text-stone-700" />
            <span>Commercial Plaza Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Plaza Name
              </label>
              <input
                type="text"
                value={plazaName}
                onChange={(e) => setPlazaName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Plaza Location
              </label>
              <input
                type="text"
                value={plazaLocation}
                onChange={(e) => setPlazaLocation(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Lead Property Manager Profile & Name Change */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-3">
            <User className="w-4 h-4 text-stone-700" />
            <span>Administrator & Property Manager Profile</span>
          </div>

          {/* Profile Card Preview */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-stone-200 shrink-0 bg-stone-200">
              <Image
                src="/images/manager_portrait.jpg"
                alt="Property Manager"
                fill
                className="object-cover grayscale"
              />
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Active Administrator
              </div>
              <h3 className="text-base font-bold text-stone-900 truncate">
                {managerName || 'Administrator'}
              </h3>
              <p className="text-xs text-stone-500 truncate">
                {managerTitle || 'Commercial Plaza Operations'}
              </p>
            </div>
          </div>

          {/* Editable Name & Title Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Manager Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Chief Alabi Durojaiye"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                This name updates the admin navigation, receipts, and portal contact info.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={managerTitle}
                onChange={(e) => setManagerTitle(e.target.value)}
                placeholder="e.g. Commercial Plaza Operations & Rent Recovery"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-stone-500" />
                <span>Manager Phone (for tenant calls)</span>
              </label>
              <input
                type="text"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs font-mono font-medium focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-stone-500" />
                <span>Admin Notification Email</span>
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bank Account for Offline Transfers */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-3">
            <Landmark className="w-4 h-4 text-stone-700" />
            <span>Bank Account Details (Displayed on Tenant Pay Rent Page)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Account Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:text-red-700 hover:bg-red-50 hover:border-red-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-stone-500" />
            <span>Sign Out Admin</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
