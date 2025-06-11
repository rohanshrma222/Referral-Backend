import { NextRequest, NextResponse } from 'next/server';
import { referralEngine } from '@/lib/referral-engine';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const report = referralEngine.generateEarningsReport(params.userId);
    
    if (!report) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}