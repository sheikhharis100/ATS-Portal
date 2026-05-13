'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search, Briefcase, AlertTriangle } from 'lucide-react';
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

interface Branch { _id: string; name: string; city: string; }
interface Job {
  _id: string; title: string; description: string; department: string;
  branch: Branch | string; employmentType: string; experienceLevel: string;
  salaryMin: number; salaryMax: number; availableSeats: number;
  skills: string[]; deadline: string; status: string;
}

// Must match backend schema enums EXACTLY
const EMPLOYMENT_TYPES = ['Full-time','Part-time','Contract','Internship','Remote'];
const EXPERIENCE_LEVELS = ['Entry Level','Mid Level','Senior Level','Lead','Manager'];
const JOB_STATUSES = ['Open','Closed','Paused'];
const STATUS_COLORS: Record<string,string> = {
  Open:'bg-emerald-100 text-emerald-800', Closed:'bg-red-100 text-red-800', Paused:'bg-yellow-100 text-yellow-800'
};

interface JobForm {
  title:string; description:string; department:string; branch:string;
  employmentType:string; experienceLevel:string; salaryMin:string; salaryMax:string;
  availableSeats:string; skills:string; deadline:string; status:string;
}
const emptyForm: JobForm = {
  title:'',description:'',department:'',branch:'',
  employmentType:'Full-time',experienceLevel:'Entry Level',
  salaryMin:'',salaryMax:'',availableSeats:'1',skills:'',deadline:'',status:'Open'
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job|null>(null);
  const [deletingJob, setDeletingJob] = useState<Job|null>(null);
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = () => { fetchJobs(); fetchBranches(); };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const r = await api.get('/jobs', { params: { limit: 200, status: 'all' } });
      if (r.data?.success) setJobs(r.data.data || []);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  const fetchBranches = async () => {
    try {
      const r = await api.get('/branches');
      if (r.data?.success) setBranches(r.data.data || []);
    } catch {}
  };

  const openCreate = () => { setEditingJob(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      title: job.title, description: job.description||'', department: job.department||'',
      branch: typeof job.branch==='object' ? job.branch._id : job.branch||'',
      employmentType: job.employmentType||'Full-time',
      experienceLevel: job.experienceLevel||'Entry Level',
      salaryMin: job.salaryMin?.toString()||'', salaryMax: job.salaryMax?.toString()||'',
      availableSeats: job.availableSeats?.toString()||'1',
      skills: job.skills?.join(', ')||'',
      deadline: job.deadline ? job.deadline.split('T')[0] : '',
      status: job.status||'Open',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Title required');
    if (!form.department.trim()) return toast.error('Department required');
    if (!form.branch) return toast.error('Select a branch');
    if (!form.deadline) return toast.error('Deadline required');
    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(), description: form.description.trim(),
        department: form.department.trim(), branch: form.branch,
        employmentType: form.employmentType, experienceLevel: form.experienceLevel,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : 0,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : 0,
        availableSeats: Number(form.availableSeats)||1,
        skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean),
        deadline: form.deadline, status: form.status,
      };
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, payload);
        toast.success('Job updated');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job created');
      }
      setDialogOpen(false); setEditingJob(null); setForm(emptyForm); fetchJobs();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save job');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deletingJob) return;
    try {
      await api.delete(`/jobs/${deletingJob._id}`);
      toast.success('Job deleted'); setDeleteDialogOpen(false); setDeletingJob(null); fetchJobs();
    } catch { toast.error('Failed to delete'); }
  };

  const branchName = (b: Branch|string) => typeof b==='object' ? b.name : (branches.find(x=>x._id===b)?.name||'—');
  const filtered = jobs.filter(j => !search.trim() || j.title.toLowerCase().includes(search.toLowerCase()) || j.department?.toLowerCase().includes(search.toLowerCase()) || branchName(j.branch).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Manage Jobs</h1><p className="mt-1 text-sm text-slate-500">Create, edit, and manage job postings</p></div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="mr-2 h-4 w-4"/>Add New Job</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
        <Input placeholder="Search jobs..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9"/>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600"/></div> : (
        <div className="overflow-x-auto"><Table>
          <TableHeader><TableRow>
            <TableHead>Title</TableHead><TableHead>Dept</TableHead><TableHead>Branch</TableHead>
            <TableHead>Type</TableHead><TableHead>Seats</TableHead><TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.length===0 ? (
              <TableRow><TableCell colSpan={8} className="h-32 text-center text-slate-500">
                <div className="flex flex-col items-center gap-2"><Briefcase className="h-8 w-8 text-slate-300"/><p>No jobs found</p></div>
              </TableCell></TableRow>
            ) : filtered.map(job => (
              <TableRow key={job._id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell className="text-slate-600">{job.department||'—'}</TableCell>
                <TableCell className="text-slate-600">{branchName(job.branch)}</TableCell>
                <TableCell className="text-slate-600">{job.employmentType||'—'}</TableCell>
                <TableCell>{job.availableSeats}</TableCell>
                <TableCell><Badge className={STATUS_COLORS[job.status]||'bg-slate-100 text-slate-800'}>{job.status}</Badge></TableCell>
                <TableCell className="text-slate-600">{job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={()=>openEdit(job)} className="h-8 w-8 text-slate-500 hover:text-emerald-600"><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={()=>{setDeletingJob(job);setDeleteDialogOpen(true)}} className="h-8 w-8 text-slate-500 hover:text-red-600"><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></div>)}
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingJob ? 'Edit Job' : 'Add New Job'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. React Developer"/></div>
              <div className="space-y-2"><Label>Department *</Label><Input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="e.g. Engineering"/></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={4} placeholder="Job description..."/></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Branch *</Label>
                <Select value={form.branch} onValueChange={v=>setForm({...form,branch:v})}>
                  <SelectTrigger><SelectValue placeholder="Select branch"/></SelectTrigger>
                  <SelectContent>{branches.map(b=><SelectItem key={b._id} value={b._id}>{b.name} — {b.city}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Employment Type</Label>
                <Select value={form.employmentType} onValueChange={v=>setForm({...form,employmentType:v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{EMPLOYMENT_TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Experience Level</Label>
                <Select value={form.experienceLevel} onValueChange={v=>setForm({...form,experienceLevel:v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{EXPERIENCE_LEVELS.map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Salary Min</Label><Input type="number" value={form.salaryMin} onChange={e=>setForm({...form,salaryMin:e.target.value})} placeholder="50000"/></div>
              <div className="space-y-2"><Label>Salary Max</Label><Input type="number" value={form.salaryMax} onChange={e=>setForm({...form,salaryMax:e.target.value})} placeholder="150000"/></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Available Seats</Label><Input type="number" min="1" value={form.availableSeats} onChange={e=>setForm({...form,availableSeats:e.target.value})}/></div>
              <div className="space-y-2"><Label>Deadline *</Label><Input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={v=>setForm({...form,status:v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{JOB_STATUSES.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Skills (comma-separated)</Label><Input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="React, Node.js, MongoDB"/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{editingJob ? 'Update Job' : 'Create Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500"/>Delete Job</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Delete <strong>{deletingJob?.title}</strong>? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
