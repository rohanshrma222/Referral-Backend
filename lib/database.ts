import { User, Transaction, Earning, NotificationData } from '@/types';

// In-memory database for demo purposes
// In production, use a proper database like Supabase
class Database {
  private users: Map<string, User> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private earnings: Map<string, Earning> = new Map();
  private notifications: Map<string, NotificationData[]> = new Map();

  // User operations
  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const id = Math.random().toString(36).substr(2, 9);
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  getUserByReferralCode(code: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.referralCode === code);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Transaction operations
  createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const id = Math.random().toString(36).substr(2, 9);
    const transaction: Transaction = {
      ...transactionData,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getTransactionsByUserId(userId: string): Transaction[] {
    return Array.from(this.transactions.values()).filter(t => t.userId === userId);
  }

  // Earning operations
  createEarning(earningData: Omit<Earning, 'id' | 'createdAt'>): Earning {
    const id = Math.random().toString(36).substr(2, 9);
    const earning: Earning = {
      ...earningData,
      id,
      createdAt: new Date(),
    };
    this.earnings.set(id, earning);
    return earning;
  }

  getEarningsByUserId(userId: string): Earning[] {
    return Array.from(this.earnings.values()).filter(e => e.userId === userId);
  }

  // Notification operations
  addNotification(userId: string, notification: NotificationData): void {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.unshift(notification);
    // Keep only last 50 notifications
    if (userNotifications.length > 50) {
      userNotifications.splice(50);
    }
    this.notifications.set(userId, userNotifications);
  }

  getNotifications(userId: string): NotificationData[] {
    return this.notifications.get(userId) || [];
  }

  // Referral operations
  addReferral(parentId: string, childId: string): boolean {
    const parent = this.users.get(parentId);
    const child = this.users.get(childId);
    
    if (!parent || !child || parent.directReferrals.length >= 8) {
      return false;
    }

    parent.directReferrals.push(childId);
    child.parentReferralId = parentId;
    child.level = parent.level + 1;
    
    this.users.set(parentId, parent);
    this.users.set(childId, child);
    
    return true;
  }

  getReferralTree(userId: string): any {
    const user = this.users.get(userId);
    if (!user) return null;

    const getChildren = (parentId: string): any[] => {
      const parent = this.users.get(parentId);
      if (!parent) return [];

      return parent.directReferrals.map(childId => {
        const child = this.users.get(childId);
        return child ? {
          ...child,
          children: getChildren(childId)
        } : null;
      }).filter(Boolean);
    };

    return {
      ...user,
      children: getChildren(userId)
    };
  }
}

export const db = new Database();

// Initialize with some demo data
const demoUser1 = db.createUser({
  email: 'admin@example.com',
  name: 'Admin User',
  referralCode: 'ADMIN123',
  level: 0,
  directReferrals: [],
  totalEarnings: 0,
  directEarnings: 0,
  indirectEarnings: 0,
  isActive: true,
});

const demoUser2 = db.createUser({
  email: 'user1@example.com',
  name: 'John Doe',
  referralCode: 'USER001',
  parentReferralId: demoUser1.id,
  level: 1,
  directReferrals: [],
  totalEarnings: 0,
  directEarnings: 0,
  indirectEarnings: 0,
  isActive: true,
});

db.addReferral(demoUser1.id, demoUser2.id);