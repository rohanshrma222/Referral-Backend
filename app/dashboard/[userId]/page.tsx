// app/dashboard/[userId]/page.tsx

import { notFound } from 'next/navigation';
import { db } from '@/lib/database';
import { referralEngine } from '@/lib/referral-engine';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

interface DashboardPageProps {
  params: {
    userId: string;
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const user = await db.getUserById(params.userId);

  if (!user) {
    notFound();
  }

  const earningsReport = await referralEngine.generateEarningsReport(params.userId);
  const referralTree = await db.getReferralTree(params.userId);

  return (
    <DashboardLayout 
      user={user} 
      earningsReport={earningsReport} 
      referralTree={referralTree} 
    />
  );
}

// Required for static export with dynamic params
export async function generateStaticParams() {
  const users = await db.getAllUsers(); // Must return an array like [{ id: 'abc' }, { id: 'def' }]
  
  return users.map((user: { id: string }) => ({
    userId: user.id,
  }));
}
