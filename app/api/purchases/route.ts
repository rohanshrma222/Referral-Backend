import { NextRequest, NextResponse } from 'next/server';
import { referralEngine } from '@/lib/referral-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, profit } = body;

    if (!userId || !amount || !profit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const success = referralEngine.processPurchase(userId, amount, profit);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Purchase processing failed. Amount must be at least ₹1000.' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Purchase processed and earnings distributed' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}