'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  Clock,
  User as UserIcon,
  Video,
  Phone,
  Building2,
  Loader2,
  ExternalLink,
  DollarSign,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  Circle,
  XCircle,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────── */
interface Interview {
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  location: string;
  interviewer: string;
  message: string;
}

interface StatusEntry {
  status: string;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    department: string;
    description?: string;
    employmentType?: string;
    experienceLevel?: string;
    salaryMin?: number;
    salaryMax?: number;
    skills?: string[];
    deadline?: string;
  };
  branch: {
    _id: string;
    name: string;
    city: string;
    location?: string;
    isRemote?: boolean;
  };
  status: string;
  createdAt: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  coverNote?: string;
  interview?: Interview | null;
  statusHistory?: StatusEntry[];
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

function getStatusBadgeClass(status: string) {
  return STATUS_BADGE[status] || 'bg-slate-100 text-slate-700 hover:bg-slate-100';
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

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/candidate/applications/${id}`);
      setApplication(response.data.data);
    } catch {
      setApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Loading ────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  /* ── Not Found ──────────────────────────────────────────────────── */
  if (!application) {
    return (
      <div className="text-center py-24">
        <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-1">Application not found</h3>
        <p className="text-slate-400 mb-5">This application may have been removed or doesn&apos;t exist.</p>
        <Link href="/candidate/applications">
          <Button variant="outline">Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const job = application.job;
  const branch = application.branch;
  const interview = application.interview;
  const statusHistory = application.statusHistory || [];
  const progressValue =
    application.status === 'Rejected'
      ? 0
      : ((STATUS_PIPELINE.indexOf(application.status) + 1) / STATUS_PIPELINE.length) * 100;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Back link ──────────────────────────────────────────────── */}
      <Link
        href="/candidate/applications"
        className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Applications
      </Link>

      {/* ── Header Card ────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Briefcase className="h-7 w-7 text-slate-500" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900 line-clamp-2">
                  {typeof job === 'object' ? job.title : 'Job'}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                  {typeof job === 'object' && job.department && <span>{job.department}</span>}
                  {typeof branch === 'object' && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {branch.name}, {branch.city}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge className={`${getStatusBadgeClass(application.status)} text-sm px-3 py-1 shrink-0`}>
              {application.status}
            </Badge>
          </div>

          {/* Progress pipeline */}
          {application.status !== 'Rejected' && (
            <div className="mt-5">
              <Progress value={progressValue} className="h-2.5" />
              <div className="flex justify-between mt-2">
                {STATUS_PIPELINE.map((stage) => {
                  const currentIdx = STATUS_PIPELINE.indexOf(application.status);
                  const stageIdx = STATUS_PIPELINE.indexOf(stage);
                  const reached = stageIdx <= currentIdx;
                  return (
                    <span
                      key={stage}
                      className={`text-[10px] leading-tight text-center ${
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
          )}

          {application.status === 'Rejected' && (
            <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Your application was not successful at this time
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Two-column layout for Job + Branch info ────────────────── */}
      <div className="grid md:grid-cols-5 gap-6">
        {/* Job Details — wider */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              Job Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type + Level */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {job.employmentType && (
                <div>
                  <span className="text-slate-500">Employment Type</span>
                  <p className="font-medium mt-0.5">{job.employmentType}</p>
                </div>
              )}
              {job.experienceLevel && (
                <div>
                  <span className="text-slate-500 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Experience Level
                  </span>
                  <p className="font-medium mt-0.5">{job.experienceLevel}</p>
                </div>
              )}
            </div>

            {/* Salary */}
            {formatSalary(job.salaryMin, job.salaryMax) && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-slate-500">Salary Range:</span>
                  <span className="font-semibold text-slate-900">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
              </>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-slate-500">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            {job.description && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-slate-500">Description</span>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </>
            )}

            {/* Deadline */}
            {job.deadline && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">Application Deadline:</span>
                  <span className="font-medium">
                    {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Branch + Applied Info — narrower */}
        <div className="md:col-span-2 space-y-6">
          {/* Branch Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Branch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Office</span>
                <p className="font-medium">{branch.name}</p>
              </div>
              <div>
                <span className="text-slate-500">City</span>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {branch.city}
                </p>
              </div>
              {branch.location && (
                <div>
                  <span className="text-slate-500">Address</span>
                  <p className="font-medium">{branch.location}</p>
                </div>
              )}
              {branch.isRemote && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Remote
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Application Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Applied On</span>
                <p className="font-medium flex items-center gap-1 mt-0.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Separator />
              <div>
                <span className="text-slate-500">Current Status</span>
                <p className="mt-1">
                  <Badge className={getStatusBadgeClass(application.status)}>
                    {application.status}
                  </Badge>
                </p>
              </div>

              {/* Resume link */}
              {application.resumeUrl && (
                <>
                  <Separator />
                  <div>
                    <span className="text-slate-500">Resume</span>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 mt-1 text-emerald-600 hover:text-emerald-800 hover:underline text-sm font-medium"
                    >
                      <FileText className="h-4 w-4" />
                      View Resume
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Cover Letter ────────────────────────────────────────────── */}
      {(application.coverLetterUrl || application.coverNote) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Cover Letter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {application.coverLetterUrl ? (
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border">
                {application.coverLetterUrl}
              </p>
            ) : (
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border">
                {application.coverNote}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Interview Details ───────────────────────────────────────── */}
      {interview && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/60 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
              <Clock className="h-5 w-5" />
              Interview Details
            </CardTitle>
            <CardDescription className="text-purple-600">
              Your interview has been scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-purple-100">
                <Calendar className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-purple-600 font-medium">Date</span>
                  <p className="font-semibold text-purple-900">
                    {new Date(interview.interviewDate).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-purple-100">
                <Clock className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-purple-600 font-medium">Time</span>
                  <p className="font-semibold text-purple-900">{interview.interviewTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-purple-100">
                {getInterviewIcon(interview.interviewType)}
                <div>
                  <span className="text-purple-600 font-medium">Type</span>
                  <p className="font-semibold text-purple-900">{interview.interviewType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-purple-100">
                <MapPin className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-purple-600 font-medium">Location / Link</span>
                  <p className="font-semibold text-purple-900">
                    {interview.location?.startsWith('http') ? (
                      <a
                        href={interview.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-purple-600 inline-flex items-center gap-1"
                      >
                        Join Meeting
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      interview.location
                    )}
                  </p>
                </div>
              </div>

              {interview.interviewer && (
                <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-purple-100 sm:col-span-2">
                  <UserIcon className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-purple-600 font-medium">Interviewer</span>
                    <p className="font-semibold text-purple-900">{interview.interviewer}</p>
                  </div>
                </div>
              )}
            </div>

            {interview.message && (
              <div className="mt-4 p-4 bg-white/60 border border-purple-100 rounded-lg">
                <span className="text-sm font-medium text-purple-600 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  Message from HR
                </span>
                <p className="text-sm text-purple-800 mt-1.5 leading-relaxed">
                  {interview.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Status Timeline ─────────────────────────────────────────── */}
      {statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />

              <div className="space-y-0">
                {[...statusHistory].reverse().map((entry, index) => {
                  const isLatest = index === 0;
                  const isRejected = entry.status === 'Rejected';

                  return (
                    <div key={index} className="flex items-start gap-4 relative pb-6 last:pb-0">
                      {/* Timeline dot */}
                      <div className="relative z-10 mt-0.5">
                        {isLatest ? (
                          isRejected ? (
                            <XCircle className="h-7 w-7 text-red-500 -ml-[5px]" />
                          ) : (
                            <CheckCircle2 className="h-7 w-7 text-emerald-500 -ml-[5px]" />
                          )
                        ) : (
                          <Circle className="h-7 w-7 text-slate-300 fill-slate-200 -ml-[5px]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 -mt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={`${getStatusBadgeClass(entry.status)} text-xs`}
                          >
                            {entry.status}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(entry.changedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {' at '}
                            {new Date(entry.changedAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
