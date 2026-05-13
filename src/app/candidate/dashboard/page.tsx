'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import {
  Briefcase,
  FileText,
  User,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
  CalendarClock,
  Send,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────── */
interface Application {
  _id: string;
  job: { _id: string; title: string; department: string };
  branch: { _id: string; name: string; city: string };
  status: string;
  createdAt: string;
  interview?: {
    interviewDate: string;
    interviewTime: string;
    interviewType: string;
    location: string;
    interviewer: string;
    message: string;
  } | null;
}

/* ── Status → Badge colour map ─────────────────────────────────────── */
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Submitted':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
    case 'Shortlisted':
      return 'bg-green-100 text-green-700 hover:bg-green-100';
    case 'Interview Scheduled':
      return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
    case 'Selected':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
    case 'Rejected':
      return 'bg-red-100 text-red-700 hover:bg-red-100';
    default:
      return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
  }
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function CandidateDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/candidate/applications');
      setApplications(response.data.data || []);
    } catch {
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* Status breakdown */
  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const total = applications.length;
  const underReview = statusCounts['Under Review'] || 0;
  const shortlisted = statusCounts['Shortlisted'] || 0;
  const interviews = statusCounts['Interview Scheduled'] || 0;
  const selected = statusCounts['Selected'] || 0;
  const rejected = statusCounts['Rejected'] || 0;

  /* ── Loading state ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Welcome ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 mt-0.5">
            Here&apos;s an overview of your job applications
          </p>
        </div>
        <Link href="/jobs">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Briefcase className="h-4 w-4 mr-2" />
            Search Jobs
          </Button>
        </Link>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={<FileText className="h-5 w-5 text-blue-600" />} bg="bg-blue-50" value={total} label="Total" />
        <StatCard icon={<Send className="h-5 w-5 text-sky-600" />} bg="bg-sky-50" value={statusCounts['Submitted'] || 0} label="Submitted" />
        <StatCard icon={<Clock className="h-5 w-5 text-yellow-600" />} bg="bg-yellow-50" value={underReview} label="Under Review" />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-green-600" />} bg="bg-green-50" value={shortlisted} label="Shortlisted" />
        <StatCard icon={<CalendarClock className="h-5 w-5 text-purple-600" />} bg="bg-purple-50" value={interviews} label="Interviews" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} bg="bg-emerald-50" value={selected} label="Selected" />
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        <QuickAction
          href="/jobs"
          icon={<Briefcase className="h-6 w-6 text-emerald-600" />}
          iconBg="bg-emerald-100"
          title="Search Jobs"
          description="Browse open positions"
          accent
        />
        <QuickAction
          href="/candidate/profile"
          icon={<User className="h-6 w-6 text-slate-600" />}
          iconBg="bg-slate-100"
          title="My Profile"
          description="Update your details"
        />
        <QuickAction
          href="/candidate/applications"
          icon={<FileText className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-100"
          title="My Applications"
          description="Track your status"
        />
      </div>

      {/* ── Recent Applications ────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Recent Applications</CardTitle>
          {applications.length > 5 && (
            <Link href="/candidate/applications">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-1">No applications yet</h3>
              <p className="text-slate-400 mb-4">
                You haven&apos;t applied to any jobs. Start exploring!
              </p>
              <Link href="/jobs">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {applications.slice(0, 5).map((app) => (
                <Link
                  key={app._id}
                  href={`/candidate/applications/${app._id}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {typeof app.job === 'object' ? app.job.title : 'Job'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {typeof app.job === 'object' && app.job.department && (
                          <span>{app.job.department}</span>
                        )}
                        {typeof app.branch === 'object' && app.branch.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {app.branch.city}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusBadgeClass(app.status)}>{app.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Upcoming Interviews ─────────────────────────────────────── */}
      {interviews > 0 && (
        <Card className="border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <CalendarClock className="h-5 w-5" />
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications
                .filter((a) => a.status === 'Interview Scheduled' && a.interview)
                .map((app) => (
                  <Link
                    key={app._id}
                    href={`/candidate/applications/${app._id}`}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-purple-900 truncate">
                        {typeof app.job === 'object' ? app.job.title : 'Interview'}
                      </p>
                      <p className="text-xs text-purple-600">
                        {new Date(app.interview!.interviewDate).toLocaleDateString()} &middot;{' '}
                        {app.interview!.interviewTime} &middot; {app.interview!.interviewType}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-purple-400 shrink-0" />
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Stat Card Sub-component ──────────────────────────────────────── */
function StatCard({
  icon,
  bg,
  value,
  label,
}: {
  icon: React.ReactNode;
  bg: string;
  value: number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Quick Action Sub-component ────────────────────────────────────── */
function QuickAction({
  href,
  icon,
  iconBg,
  title,
  description,
  accent = false,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <Link href={href} className="group">
      <Card
        className={`hover:shadow-md transition-all cursor-pointer h-full ${
          accent ? 'border-emerald-200 shadow-sm' : ''
        }`}
      >
        <CardContent className="p-5 flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{title}</p>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 ml-auto shrink-0 group-hover:text-emerald-500 transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
