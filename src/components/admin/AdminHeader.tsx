'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, Plus, CreditCard, LayoutDashboard, Store, Settings, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onOpenPaymentModal: () => void;
}

export function AdminHeader({ onOpenPaymentModal }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [managerName, setManagerName] = useState('Chief Durojaiye');

  useEffect(() => {
    const syncName = () => {
      try {
        const stored = localStorage.getItem('plaza_manager_name');
        if (stored) {
          setManagerName(stored);
        } else {
          const settings = localStorage.getItem('plaza_admin_settings');
          if (settings) {
            const parsed = JSON.parse(settings);
            if (parsed.managerName) setManagerName(parsed.managerName);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    syncName();
    window.addEventListener('plaza-manager-updated', syncName);
    window.addEventListener('storage', syncName);
    return () => {
      window.removeEventListener('plaza-manager-updated', syncName);
      window.removeEventListener('storage', syncName);
    };
  }, []);

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Shops', href: '/admin/shops', icon: Store, exact: false },
    { label: 'Settings', href: '/admin/settings', icon: Settings, exact: true },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black tracking-widest text-stone-900 uppercase block leading-tight">
                  PLAZA MGMT
                </span>
                <span className="text-[10px] text-stone-500 font-medium block">
                  Ikeja Central Arcade
                </span>
              </div>
            </Link>

            {/* Nav Tabs (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-stone-100 text-stone-900 font-extrabold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenPaymentModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Record</span> Payment
            </button>

            <Link
              href="/admin/shops/new"
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span> Shop
            </Link>

            {/* Manager Avatar Chip */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-stone-200">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-stone-300 bg-stone-100 shrink-0">
                <Image
                  src="/images/manager_portrait.jpg"
                  alt="Plaza Property Manager"
                  fill
                  className="object-cover grayscale"
                />
              </div>
              <div className="hidden lg:block text-left leading-tight max-w-[130px]">
                <span className="text-xs font-bold text-stone-900 block truncate" title={managerName}>
                  {managerName}
                </span>
                <span className="text-[10px] text-stone-500 font-medium">Plaza Admin</span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg text-xs font-bold text-stone-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-stone-100 overflow-x-auto space-x-1">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-red-600 hover:bg-red-50 whitespace-nowrap"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
