export interface User {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  parentReferralId?: string;
  level: number;
  directReferrals: string[];
  totalEarnings: number;
  directEarnings: number;
  indirectEarnings: number;
  createdAt: Date;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  profit: number;
  type: 'purchase' | 'earning';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  description: string;
}

export interface Earning {
  id: string;
  userId: string;
  fromUserId: string;
  fromUserName: string;
  amount: number;
  percentage: number;
  level: 1 | 2;
  transactionId: string;
  type: 'direct' | 'indirect';
  createdAt: Date;
}

export interface NotificationData {
  type: 'earning' | 'referral' | 'purchase';
  userId: string;
  title: string;
  message: string;
  amount?: number;
  timestamp: Date;
}

export interface EarningsReport {
  userId: string;
  totalEarnings: number;
  directEarnings: number;
  indirectEarnings: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  earningsBreakdown: {
    level1: number;
    level2: number;
  };
  topEarners: Array<{
    userId: string;
    name: string;
    earnings: number;
  }>;
}