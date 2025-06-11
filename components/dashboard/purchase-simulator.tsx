'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseSimulatorProps {
  onPurchaseComplete?: () => void;
}

export function PurchaseSimulator({ onPurchaseComplete }: PurchaseSimulatorProps) {
  const [selectedUser, setSelectedUser] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [profitAmount, setProfitAmount] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users for simulation
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Simulate purchase
  const simulatePurchase = async () => {
    if (!selectedUser || !purchaseAmount || !profitAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(purchaseAmount);
    const profit = parseFloat(profitAmount);

    if (amount < 1000) {
      toast.error('Purchase amount must be at least ₹1000 to generate earnings');
      return;
    }

    if (profit <= 0) {
      toast.error('Profit amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          amount,
          profit,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Purchase simulated successfully! Earnings distributed to referrers.');
        setPurchaseAmount('');
        setProfitAmount('');
        
        // Trigger refresh of parent component data
        if (onPurchaseComplete) {
          onPurchaseComplete();
        }
      } else {
        toast.error(data.error || 'Failed to process purchase');
      }
    } catch (error) {
      toast.error('Failed to simulate purchase');
    } finally {
      setLoading(false);
    }
  };

  // Calculate potential earnings
  const calculatePotentialEarnings = () => {
    const profit = parseFloat(profitAmount) || 0;
    const directEarning = profit * 0.05; // 5% for direct referral
    const indirectEarning = profit * 0.01; // 1% for indirect referral
    
    return {
      direct: directEarning,
      indirect: indirectEarning,
      total: directEarning + indirectEarning
    };
  };

  const potentialEarnings = calculatePotentialEarnings();
  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Simulator
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Simulate purchases to test the referral earning system in real-time
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Load Users Button */}
          <div className="flex justify-between items-center">
            <Label>Available Users</Label>
            <Button 
              onClick={loadUsers} 
              variant="outline" 
              size="sm"
              disabled={loadingUsers}
            >
              {loadingUsers ? 'Loading...' : 'Load Users'}
            </Button>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user-select">Select User Making Purchase</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{user.name}</span>
                      <Badge variant="outline" className="ml-2">
                        Level {user.level}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purchase Amount */}
          <div className="space-y-2">
            <Label htmlFor="purchase-amount">Purchase Amount (₹)</Label>
            <Input
              id="purchase-amount"
              type="number"
              placeholder="Enter purchase amount"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Profit Amount */}
          <div className="space-y-2">
            <Label htmlFor="profit-amount">Profit Amount (₹)</Label>
            <Input
              id="profit-amount"
              type="number"
              placeholder="Enter profit amount"
              value={profitAmount}
              onChange={(e) => setProfitAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Validation Alert */}
          {purchaseAmount && parseFloat(purchaseAmount) < 1000 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Purchase amount must be at least ₹1000 to generate referral earnings.
              </AlertDescription>
            </Alert>
          )}

          {/* Selected User Info */}
          {selectedUserData && (
            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Selected User Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Name:</span>
                    <p className="font-medium">{selectedUserData.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Level:</span>
                    <p className="font-medium">{selectedUserData.level}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Direct Referrals:</span>
                    <p className="font-medium">{selectedUserData.directReferrals?.length || 0}/8</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Total Earnings:</span>
                    <p className="font-medium">₹{selectedUserData.totalEarnings?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Potential Earnings Preview */}
          {profitAmount && parseFloat(profitAmount) > 0 && parseFloat(purchaseAmount || '0') >= 1000 && (
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-800 dark:text-green-200">
                  <TrendingUp className="h-4 w-4" />
                  Potential Earnings Distribution
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <DollarSign className="h-4 w-4" />
                      Direct Referrer (5%)
                    </div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      ₹{potentialEarnings.direct.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <DollarSign className="h-4 w-4" />
                      Indirect Referrer (1%)
                    </div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      ₹{potentialEarnings.indirect.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      Total Distribution
                    </div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      ₹{potentialEarnings.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Simulate Button */}
          <Button 
            onClick={simulatePurchase} 
            disabled={loading || !selectedUser || !purchaseAmount || !profitAmount}
            className="w-full"
            size="lg"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Simulate Purchase & Distribute Earnings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                1
              </div>
              <p>Select a user who will make the purchase</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                2
              </div>
              <p>Enter purchase amount (must be ≥ ₹1000) and profit amount</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                3
              </div>
              <p>The system will automatically distribute 5% to direct referrer and 1% to indirect referrer</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                4
              </div>
              <p>Referrers will receive notifications about their earnings (check the notification panel)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}