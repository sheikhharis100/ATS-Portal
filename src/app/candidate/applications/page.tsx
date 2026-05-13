'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import {
  FileText,
  Briefcase,
  Loader2,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Video,
  Phone,
  Building2,
  User as UserIcon,
  MessageSquare,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

/* ── Types ─────────────────────────────────────────────────────────── */
interface Interview {
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  location: string;
  interviewer: string;
  message: string;
}

interface Application {
  _id: string;
  job: { _id: string; title: string; department: string };
  branch: { _id: string; name: string; city: string };
  status: string;
  createdAt: string;
  interview?: Interview | null;
}

/* ── Constants ─────────────────────────────────────────────────────── */
const STATUS_PIPELINE = [
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
];

const STATUS_BADGE: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  'Under Review': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  Shortlisted: 'bg-green-100 text-green-700 hover:bg-green-100',
  'Interview Scheduled': 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  Selected: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  Rejected: 'bg-red-100 text-red-700 hover:bg-red-100',
};

/* ── Helpers ───────────────────────────────────────────────────────── */
function getStatusBadgeClass(status: string) {
  return STATUS_BADGE[status] || 'bg-slate-100 text-slate-700 hover:bg-slate-100';
}

function getStatusProgress(status: string): number {
  if (status === 'Rejected') return 0;
  const idx = STATUS_PIPELINE.indexOf(status);
  if (idx === -1) return 0;
  return ((idx + 1) / STATUS_PIPELINE.length) * 100;
}

function getInterviewIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'online':
      return <Video className="h-4 w-4" />;
    case 'phone':
      return <Phone className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function CandidateApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  /* ── Filtered list ──────────────────────────────────────────────── */
  const filtered = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const jobTitle = typeof app.job === 'object' ? app.job.title.toLowerCase() : '';
    const department = typeof app.job === 'object' ? app.job.department.toLowerCase() : '';
    const matchesSearch =
      !searchQuery ||
      jobTitle.includes(searchQuery.toLowerCase()) ||
      department.includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const uniqueStatuses = Array.from(new Set(applications.map((a) => a.status)));

  /* ── Loading ────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 mt-0.5">
            Track the status of your job applications
          </p>
        </div>
        <Link href="/jobs">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Briefcase className="h-4 w-4 mr-2" />
            Browse Jobs
          </Button>
        </Link>
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      {applications.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by job title or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 focus-visible:ring-emerald-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No applications yet</h3>
            <p className="text-slate-400 mb-5 max-w-sm mx-auto">
              Start applying for jobs to see them tracked here
            </p>
            <Link href="/jobs">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        /* No results after filter */
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-600 mb-1">No matching applications</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filter</p>
          </CardContent>
        </Card>
      ) : (
        /* ── Application Cards ──────────────────────────────────── */
        <div className="space-y-4">
          {filtered.map((app) => (
            <Card key={app._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 sm:p-6">
                {/* Top row — Job info + status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/candidate/applications/${app._id}`}
                        className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
                      >
                        {typeof app.job === 'object' ? app.job.title : 'Job'}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500 mt-0.5">
                        {typeof app.job === 'object' && app.job.department && (
                          <span>{app.job.department}</span>
                        )}
                        {typeof app.branch === 'object' && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.branch.name}, {app.branch.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={getStatusBadgeClass(app.status)}>{app.status}</Badge>
                    <Link href={`/candidate/applications/${app._id}`}>
                      <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                        View
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Progress pipeline */}
                {app.status !== 'Rejected' ? (
                  <div className="mb-4">
                    <Progress value={getStatusProgress(app.status)} className="h-2" />
                    <div className="flex justify-between mt-1.5">
                      {STATUS_PIPELINE.map((stage) => {
                        const currentIdx = STATUS_PIPELINE.indexOf(app.status);
                        const stageIdx = STATUS_PIPELINE.indexOf(stage);
                        const reached = stageIdx <= currentIdx;
                        return (
                          <span
                            key={stage}
                            className={`text-[10px] leading-tight ${
                              reached
                                ? 'text-emerald-600 font-semibold'
                                : 'text-slate-400'
                            }`}
                          >
                            {stage}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-2 bg-red-50 border border-red-100 rounded-md">
                    <p className="text-xs text-red-600 font-medium">
                      Application was not successful at this time
                    </p>
                  </div>
                )}

                {/* Applied date */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Interview Details */}
                {app.status === 'Interview Scheduled' && app.interview && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Interview Scheduled
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-700">
                        <Calendar className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-purple-500">Date:</span>{' '}
                        {new Date(app.interview.interviewDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-700">
                        <Clock className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-purple-500">Time:</span> {app.interview.interviewTime}
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-700">
                        {getInterviewIcon(app.interview.interviewType)}
                        <span className="text-purple-500">Type:</span> {app.interview.interviewType}
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-700">
                        <MapPin className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-purple-500">Location:</span>{' '}
                        {app.interview.location}
                      </div>
                      {app.interview.interviewer && (
                        <div className="flex items-center gap-1.5 text-purple-700 col-span-2">
                          <UserIcon className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-purple-500">Interviewer:</span>{' '}
                          {app.interview.interviewer}
                        </div>
                      )}
                      {app.interview.message && (
                        <div className="flex items-start gap-1.5 text-purple-700 col-span-2 mt-1">
                          <MessageSquare className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" />
                          <span className="text-purple-500 shrink-0">Message:</span>{' '}
                          <span className="text-purple-700">{app.interview.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
