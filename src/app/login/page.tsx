'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Briefcase, UserCheck, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('candidate');
  const { login, logout } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await login(email, password);

      if (activeTab === 'candidate' && userData.role === 'admin') {
        logout();
        toast.error('This account is an Admin account. Please use the Admin / HR tab.');
        return;
      }

      if (activeTab === 'admin' && userData.role === 'candidate') {
        logout();
        toast.error('This account is a Candidate account. Please use the Candidate tab.');
        return;
      }

      toast.success('Login successful!');

      setTimeout(() => {
        if (userData.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/candidate/profile');
        }
      }, 300);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Briefcase className="h-10 w-10 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your ATS Portal account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="candidate" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> Candidate
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Admin / HR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="candidate">
              <p className="text-sm text-muted-foreground mb-4">
                Login as a job candidate to manage your profile and applications.
              </p>
            </TabsContent>

            <TabsContent value="admin">
              <p className="text-sm text-muted-foreground mb-4">
                Login as HR/Admin to manage jobs, applications, and interviews.
              </p>
            </TabsContent>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
