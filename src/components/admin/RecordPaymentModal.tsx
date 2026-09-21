'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, Banknote, CheckCircle2, AlertCircle } from 'lucide-react';
import { ShopWithTenant } from '@/types/database';
import { formatNaira } from '@/lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shops: ShopWithTenant[];
  initialShopId?: string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  shops,
  initialShopId,
}: RecordPaymentModalProps) {
  const [selectedShopId, setSelectedShopId] = useState(initialShopId || '');
  const [months, setMonths] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'transfer' | 'pos'>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialShopId) {
      setSelectedShopId(initialShopId);
    } else if (shops.length > 0 && !selectedShopId) {
      setSelectedShopId(shops[0].id);
    }
  }, [initialShopId, shops, selectedShopId]);

  if (!isOpen) return null;

  const currentShop = shops.find((s) => s.id === selectedShopId);
  const standardAmount = currentShop ? Number(currentShop.rent_rate) * months : 0;
  const finalAmount = customAmount ? Number(customAmount) : standardAmount;

  // Calculate forward extension date preview
  let forwardDatePreview = 'Select shop';
  if (currentShop) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let base = today;
    if (currentShop.paid_until) {
      const p = new Date(currentShop.paid_until);
      p.setHours(0, 0, 0, 0);
      if (p > today) base = p;
    }
    const ext = new Date(base);
    ext.setMonth(ext.getMonth() + months);
    forwardDatePreview = ext.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId) {
      setError('Please select a shop');
      return;
    }
    if (finalAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/payments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: selectedShopId,
          amount: finalAmount,
          months_covered: months,
          payment_method: method,
          notes,
          recorded_by: 'admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">
              PLAZA MANAGER ACTION
            </span>
            <h3 className="text-lg font-bold text-stone-900">Record Rent Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shop Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Select Shop Unit
            </label>
            <select
              value={selectedShopId}
              onChange={(e) => {
                setSelectedShopId(e.target.value);
                setCustomAmount('');
              }}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.tenant?.full_name || 'Vacant'} ({formatNaira(Number(s.rent_rate))}/mo)
                </option>
              ))}
            </select>
          </div>

          {/* Months Preset Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Period Covered
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMonths(m);
                    setCustomAmount('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    months === m
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {m === 1 ? '1 Month' : m === 12 ? '1 Year' : `${m} Months`}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Amount Collected (₦)
              </label>
              {customAmount && (
                <button
                  type="button"
                  onClick={() => setCustomAmount('')}
                  className="text-[11px] text-stone-500 hover:underline"
                >
                  Reset to standard ({formatNaira(standardAmount)})
                </button>
              )}
            </div>
            <input
              type="number"
              value={customAmount !== '' ? customAmount : standardAmount || ''}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          {/* Forward Extension Live Preview */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>
                New <strong>Paid Until</strong> Date:
              </span>
            </div>
            <span className="font-bold text-sm text-emerald-950">{forwardDatePreview}</span>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'transfer', label: 'Bank Transfer', icon: CreditCard },
                { id: 'pos', label: 'POS Terminal', icon: CreditCard },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id as any)}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                    method === id
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Notes / Receipt Reference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash to manager at shop"
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Recording...' : `Confirm ${formatNaira(finalAmount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
