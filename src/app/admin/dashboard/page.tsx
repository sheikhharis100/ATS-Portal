'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  Users,
  Building2,
  CalendarClock,
  ArrowRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface DashboardData {
  jobs: { total: number; open: number };
  applications: {
    total: number;
    byStatus: {
      Submitted: number;
      UnderReview: number;
      Shortlisted: number;
      InterviewScheduled: number;
      Selected: number;
      Rejected: number;
    };
  };
  candidates: number;
  branches: number;
  interviews: number;
}

const statusColors: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-800',
  UnderReview: 'bg-yellow-100 text-yellow-800',
  Shortlisted: 'bg-emerald-100 text-emerald-800',
  InterviewScheduled: 'bg-purple-100 text-purple-800',
  Selected: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const metricCards = [
  { key: 'totalJobs', label: 'Total Jobs', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'openJobs', label: 'Open Jobs', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'applications', label: 'Total Applications', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50' },
  { key: 'candidates', label: 'Total Candidates', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'branches', label: 'Total Branches', icon: Building2, color: 'text-teal-600', bg: 'bg-teal-50' },
  { key: 'interviews', label: 'Scheduled Interviews', icon: CalendarClock, color: 'text-pink-600', bg: 'bg-pink-50' },
];

const quickActions = [
  { href: '/admin/jobs', label: 'Manage Jobs', description: 'Create, edit, and manage job postings', icon: Briefcase, color: 'from-blue-500 to-blue-600' },
  { href: '/admin/applications', label: 'Review Applications', description: 'Review and update application statuses', icon: FileText, color: 'from-emerald-500 to-emerald-600' },
  { href: '/admin/branches', label: 'Manage Branches', description: 'Add and manage company branches', icon: Building2, color: 'from-violet-500 to-violet-600' },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getMetricValue = (key: string): number => {
    if (!data) return 0;
    switch (key) {
      case 'totalJobs': return data.jobs.total;
      case 'openJobs': return data.jobs.open;
      case 'applications': return data.applications.total;
      case 'candidates': return data.candidates;
      case 'branches': return data.branches;
      case 'interviews': return data.interviews;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your recruitment pipeline and key metrics.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{getMetricValue(card.key)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Applications by Status & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Applications by Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Applications by Status</CardTitle>
            <CardDescription>Breakdown of all applications by their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.entries(data.applications.byStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50"
                  >
                    <span className="text-sm text-slate-600">{status.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Badge className={statusColors[status] || 'bg-slate-100 text-slate-800'}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50/50 cursor-pointer">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{action.label}</p>
                      <p className="text-xs text-slate-500 truncate">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
