'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { RecordPaymentModal } from '@/components/admin/RecordPaymentModal';
import { ShopWithTenant } from '@/types/database';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shops, setShops] = useState<ShopWithTenant[]>([]);

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/admin/shops');
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f6] text-stone-900 font-sans">
      <AdminHeader onOpenPaymentModal={() => setIsModalOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchShops();
          window.dispatchEvent(new CustomEvent('plaza-payment-recorded'));
        }}
        shops={shops}
      />
    </div>
  );
}
