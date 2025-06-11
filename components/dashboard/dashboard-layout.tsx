'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWebSocket } from '@/hooks/use-websocket';
import { User, NotificationData } from '@/types';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Bell, 
  Copy, 
  ShoppingCart,
  Network,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { EarningsChart } from './earnings-chart';
import { ReferralTree } from './referral-tree';
import { NotificationPanel } from './notification-panel';
import { PurchaseSimulator } from './purchase-simulator';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  user: User;
  earningsReport: any;
  referralTree: any;
}

export function DashboardLayout({ user: initialUser, earningsReport: initialEarningsReport, referralTree: initialReferralTree }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(initialUser);
  const [earningsReport, setEarningsReport] = useState(initialEarningsReport);
  const [referralTree, setReferralTree] = useState(initialReferralTree);
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected, notifications } = useWebSocket(user.id);

  // Refresh data function
  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Fetch updated user data
      const userResponse = await fetch(`/api/users/${user.id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      // Fetch updated earnings report
      const earningsResponse = await fetch(`/api/earnings/${user.id}`);
      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json();
        setEarningsReport(earningsData.report);
      }

      // Fetch updated referral tree
      const referralResponse = await fetch(`/api/referrals/${user.id}`);
      if (referralResponse.ok) {
        const referralData = await referralResponse.json();
        setReferralTree(referralData.referralTree);
      }

      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success('Referral code copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, {user.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your referrals and track your earnings
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={refreshData}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            <NotificationPanel notifications={notifications} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{user.totalEarnings.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">
                +₹{earningsReport.dailyEarnings.toFixed(2)} today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Direct Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{user.directEarnings.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">5% from direct referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Indirect Earnings</CardTitle>
              <Network className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{user.indirectEarnings.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">1% from level 2 referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Direct Referrals</CardTitle>
              <Users className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.directReferrals.length}/8</div>
              <p className="text-xs opacity-90 mt-1">
                {8 - user.directReferrals.length} slots remaining
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Card */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
              <Copy className="h-5 w-5" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="referral-code" className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  Share this code to earn commissions
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="referral-code"
                    value={user.referralCode}
                    readOnly
                    className="font-mono text-lg font-bold bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-600"
                  />
                  <Button onClick={copyReferralCode} variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="simulator" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Simulator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EarningsChart earningsData={earningsReport} />
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {earningsReport.recentEarnings?.slice(0, 5).map((earning: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{earning.fromUserName}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Level {earning.level} • {earning.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+₹{earning.amount.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">{earning.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralTree referralTree={referralTree} />
          </TabsContent>

          <TabsContent value="earnings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ₹{earningsReport.dailyEarnings.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{earningsReport.weeklyEarnings.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    ₹{earningsReport.monthlyEarnings.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="simulator">
            <PurchaseSimulator onPurchaseComplete={refreshData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}