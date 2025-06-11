'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, TrendingUp } from 'lucide-react';

interface ReferralTreeProps {
  referralTree: any;
}

export function ReferralTree({ referralTree }: ReferralTreeProps) {
  const renderUser = (user: any, level: number = 0) => {
    const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    
    return (
      <div key={user.id} className={`${level > 0 ? 'ml-8 mt-4' : ''}`}>
        <Card className={`${level === 0 ? 'border-2 border-blue-500' : level === 1 ? 'border-green-500' : 'border-purple-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className={`${level === 0 ? 'bg-blue-500' : level === 1 ? 'bg-green-500' : 'bg-purple-500'} text-white`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={level === 0 ? 'default' : level === 1 ? 'secondary' : 'outline'}>
                      Level {user.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user.referralCode}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                  {user.directReferrals?.length || 0}/8
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  ₹{user.totalEarnings?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {user.children && user.children.length > 0 && (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600"></div>
            {user.children.map((child: any) => renderUser(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Referral Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {referralTree ? renderUser(referralTree) : (
            <p className="text-center text-slate-500 py-8">No referral data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}