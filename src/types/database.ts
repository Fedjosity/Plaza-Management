export type ShopStatus = 'active' | 'vacant';
export type TenantAuthStatus = 'invited' | 'active' | 'disabled';
export type KycStatus = 'not_started' | 'pending' | 'verified' | 'failed';
export type PaymentMethod = 'paystack' | 'manual';
export type RentStatus = 'current' | 'expiring_soon' | 'overdue';

export interface Shop {
  id: string;
  name: string; // e.g. "Shop A1", "Shop 14"
  rent_rate: number; // e.g. 50000 (NGN)
  rate_unit: 'month';
  paid_until: string | null; // ISO Date string (YYYY-MM-DD)
  tenant_id: string | null;
  status: ShopStatus;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  full_name: string;
  phone_number: string; // E.164 normalized, e.g. "+2348012345678"
  shop_id: string;
  auth_status: TenantAuthStatus;
  kyc_status: KycStatus;
  paystack_subaccount_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentPayment {
  id: string;
  shop_id: string;
  amount: number;
  months_covered: number;
  paid_via: PaymentMethod;
  paystack_reference: string | null;
  recorded_by: string; // 'tenant' or 'admin'
  created_at: string;
}

export interface CustomerPaymentLink {
  id: string;
  tenant_id: string;
  paystack_subaccount_id: string;
  active: boolean;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  recipient_type: 'tenant' | 'admin';
  recipient_id: string;
  channel: 'sms';
  message: string;
  sent_at: string;
  status: 'sent' | 'failed';
}

export interface ShopWithTenant extends Shop {
  tenant?: Tenant | null;
  rent_status: RentStatus;
  days_remaining: number;
}
