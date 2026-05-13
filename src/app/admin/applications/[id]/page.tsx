'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, Calendar, FileText, ExternalLink, Clock, Loader2, Briefcase, GraduationCap, Award, CalendarClock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Candidate { _id:string; name:string; email:string; phone?:string; resume?:string; coverLetter?:string; skills?:string[]; experience?:string; education?:string; }
interface Job { _id:string; title:string; department?:string; }
interface Branch { _id:string; name:string; city?:string; }
interface StatusEntry { status:string; note?:string; changedBy?:string; changedAt:string; }
interface Interview { _id:string; interviewDate:string; interviewTime:string; interviewType:string; location?:string; interviewer?:string; message?:string; status:string; }
interface AppDetail { _id:string; candidate:Candidate; job:Job; branch?:Branch; status:string; resumeUrl?:string; coverLetterUrl?:string; coverNote?:string; createdAt:string; statusHistory:StatusEntry[]; interview?:Interview; }

const STATUSES = ['Submitted','Under Review','Shortlisted','Interview Scheduled','Selected','Rejected'];
const STATUS_COLORS: Record<string,string> = {
  'Submitted':'bg-blue-100 text-blue-800','Under Review':'bg-yellow-100 text-yellow-800',
  'Shortlisted':'bg-emerald-100 text-emerald-800','Interview Scheduled':'bg-purple-100 text-purple-800',
  'Selected':'bg-green-100 text-green-800','Rejected':'bg-red-100 text-red-800',
};
const INTERVIEW_STATUS_COLORS: Record<string,string> = {
  Scheduled:'bg-purple-100 text-purple-800', Completed:'bg-green-100 text-green-800',
  Cancelled:'bg-red-100 text-red-800', Rescheduled:'bg-yellow-100 text-yellow-800',
};
const sc = (s:string) => STATUS_COLORS[s]||'bg-slate-100 text-slate-800';
const emptyForm = { interviewDate:'', interviewTime:'', interviewType:'Online', location:'', interviewer:'', message:'' };

