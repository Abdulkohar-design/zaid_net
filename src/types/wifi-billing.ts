export interface CustomerBill {
  id: string;
  name: string;
  amount: number;
  status: 'pending' | 'paid';
  paymentMethod?: 'transfer' | 'cash';
  notes?: string;
  due_date: Date;
  created_at: Date;
  phoneNumber?: string;
  address?: string;
  packageName?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
}

export interface BillingStats {
  totalCustomers: number;
  totalPending: number;
  totalPaid: number;
  totalUnpaid: number;
  totalPaidAmount: number;
  totalRevenue: number;
}