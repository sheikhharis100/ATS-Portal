'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Users,
  Search,
  Loader2,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Branch {
  _id: string;
  name: string;
  city: string;
}

interface Job {
  _id: string;
  title: string;
  department: string;
  branch: Branch | string;
  employmentType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  deadline: string;
  availableSeats: number;
  status: string;
  description: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Design',
  'HR',
  'Finance',
  'Operations',
  'Product',
  'Legal',
  'Support',
] as const;

const EMPLOYMENT_TYPES = [
  'Full-Time',
  'Part-Time',
  'Contract',
  'Internship',
] as const;

const JOBS_PER_PAGE = 9;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function getBranchName(branch: Branch | string): string {
  if (typeof branch === 'string') return 'N/A';
  return branch.name;
}

function getBranchCity(branch: Branch | string): string {
  if (typeof branch === 'string') return '';
  return branch.city;
}

function isDeadlineSoon(deadline: string): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
}

function isDeadlinePassed(deadline: string): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Fetch branches on mount ──────────────────────────────────────────────

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('/branches');
        if (response.data?.success) {
          setBranches(response.data.data || []);
        }
      } catch {
        // Branches are non-critical; fail silently
      }
    };
    fetchBranches();
  }, []);

  // ── Fetch jobs whenever filters / page change ────────────────────────────

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: JOBS_PER_PAGE,
      };
      if (search.trim()) params.search = search.trim();
      if (branchFilter !== 'all') params.branch = branchFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;
      if (typeFilter !== 'all') params.employmentType = typeFilter;

      const response = await api.get('/jobs', { params });
      const { data, pagination } = response.data;

      setJobs(Array.isArray(data) ? data : []);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch {
      setJobs([]);
      toast.error('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, branchFilter, departmentFilter, typeFilter, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── Filter reset ─────────────────────────────────────────────────────────

  const clearFilters = () => {
    setSearch('');
    setBranchFilter('all');
    setDepartmentFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    branchFilter !== 'all' ||
    departmentFilter !== 'all' ||
    typeFilter !== 'all';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero / Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
              Open Positions
            </h1>
            <p className="text-slate-500 text-base sm:text-lg">
              Discover opportunities that match your skills and ambitions. Apply
              today and take the next step in your career.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Filter Jobs
            </h2>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-500 hover:text-emerald-600"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by title or keyword..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Branch */}
            <Select
              value={branchFilter}
              onValueChange={(v) => {
                setBranchFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                    {b.city ? ` — ${b.city}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department */}
            <Select
              value={departmentFilter}
              onValueChange={(v) => {
                setDepartmentFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Employment Type */}
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Results Count ─────────────────────────────────────────────────── */}
        {!isLoading && jobs.length > 0 && (
          <p className="text-sm text-slate-500 mb-4">
            Showing page {page} of {totalPages}
          </p>
        )}

        {/* ── Job Grid ──────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-slate-500 text-sm">Loading positions...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24">
            <Briefcase className="h-14 w-14 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No positions found
            </h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              We couldn&apos;t find any jobs matching your criteria. Try adjusting
              your search or filters.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const deadlinePassed = isDeadlinePassed(job.deadline);
              const deadlineSoon =
                !deadlinePassed && isDeadlineSoon(job.deadline);

              return (
                <Card
                  key={job._id}
                  className="group hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-emerald-200/60"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-bold leading-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {job.title}
                      </CardTitle>
                      <Badge
                        className={`shrink-0 ${getEmploymentTypeColor(job.employmentType)}`}
                      >
                        {job.employmentType}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {getBranchName(job.branch)}
                        {getBranchCity(job.branch) &&
                          `, ${getBranchCity(job.branch)}`}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.skills?.slice(0, 4).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {(job.skills?.length || 0) > 4 && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          +{job.skills.length - 4}
                        </Badge>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.experienceLevel}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          deadlinePassed
                            ? 'text-red-500 font-medium'
                            : deadlineSoon
                              ? 'text-amber-600 font-medium'
                              : ''
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        {job.deadline
                          ? new Date(job.deadline).toLocaleDateString()
                          : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.availableSeats} seat{job.availableSeats !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link href={`/jobs/${job._id}`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                      >
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────────── */}
        {totalPages > 1 && !isLoading && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50"
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, and pages around current
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - page) <= 1) return true;
                  return false;
                })
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0) {
                    const prev = arr[idx - 1];
                    if (p - prev > 1) acc.push('ellipsis');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-slate-400 text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={page === item ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(item)}
                      className={
                        page === item
                          ? 'bg-emerald-600 hover:bg-emerald-700 min-w-[36px]'
                          : 'hover:bg-emerald-50 hover:text-emerald-600 min-w-[36px]'
                      }
                    >
                      {item}
                    </Button>
                  ),
                )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
