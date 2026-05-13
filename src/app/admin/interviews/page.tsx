'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CalendarClock,
  AlertTriangle,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Candidate {
  _id: string;
  name: string;
  email: string;
}

interface Job {
  _id: string;
  title: string;
}

interface Application {
  _id: string;
  candidate: Candidate | string;
  job: Job | string;
  status: string;
}

interface Interview {
  _id: string;
  application: Application | string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  location?: string;
  interviewer?: string;
  message?: string;
  status: string;
}

const interviewStatusColors: Record<string, string> = {
  Scheduled: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Rescheduled: 'bg-yellow-100 text-yellow-800',
};

const interviewTypes = ['On-site', 'Online', 'Phone'];
const interviewStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];

interface InterviewFormData {
  application: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  location: string;
  interviewer: string;
  message: string;
}

const emptyForm: InterviewFormData = {
  application: '',
  interviewDate: '',
  interviewTime: '',
  interviewType: 'Online',
  location: '',
  interviewer: '',
  message: '',
};

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [shortlistedApps, setShortlistedApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [cancellingInterview, setCancellingInterview] = useState<Interview | null>(null);
  const [form, setForm] = useState<InterviewFormData>(emptyForm);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInterviews();
    fetchShortlistedApps();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/interviews');
      if (res.data?.success) {
        setInterviews(res.data.data || []);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load interviews';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlistedApps = async () => {
    try {
      const res = await api.get('/admin/applications', {
        params: { status: 'Shortlisted', limit: 100 },
      });
      if (res.data?.success) {
        setShortlistedApps(res.data.data || []);
      }
    } catch {
      // Non-critical
    }
  };

  const openCreateDialog = () => {
    setEditingInterview(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (interview: Interview) => {
    setEditingInterview(interview);
    const app = typeof interview.application === 'object' ? interview.application : null;
    setForm({
      application: app?._id || '',
      interviewDate: interview.interviewDate ? interview.interviewDate.split('T')[0] : '',
      interviewTime: interview.interviewTime || '',
      interviewType: interview.interviewType || 'Online',
      location: interview.location || '',
      interviewer: interview.interviewer || '',
      message: interview.message || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingInterview) {
      // Update
      if (!form.interviewDate || !form.interviewTime) {
        toast.error('Date and time are required');
        return;
      }
      try {
        setSubmitting(true);
        await api.put(`/admin/interviews/${editingInterview._id}`, {
          interviewDate: form.interviewDate,
          interviewTime: form.interviewTime,
          interviewType: form.interviewType,
          location: form.location,
          interviewer: form.interviewer,
          message: form.message,
        });
        toast.success('Interview updated successfully');
        setDialogOpen(false);
        setForm(emptyForm);
        setEditingInterview(null);
        fetchInterviews();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update interview';
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Create
      if (!form.application) {
        toast.error('Please select an application');
        return;
      }
      if (!form.interviewDate || !form.interviewTime) {
        toast.error('Date and time are required');
        return;
      }
      try {
        setSubmitting(true);
        await api.post('/admin/interviews', {
          application: form.application,
          interviewDate: form.interviewDate,
          interviewTime: form.interviewTime,
          interviewType: form.interviewType,
          location: form.location,
          interviewer: form.interviewer,
          message: form.message,
        });
        toast.success('Interview scheduled successfully');
        setDialogOpen(false);
        setForm(emptyForm);
        fetchInterviews();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to schedule interview';
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleCancel = async () => {
    if (!cancellingInterview) return;
    try {
      await api.delete(`/admin/interviews/${cancellingInterview._id}`);
      toast.success('Interview cancelled');
      setCancelDialogOpen(false);
      setCancellingInterview(null);
      fetchInterviews();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel interview';
      toast.error(message);
    }
  };

  const getCandidateName = (interview: Interview): string => {
    if (typeof interview.application === 'object' && interview.application !== null) {
      const app = interview.application;
      if (typeof app.candidate === 'object' && app.candidate !== null) {
        return app.candidate.name;
      }
    }
    return 'Unknown';
  };

  const getJobTitle = (interview: Interview): string => {
    if (typeof interview.application === 'object' && interview.application !== null) {
      const app = interview.application;
      if (typeof app.job === 'object' && app.job !== null) {
        return app.job.title;
      }
    }
    return 'Unknown';
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      getCandidateName(interview).toLowerCase().includes(q) ||
      getJobTitle(interview).toLowerCase().includes(q) ||
      interview.interviewer?.toLowerCase().includes(q) ||
      interview.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Interview Management</h1>
          <p className="mt-1 text-sm text-slate-500">Schedule, manage, and track interviews</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search interviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchInterviews} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Interviews Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <CalendarClock className="h-8 w-8 text-slate-300" />
                          <p>No interviews found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInterviews.map((interview) => (
                      <TableRow key={interview._id}>
                        <TableCell className="font-medium">
                          {getCandidateName(interview)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {getJobTitle(interview)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {interview.interviewDate
                            ? new Date(interview.interviewDate).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {interview.interviewTime || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{interview.interviewType}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 max-w-[150px] truncate">
                          {interview.location || '—'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {interview.interviewer || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={interviewStatusColors[interview.status] || 'bg-slate-100 text-slate-800'}>
                            {interview.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(interview)}
                              className="h-8 w-8 text-slate-500 hover:text-emerald-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setCancellingInterview(interview);
                                setCancelDialogOpen(true);
                              }}
                              className="h-8 w-8 text-slate-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule / Edit Interview Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingInterview ? 'Edit Interview' : 'Schedule Interview'}
            </DialogTitle>
            <DialogDescription>
              {editingInterview
                ? 'Update the interview details below.'
                : 'Select a shortlisted application and set up the interview.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Application selector - only for create */}
            {!editingInterview && (
              <div className="space-y-2">
                <Label htmlFor="application">Application *</Label>
                <Select
                  value={form.application}
                  onValueChange={(v) => setForm({ ...form, application: v })}
                >
                  <SelectTrigger id="application">
                    <SelectValue placeholder="Select shortlisted application" />
                  </SelectTrigger>
                  <SelectContent>
                    {shortlistedApps.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No shortlisted applications
                      </SelectItem>
                    ) : (
                      shortlistedApps.map((app) => {
                        const candidateName =
                          typeof app.candidate === 'object' && app.candidate !== null
                            ? app.candidate.name
                            : 'Unknown';
                        const jobTitle =
                          typeof app.job === 'object' && app.job !== null
                            ? app.job.title
                            : 'Unknown';
                        return (
                          <SelectItem key={app._id} value={app._id}>
                            {candidateName} — {jobTitle}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interviewDate">Date *</Label>
                <Input
                  id="interviewDate"
                  type="date"
                  value={form.interviewDate}
                  onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewTime">Time *</Label>
                <Input
                  id="interviewTime"
                  type="time"
                  value={form.interviewTime}
                  onChange={(e) => setForm({ ...form, interviewTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interviewType">Type</Label>
                <Select
                  value={form.interviewType}
                  onValueChange={(v) => setForm({ ...form, interviewType: v })}
                >
                  <SelectTrigger id="interviewType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewLocation">Location</Label>
                <Input
                  id="interviewLocation"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Meeting Room B / Zoom link"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewer">Interviewer</Label>
              <Input
                id="interviewer"
                value={form.interviewer}
                onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
                placeholder="Interviewer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewMessage">Message</Label>
              <Textarea
                id="interviewMessage"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Additional details for the candidate..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingInterview ? 'Update Interview' : 'Schedule Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cancel Interview
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this interview for{' '}
              <strong>{cancellingInterview ? getCandidateName(cancellingInterview) : ''}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Interview
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
