export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'client' | 'admin';
  category?: 'boda-boda' | 'personal' | 'business';
  walletBalance: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'premium-payment';
  status: 'pending' | 'completed' | 'failed';
  method: 'momo' | 'ecobank';
  timestamp: any;
  description: string;
}

export interface InsuranceProduct {
  id: string;
  name: string;
  description: string;
  category: 'boda-boda' | 'personal' | 'business';
  premium: number;
  period: 'daily' | 'weekly' | 'monthly' | 'annual';
  provider: string;
}

export interface Policy {
  id: string;
  userId: string;
  productId: string;
  status: 'active' | 'expired' | 'pending';
  startDate: any;
  endDate: any;
  premiumPaid: number;
}

export interface Claim {
  id: string;
  userId: string;
  policyId: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  description: string;
  evidenceUrls: string[];
  timestamp: any;
}

export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}
