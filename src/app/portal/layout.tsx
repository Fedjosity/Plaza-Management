import React from 'react';
import { PortalHeader } from '@/components/tenant/PortalHeader';

export default function TenantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f7f6] text-stone-900 font-sans">
      <PortalHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
