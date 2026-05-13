'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye, RefreshCw, Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Application {
  _id: string;
  candidateName?: string;
  candidateEmail?: string;
  candidate?: { _id:string; name:string; email:string; phone?:string; resume?:string; };
  job?: { _id:string; title:string; } | string;
  branch?: { _id:string; name:string; } | string;
  status: string;
  resumeUrl?: string;
  createdAt: string;
}
interface Job { _id:string; title:string; }
interface Pagination { currentPage:number; totalPages:number; }

// MUST match backend enum exactly - these are spaced strings
const STATUSES = ['Submitted','Under Review','Shortlisted','Interview Scheduled','Selected','Rejected'];
const STATUS_COLORS: Record<string,string> = {
  'Submitted':'bg-blue-100 text-blue-800',
  'Under Review':'bg-yellow-100 text-yellow-800',
  'Shortlisted':'bg-emerald-100 text-emerald-800',
  'Interview Scheduled':'bg-purple-100 text-purple-800',
  'Selected':'bg-green-100 text-green-800',
  'Rejected':'bg-red-100 text-red-800',
};
const sc = (s:string) => STATUS_COLORS[s]||'bg-slate-100 text-slate-800';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ currentPage:1, totalPages:1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application|null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (jobFilter !== 'all') params.job = jobFilter;
      if (search.trim()) params.search = search.trim();
      const r = await api.get('/admin/applications', { params });
      if (r.data?.success) {
        setApplications(r.data.data||[]);
        setPagination(r.data.pagination||{currentPage:1,totalPages:1});
      }
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  }, [page, statusFilter, jobFilter, search]);

  useEffect(() => { fetchApps(); }, [fetchApps]);
  useEffect(() => {
    api.get('/jobs',{params:{limit:100}}).then(r=>{ if(r.data?.success) setJobs(r.data.data||[]); }).catch(()=>{});
  }, []);

  const openStatus = (app: Application) => { setSelectedApp(app); setNewStatus(app.status); setAdminNote(''); setStatusDialogOpen(true); };
  const handleUpdate = async () => {
    if (!selectedApp || !newStatus) return;
    try {
      setUpdating(true);
      await api.put(`/admin/applications/${selectedApp._id}/status`, { status: newStatus, note: adminNote.trim() });
      toast.success('Status updated'); setStatusDialogOpen(false); fetchApps();
    } catch (e:any) { toast.error(e.response?.data?.message||'Failed'); }
    finally { setUpdating(false); }
  };

  const getName = (app: Application) => app.candidateName || (typeof app.candidate==='object' && app.candidate ? app.candidate.name : 'Unknown');
  const getEmail = (app: Application) => app.candidateEmail || (typeof app.candidate==='object' && app.candidate ? app.candidate.email : '—');
  const getJob = (app: Application) => typeof app.job==='object' && app.job ? (app.job as any).title : '—';
  const getBranch = (app: Application) => typeof app.branch==='object' && app.branch ? (app.branch as any).name : '—';
  const getResume = (app: Application) => app.resumeUrl || (typeof app.candidate==='object' && app.candidate?.resume ? app.candidate.resume : null);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Manage Applications</h1><p className="mt-1 text-sm text-slate-500">Review and update application statuses</p></div>
      <Card><CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-slate-500">Search</Label>
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
              <Input placeholder="Name or email..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="pl-9"/>
            </div>
          </div>
          <div className="w-full sm:w-52 space-y-1.5">
            <Label className="text-xs text-slate-500">Status</Label>
            <Select value={statusFilter} onValueChange={v=>{setStatusFilter(v);setPage(1);}}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48 space-y-1.5">
            <Label className="text-xs text-slate-500">Job</Label>
            <Select value={jobFilter} onValueChange={v=>{setJobFilter(v);setPage(1);}}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map(j=><SelectItem key={j._id} value={j._id}>{j.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" onClick={fetchApps}><RefreshCw className="h-4 w-4"/></Button>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600"/></div> : (
        <div className="overflow-x-auto"><Table>
          <TableHeader><TableRow>
            <TableHead>Candidate</TableHead><TableHead>Email</TableHead><TableHead>Job</TableHead>
            <TableHead>Branch</TableHead><TableHead>Status</TableHead><TableHead>Resume</TableHead>
            <TableHead>Applied</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {applications.length===0 ? (
              <TableRow><TableCell colSpan={8} className="h-32 text-center text-slate-500">
                <div className="flex flex-col items-center gap-2"><FileText className="h-8 w-8 text-slate-300"/><p>No applications found</p></div>
              </TableCell></TableRow>
            ) : applications.map(app => {
              const resume = getResume(app);
              return (
                <TableRow key={app._id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/applications/${app._id}`} className="text-emerald-600 hover:underline">{getName(app)}</Link>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">{getEmail(app)}</TableCell>
                  <TableCell className="text-slate-600">{getJob(app)}</TableCell>
                  <TableCell className="text-slate-600">{getBranch(app)}</TableCell>
                  <TableCell><Badge className={sc(app.status)}>{app.status}</Badge></TableCell>
                  <TableCell>
                    {resume ? <a href={resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"><Eye className="h-3.5 w-3.5"/>View</a>
                             : <span className="text-xs text-slate-400">N/A</span>}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/applications/${app._id}`}>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-emerald-600"><Eye className="mr-1 h-4 w-4"/>View</Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={()=>openStatus(app)} className="text-slate-500 hover:text-emerald-600">
                        <RefreshCw className="mr-1 h-4 w-4"/>Status
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table></div>)}
      </CardContent></Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {pagination.currentPage} of {pagination.totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={pagination.currentPage<=1}><ChevronLeft className="h-4 w-4 mr-1"/>Prev</Button>
            <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.min(pagination.totalPages,p+1))} disabled={pagination.currentPage>=pagination.totalPages}>Next<ChevronRight className="h-4 w-4 ml-1"/></Button>
          </div>
        </div>
      )}

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Update Application Status</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <Badge className={sc(selectedApp?.status||'')}>{selectedApp?.status}</Badge>
            </div>
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{STATUSES.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea value={adminNote} onChange={e=>setAdminNote(e.target.value)} placeholder="Add a note..." rows={3}/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setStatusDialogOpen(false)} disabled={updating}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating} className="bg-emerald-600 hover:bg-emerald-700">
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
