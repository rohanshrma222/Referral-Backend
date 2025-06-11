import { notFound } from 'next/navigation';
import { db } from '@/lib/database';
import { referralEngine } from '@/lib/referral-engine';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

interface DashboardPageProps {
  params: {
    userId: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const user = db.getUserById(params.userId);

  if (!user) {
    notFound();
  }

  const earningsReport = referralEngine.generateEarningsReport(params.userId);
  const referralTree = db.getReferralTree(params.userId);

  return (
    <DashboardLayout 
      user={user} 
      earningsReport={earningsReport} 
      referralTree={referralTree} 
    />
  );
}