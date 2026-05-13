'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Building2,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface Branch {
  _id: string;
  name: string;
  location: string;
  city: string;
  contactPhone?: string;
  contactEmail?: string;
  isRemote?: boolean;
  isActive?: boolean;
}

interface BranchFormData {
  name: string;
  location: string;
  city: string;
  contactPhone: string;
  contactEmail: string;
  isRemote: boolean;
}

const emptyForm: BranchFormData = {
  name: '',
  location: '',
  city: '',
  contactPhone: '',
  contactEmail: '',
  isRemote: false,
};

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchFormData>(emptyForm);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/branches', { params: { all: true } });
      if (res.data?.success) {
        setBranches(res.data.data || []);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load branches';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingBranch(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      location: branch.location || '',
      city: branch.city || '',
      contactPhone: branch.contactPhone || '',
      contactEmail: branch.contactEmail || '',
      isRemote: branch.isRemote || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        city: form.city.trim(),
        contactPhone: form.contactPhone.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        isRemote: form.isRemote,
      };

      if (editingBranch) {
        await api.put(`/branches/${editingBranch._id}`, payload);
        toast.success('Branch updated successfully');
      } else {
        await api.post('/branches', payload);
        toast.success('Branch created successfully');
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditingBranch(null);
      fetchBranches();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save branch';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBranch) return;
    try {
      await api.delete(`/branches/${deletingBranch._id}`);
      toast.success('Branch deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingBranch(null);
      fetchBranches();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete branch';
      toast.error(message);
    }
  };

  const filteredBranches = branches.filter((branch) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      branch.name.toLowerCase().includes(q) ||
      branch.city?.toLowerCase().includes(q) ||
      branch.location?.toLowerCase().includes(q) ||
      branch.contactEmail?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Branch Management</h1>
          <p className="mt-1 text-sm text-slate-500">Add and manage company branches</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search branches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchBranches} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Branches Table */}
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
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Is Remote</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <Building2 className="h-8 w-8 text-slate-300" />
                          <p>No branches found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBranches.map((branch) => (
                      <TableRow key={branch._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {branch.name}
                            {branch.isActive === false && (
                              <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-500">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{branch.city || '—'}</TableCell>
                        <TableCell className="text-slate-600 max-w-[200px] truncate">
                          {branch.location || '—'}
                        </TableCell>
                        <TableCell className="text-slate-600">{branch.contactPhone || '—'}</TableCell>
                        <TableCell className="text-slate-600">{branch.contactEmail || '—'}</TableCell>
                        <TableCell>
                          {branch.isRemote ? (
                            <Badge className="bg-emerald-100 text-emerald-800">Remote</Badge>
                          ) : (
                            <Badge variant="outline">On-site</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(branch)}
                              className="h-8 w-8 text-slate-500 hover:text-emerald-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingBranch(branch);
                                setDeleteDialogOpen(true);
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="branchName">Name *</Label>
              <Input
                id="branchName"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Headquarters"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branchCity">City</Label>
                <Input
                  id="branchCity"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchLocation">Location</Label>
                <Input
                  id="branchLocation"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. 123 Main St"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branchPhone">Contact Phone</Label>
                <Input
                  id="branchPhone"
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchEmail">Contact Email</Label>
                <Input
                  id="branchEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="branch@company.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Checkbox
                id="branchRemote"
                checked={form.isRemote}
                onCheckedChange={(checked) =>
                  setForm({ ...form, isRemote: checked === true })
                }
              />
              <div>
                <Label htmlFor="branchRemote" className="cursor-pointer">
                  Is Remote
                </Label>
                <p className="text-xs text-slate-500">
                  Mark this branch as a remote-only location
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingBranch ? 'Update Branch' : 'Create Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Branch
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{deletingBranch?.name}</strong>? This will
            deactivate the branch. Existing jobs linked to this branch will not be removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
