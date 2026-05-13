'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Users,
  DollarSign,
  ArrowLeft,
  Loader2,
  Building2,
  FileText,
  LogIn,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Branch {
  _id: string;
  name: string;
  city: string;
  location?: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  department: string;
  branch: Branch | string;
  employmentType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  availableSeats: number;
  skills: string[];
  deadline: string;
  status: string;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBranchDisplay(branch: Branch | string): {
  name: string;
  city: string;
  location: string;
} {
  if (typeof branch === 'string') {
    return { name: 'N/A', city: '', location: '' };
  }
  return {
    name: branch.name || 'N/A',
    city: branch.city || '',
    location: branch.location || '',
  };
}

function isDeadlinePassed(deadline: string): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

function isDeadlineSoon(deadline: string): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

function getEmploymentTypeColor(type: string): string {
  switch (type?.toLowerCase()) {
    case 'full-time':
      return 'bg-emerald-100 text-emerald-700';
    case 'part-time':
      return 'bg-sky-100 text-sky-700';
    case 'contract':
      return 'bg-amber-100 text-amber-700';
    case 'internship':
      return 'bg-violet-100 text-violet-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  // ── Fetch job ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/jobs/${id}`);
        if (response.data?.success) {
          setJob(response.data.data);
        } else {
          setJob(null);
        }
      } catch {
        setJob(null);
        toast.error('Failed to load job details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ── Apply handler ────────────────────────────────────────────────────────

  const handleApply = async () => {
    if (!isAuthenticated || user?.role !== 'candidate') {
      toast.error('Please log in as a candidate to apply.');
      return;
    }

    setApplying(true);
    try {
      await api.post(`/candidate/apply/${id}`, { coverNote });
      toast.success('Application submitted successfully!');
      setApplied(true);
      setCoverNote('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message || 'Failed to submit application.';
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
        <p className="text-slate-500 text-sm">Loading job details...</p>
      </div>
    );
  }

  // ── Not found state ──────────────────────────────────────────────────────

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-24">
        <AlertCircle className="h-14 w-14 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">
          Job not found
        </h2>
        <p className="text-slate-400 mb-6">
          This position may have been removed or the link is incorrect.
        </p>
        <Link href="/jobs">
          <Button
            variant="outline"
            className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  // ── Derived state ────────────────────────────────────────────────────────

  const branchInfo = getBranchDisplay(job.branch);
  const deadlinePassed = isDeadlinePassed(job.deadline);
  const deadlineSoon = !deadlinePassed && isDeadlineSoon(job.deadline);
  const hasSalaryRange =
    job.salaryMin !== undefined &&
    job.salaryMax !== undefined &&
    job.salaryMin > 0 &&
    job.salaryMax > 0;
  const isCandidate = isAuthenticated && user?.role === 'candidate';
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/jobs"
            className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Main Content ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {job.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {branchInfo.name}
                        {branchInfo.city ? `, ${branchInfo.city}` : ''}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={`shrink-0 text-sm ${getEmploymentTypeColor(job.employmentType)}`}
                  >
                    {job.employmentType}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">
                  {job.description || 'No description provided.'}
                </div>
              </CardContent>
            </Card>

            {/* Required Skills */}
            {job.skills?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-sm py-1 px-3"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Department */}
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500 min-w-[90px]">Department</span>
                  <span className="font-medium text-slate-800">
                    {job.department}
                  </span>
                </div>

                {/* Branch */}
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500 min-w-[90px]">Branch</span>
                  <span className="font-medium text-slate-800">
                    {branchInfo.name}
                    {branchInfo.city ? ` — ${branchInfo.city}` : ''}
                  </span>
                </div>

                {/* Employment Type */}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500 min-w-[90px]">Type</span>
                  <span className="font-medium text-slate-800">
                    {job.employmentType}
                  </span>
                </div>

                {/* Experience Level */}
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500 min-w-[90px]">Experience</span>
                  <span className="font-medium text-slate-800">
                    {job.experienceLevel}
                  </span>
                </div>

                {/* Available Seats */}
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500 min-w-[90px]">Positions</span>
                  <span className="font-medium text-slate-800">
                    {job.availableSeats} seat{job.availableSeats !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500 min-w-[90px]">Deadline</span>
                  <span
                    className={`font-medium ${
                      deadlinePassed
                        ? 'text-red-500'
                        : deadlineSoon
                          ? 'text-amber-600'
                          : 'text-slate-800'
                    }`}
                  >
                    {job.deadline
                      ? new Date(job.deadline).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>

                {/* Salary Range */}
                {hasSalaryRange && (
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-slate-500 min-w-[90px]">Salary</span>
                    <span className="font-medium text-slate-800">
                      ${job.salaryMin!.toLocaleString()} — ${job.salaryMax!.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Location detail */}
                {branchInfo.location && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500">Location</span>
                        <p className="font-medium text-slate-800">
                          {branchInfo.location}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ── Apply Section ────────────────────────────────────────────── */}
            {/* Only show for non-admin users */}
            {!isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Apply for this Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deadlinePassed ? (
                    <div className="text-center py-4">
                      <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-500 font-medium">
                        Application deadline has passed
                      </p>
                    </div>
                  ) : applied ? (
                    <div className="text-center py-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-emerald-600 font-medium">
                        Application submitted!
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        You have already applied for this position.
                      </p>
                    </div>
                  ) : !isAuthenticated ? (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-slate-500 text-sm">
                        Log in to apply for this position
                      </p>
                      <Link href="/login" className="w-full block">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                          <LogIn className="h-4 w-4 mr-2" />
                          Login to Apply
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label
                          htmlFor="coverNote"
                          className="text-sm font-medium text-slate-700 mb-1.5 block"
                        >
                          Cover Note{' '}
                          <span className="text-slate-400 font-normal">
                            (Optional)
                          </span>
                        </label>
                        <Textarea
                          id="coverNote"
                          placeholder="Write a brief cover note to stand out..."
                          value={coverNote}
                          onChange={(e) => setCoverNote(e.target.value)}
                          rows={5}
                          className="resize-none"
                        />
                      </div>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleApply}
                        disabled={applying}
                      >
                        {applying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Apply Now
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
