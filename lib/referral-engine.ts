import { db } from './database';
import { User, Transaction, Earning, NotificationData } from '@/types';

export class ReferralEngine {
  private static instance: ReferralEngine;
  private wsConnections: Map<string, WebSocket> = new Map();

  static getInstance(): ReferralEngine {
    if (!ReferralEngine.instance) {
      ReferralEngine.instance = new ReferralEngine();
    }
    return ReferralEngine.instance;
  }

  // Process purchase and calculate earnings
  processPurchase(userId: string, amount: number, profit: number): boolean {
    // Only process if purchase exceeds 1000Rs
    if (amount < 1000) {
      return false;
    }

    const user = db.getUserById(userId);
    if (!user) return false;

    // Create transaction
    const transaction = db.createTransaction({
      userId,
      amount,
      profit,
      type: 'purchase',
      status: 'completed',
      description: `Purchase of ₹${amount}`
    });

    // Calculate and distribute earnings
    this.distributeEarnings(userId, profit, transaction.id);

    return true;
  }

  private distributeEarnings(userId: string, profit: number, transactionId: string): void {
    const user = db.getUserById(userId);
    if (!user || !user.parentReferralId) return;

    // Level 1 earnings (Direct referral - 5%)
    const level1Parent = db.getUserById(user.parentReferralId);
    if (level1Parent) {
      const level1Earning = profit * 0.05;
      this.createEarning(level1Parent.id, userId, user.name, level1Earning, 5, 1, transactionId, 'direct');
      this.updateUserEarnings(level1Parent.id, level1Earning, 'direct');
      this.sendLiveUpdate(level1Parent.id, 'earning', {
        type: 'earning',
        userId: level1Parent.id,
        title: 'Direct Referral Earning',
        message: `You earned ₹${level1Earning.toFixed(2)} from ${user.name}'s purchase`,
        amount: level1Earning,
        timestamp: new Date()
      });

      // Level 2 earnings (Indirect referral - 1%)
      if (level1Parent.parentReferralId) {
        const level2Parent = db.getUserById(level1Parent.parentReferralId);
        if (level2Parent) {
          const level2Earning = profit * 0.01;
          this.createEarning(level2Parent.id, userId, user.name, level2Earning, 1, 2, transactionId, 'indirect');
          this.updateUserEarnings(level2Parent.id, level2Earning, 'indirect');
          this.sendLiveUpdate(level2Parent.id, 'earning', {
            type: 'earning',
            userId: level2Parent.id,
            title: 'Indirect Referral Earning',
            message: `You earned ₹${level2Earning.toFixed(2)} from ${user.name}'s purchase (via ${level1Parent.name})`,
            amount: level2Earning,
            timestamp: new Date()
          });
        }
      }
    }
  }

  private createEarning(userId: string, fromUserId: string, fromUserName: string, amount: number, percentage: number, level: 1 | 2, transactionId: string, type: 'direct' | 'indirect'): void {
    db.createEarning({
      userId,
      fromUserId,
      fromUserName,
      amount,
      percentage,
      level,
      transactionId,
      type
    });
  }

  private updateUserEarnings(userId: string, amount: number, type: 'direct' | 'indirect'): void {
    const user = db.getUserById(userId);
    if (user) {
      const updates: Partial<User> = {
        totalEarnings: user.totalEarnings + amount
      };

      if (type === 'direct') {
        updates.directEarnings = user.directEarnings + amount;
      } else {
        updates.indirectEarnings = user.indirectEarnings + amount;
      }

      db.updateUser(userId, updates);
    }
  }

  // WebSocket connection management
  addConnection(userId: string, ws: WebSocket): void {
    this.wsConnections.set(userId, ws);
  }

  removeConnection(userId: string): void {
    this.wsConnections.delete(userId);
  }

  private sendLiveUpdate(userId: string, type: string, data: NotificationData): void {
    const ws = this.wsConnections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, data }));
    }
    
    // Also store notification in database
    db.addNotification(userId, data);
  }

  // Add referral with validation
  addReferral(parentReferralCode: string, childUserId: string): boolean {
    const parent = db.getUserByReferralCode(parentReferralCode);
    const child = db.getUserById(childUserId);

    if (!parent || !child || parent.directReferrals.length >= 8) {
      return false;
    }

    // Check if child already has a parent
    if (child.parentReferralId) {
      return false;
    }

    const success = db.addReferral(parent.id, childUserId);
    
    if (success) {
      this.sendLiveUpdate(parent.id, 'referral', {
        type: 'referral',
        userId: parent.id,
        title: 'New Referral',
        message: `${child.name} joined using your referral code`,
        timestamp: new Date()
      });
    }

    return success;
  }

  // Generate earnings report
  generateEarningsReport(userId: string): any {
    const user = db.getUserById(userId);
    if (!user) return null;

    const earnings = db.getEarningsByUserId(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyEarnings = earnings
      .filter(e => e.createdAt >= today)
      .reduce((sum, e) => sum + e.amount, 0);

    const weeklyEarnings = earnings
      .filter(e => e.createdAt >= weekAgo)
      .reduce((sum, e) => sum + e.amount, 0);

    const monthlyEarnings = earnings
      .filter(e => e.createdAt >= monthAgo)
      .reduce((sum, e) => sum + e.amount, 0);

    const level1Earnings = earnings
      .filter(e => e.level === 1)
      .reduce((sum, e) => sum + e.amount, 0);

    const level2Earnings = earnings
      .filter(e => e.level === 2)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      userId,
      totalEarnings: user.totalEarnings,
      directEarnings: user.directEarnings,
      indirectEarnings: user.indirectEarnings,
      dailyEarnings,
      weeklyEarnings,
      monthlyEarnings,
      earningsBreakdown: {
        level1: level1Earnings,
        level2: level2Earnings
      },
      recentEarnings: earnings.slice(0, 10)
    };
  }
}

export const referralEngine = ReferralEngine.getInstance();