export default function AppDetailPage() {
  const { id } = useParams();
  const [app, setApp] = useState<AppDetail|null>(null);
  const [loading, setLoading] = useState(true);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [iForm, setIForm] = useState(emptyForm);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { if (id) fetch(); }, [id]);
  const fetch = async () => {
    try { setLoading(true); const r = await api.get(`/admin/applications/${id}`); if (r.data?.success) setApp(r.data.data); }
    catch (e:any) { toast.error(e.response?.data?.message||'Failed to load'); }
    finally { setLoading(false); }
  };

  const scheduleInterview = async () => {
    if (!iForm.interviewDate || !iForm.interviewTime) return toast.error('Date and time required');
    try {
      setScheduling(true);
      await api.post('/admin/interviews', { application: id, ...iForm });
      toast.success('Interview scheduled'); setInterviewOpen(false); setIForm(emptyForm); fetch();
    } catch (e:any) { toast.error(e.response?.data?.message||'Failed'); }
    finally { setScheduling(false); }
  };

  const updateStatus = async () => {
    if (!newStatus) return;
    try {
      setUpdatingStatus(true);
      await api.put(`/admin/applications/${id}/status`, { status: newStatus, note: statusNote.trim() });
      toast.success('Status updated'); setStatusOpen(false); fetch();
    } catch (e:any) { toast.error(e.response?.data?.message||'Failed'); }
    finally { setUpdatingStatus(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-emerald-600"/></div>;
  if (!app) return (
    <div className="space-y-4">
      <Link href="/admin/applications" className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"><ArrowLeft className="h-4 w-4"/>Back</Link>
      <p className="text-slate-500">Application not found.</p>
    </div>
  );

  const { candidate, job, branch } = app;
  const resumeUrl = app.resumeUrl || candidate?.resume;
  const coverLetter = app.coverLetterUrl || app.coverNote || candidate?.coverLetter;
  const canSchedule = app.status === 'Shortlisted' || app.status === 'Interview Scheduled';

  return (
    <div className="space-y-6">
      <Link href="/admin/applications" className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"><ArrowLeft className="h-4 w-4"/>Back to Applications</Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{candidate?.name||'Application'}</h1>
          <p className="mt-1 text-sm text-slate-500">Applied for <strong>{job?.title||'Unknown'}</strong>{branch ? ` at ${branch.name}` : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={sc(app.status)}>{app.status}</Badge>
          <Button variant="outline" size="sm" onClick={()=>{ setNewStatus(app.status); setStatusNote(''); setStatusOpen(true); }}>Update Status</Button>
          {canSchedule && <Button onClick={()=>setInterviewOpen(true)} className="bg-emerald-600 hover:bg-emerald-700" size="sm"><CalendarClock className="mr-2 h-4 w-4"/>Schedule Interview</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-emerald-600"/>Candidate Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-slate-400"/><div><p className="text-xs font-medium text-slate-500">Email</p><p className="text-sm">{candidate?.email||'—'}</p></div></div>
                <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-slate-400"/><div><p className="text-xs font-medium text-slate-500">Phone</p><p className="text-sm">{candidate?.phone||'—'}</p></div></div>
              </div>
              <Separator/>
              <div className="flex items-start gap-3"><Award className="mt-0.5 h-4 w-4 text-slate-400 shrink-0"/>
                <div><p className="text-xs font-medium text-slate-500">Skills</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {candidate?.skills?.length ? candidate.skills.map((s,i)=><Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)
                                              : <span className="text-sm text-slate-400">No skills listed</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3"><Briefcase className="mt-0.5 h-4 w-4 text-slate-400 shrink-0"/><div><p className="text-xs font-medium text-slate-500">Experience</p><p className="text-sm whitespace-pre-wrap">{candidate?.experience||'—'}</p></div></div>
              <div className="flex items-start gap-3"><GraduationCap className="mt-0.5 h-4 w-4 text-slate-400 shrink-0"/><div><p className="text-xs font-medium text-slate-500">Education</p><p className="text-sm whitespace-pre-wrap">{candidate?.education||'—'}</p></div></div>
            </CardContent>
          </Card>

          {coverLetter && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-600"/>Cover Letter</CardTitle></CardHeader>
              <CardContent><div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{coverLetter}</div></CardContent>
            </Card>
          )}

          {app.interview && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CalendarClock className="h-5 w-5 text-emerald-600"/>Interview Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><p className="text-xs font-medium text-slate-500">Date</p><p className="text-sm">{new Date(app.interview.interviewDate).toLocaleDateString()}</p></div>
                  <div><p className="text-xs font-medium text-slate-500">Time</p><p className="text-sm">{app.interview.interviewTime}</p></div>
                  <div><p className="text-xs font-medium text-slate-500">Type</p><p className="text-sm">{app.interview.interviewType}</p></div>
                  <div><p className="text-xs font-medium text-slate-500">Location</p><p className="text-sm">{app.interview.location||'—'}</p></div>
                  <div><p className="text-xs font-medium text-slate-500">Interviewer</p><p className="text-sm">{app.interview.interviewer||'—'}</p></div>
                  <div><p className="text-xs font-medium text-slate-500">Status</p><Badge className={INTERVIEW_STATUS_COLORS[app.interview.status]||'bg-slate-100 text-slate-800'}>{app.interview.status}</Badge></div>
                </div>
                {app.interview.message && <div className="mt-4"><p className="text-xs font-medium text-slate-500">Message</p><p className="text-sm whitespace-pre-wrap mt-1">{app.interview.message}</p></div>}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Resume</CardTitle></CardHeader>
            <CardContent>
              {resumeUrl ? (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
                  <ExternalLink className="h-4 w-4"/>Open Resume
                </a>
              ) : <p className="text-sm text-slate-400">No resume uploaded</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Application Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Applied</span><span className="text-sm font-medium">{new Date(app.createdAt).toLocaleDateString()}</span></div>
              <Separator/>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Job</span><span className="text-sm font-medium text-right max-w-[180px] truncate">{job?.title||'—'}</span></div>
              <Separator/>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Branch</span><span className="text-sm font-medium">{branch?.name||'—'}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-emerald-600"/>Status Timeline</CardTitle></CardHeader>
            <CardContent>
              {app.statusHistory?.length ? (
                <div className="relative space-y-0">
                  {app.statusHistory.map((e,i)=>(
                    <div key={i} className="relative pb-6 last:pb-0">
                      {i < app.statusHistory.length-1 && <div className="absolute left-[7px] top-5 h-full w-0.5 bg-slate-200"/>}
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-4 w-4 rounded-full border-2 shrink-0 ${i===app.statusHistory.length-1?'border-emerald-600 bg-emerald-600':'border-slate-300 bg-white'}`}/>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className={sc(e.status)}>{e.status}</Badge>
                            <span className="text-xs text-slate-400">{new Date(e.changedAt).toLocaleString()}</span>
                          </div>
                          {e.note && <p className="mt-1 text-xs text-slate-500">{e.note}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-400">No history</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Interview Dialog */}
      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Schedule Interview</DialogTitle><CardDescription>For {candidate?.name}</CardDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Date *</Label><Input type="date" value={iForm.interviewDate} onChange={e=>setIForm({...iForm,interviewDate:e.target.value})}/></div>
              <div className="space-y-2"><Label>Time *</Label><Input type="time" value={iForm.interviewTime} onChange={e=>setIForm({...iForm,interviewTime:e.target.value})}/></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Type</Label>
                <Select value={iForm.interviewType} onValueChange={v=>setIForm({...iForm,interviewType:v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="On-site">On-site</SelectItem><SelectItem value="Online">Online</SelectItem><SelectItem value="Phone">Phone</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Location / Link</Label><Input value={iForm.location} onChange={e=>setIForm({...iForm,location:e.target.value})} placeholder="Room B or Zoom link"/></div>
            </div>
            <div className="space-y-2"><Label>Interviewer</Label><Input value={iForm.interviewer} onChange={e=>setIForm({...iForm,interviewer:e.target.value})} placeholder="Name"/></div>
            <div className="space-y-2"><Label>Message to Candidate</Label><Textarea value={iForm.message} onChange={e=>setIForm({...iForm,message:e.target.value})} rows={3} placeholder="Details..."/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setInterviewOpen(false)} disabled={scheduling}>Cancel</Button>
            <Button onClick={scheduleInterview} disabled={scheduling} className="bg-emerald-600 hover:bg-emerald-700">
              {scheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Update Application Status</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{STATUSES.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Note (optional)</Label><Textarea value={statusNote} onChange={e=>setStatusNote(e.target.value)} rows={3} placeholder="Add a note..."/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setStatusOpen(false)} disabled={updatingStatus}>Cancel</Button>
            <Button onClick={updateStatus} disabled={updatingStatus} className="bg-emerald-600 hover:bg-emerald-700">
              {updatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
