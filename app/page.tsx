'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Network, 
  UserPlus,
  LogIn,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    referralCode: '',
    loginEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          referralCode: formData.referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful!');
        router.push(`/dashboard/${data.user.id}`);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.loginEmail) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      const user = data.users?.find((u: any) => u.email === formData.loginEmail);
      
      if (user) {
        toast.success('Login successful!');
        router.push(`/dashboard/${user.id}`);
      } else {
        toast.error('User not found. Please register first.');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
      setShowUsers(true);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Network className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ReferralPro
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Multi-Level Referral System with Real-Time Earnings Distribution
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-semibold mb-2">8 Direct Referrals</h3>
              <p className="text-sm opacity-90">Build your network with up to 8 direct referrals per level</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-semibold mb-2">5% Direct Earnings</h3>
              <p className="text-sm opacity-90">Earn 5% from your direct referrals' profits</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-semibold mb-2">1% Indirect Earnings</h3>
              <p className="text-sm opacity-90">Earn 1% from second-level referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-semibold mb-2">Live Updates</h3>
              <p className="text-sm opacity-90">Real-time notifications for all earnings</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Auth Form */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                {isLogin ? 'Login to Dashboard' : 'Create Account'}
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isLogin ? 'Access your referral dashboard' : 'Join the referral network'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLogin ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.loginEmail}
                      onChange={(e) => handleInputChange('loginEmail', e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleLogin} 
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Logging in...' : 'Login to Dashboard'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                    <Input
                      id="referral-code"
                      placeholder="Enter referral code if you have one"
                      value={formData.referralCode}
                      onChange={(e) => handleInputChange('referralCode', e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleRegister} 
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm"
                >
                  {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Users */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demo Users
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Quick access to test the system
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={loadUsers} 
                variant="outline" 
                className="w-full"
                disabled={showUsers}
              >
                {showUsers ? 'Users Loaded' : 'Load Demo Users'}
              </Button>

              {showUsers && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <Card key={user.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          onClick={() => router.push(`/dashboard/${user.id}`)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Level {user.level}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {user.referralCode}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="max-w-4xl mx-auto mt-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-center">How the Referral System Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">1. Refer Friends</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Share your referral code with up to 8 people to build your network
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">2. Earn Commissions</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get 5% from direct referrals and 1% from their referrals when they make purchases ≥ ₹1000
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">3. Track Live</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Monitor your earnings in real-time with live notifications and detailed analytics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minimum Purchase Alert */}
        <Alert className="max-w-4xl mx-auto mt-8">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Referral earnings are only generated when purchases exceed ₹1000. 
            This ensures meaningful commissions for all network participants.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}