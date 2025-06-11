import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { referralEngine } from '@/lib/referral-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, referralCode } = body;

    // Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Generate unique referral code
    const userReferralCode = `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create user
    const user = db.createUser({
      email,
      name,
      referralCode: userReferralCode,
      level: 0,
      directReferrals: [],
      totalEarnings: 0,
      directEarnings: 0,
      indirectEarnings: 0,
      isActive: true
    });

    // Add referral if referral code provided
    if (referralCode) {
      referralEngine.addReferral(referralCode, user.id);
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = db.getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}