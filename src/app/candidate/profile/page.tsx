'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  Loader2,
  Save,
  Camera,
  FileUp,
  ExternalLink,
  X,
  CheckCircle2,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Sparkles,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────── */
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  profilePicture?: string;
  resume?: string;
  coverLetter?: string;
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function CandidateProfile() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    skills: [],
    experience: '',
    education: '',
  });
  const [coverLetter, setCoverLetter] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [savingCoverLetter, setSavingCoverLetter] = useState(false);

  const pictureInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch profile ──────────────────────────────────────────────── */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/candidate/profile');
      const data = response.data.data;
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        skills: data.skills || [],
        experience: data.experience || '',
        education: data.education || '',
        profilePicture: data.profilePicture || '',
        resume: data.resume || '',
        coverLetter: data.coverLetter || '',
      });
      setCoverLetter(data.coverLetter || '');
      setSkillsInput((data.skills || []).join(', '));
      updateUser(data);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Save profile text fields ───────────────────────────────────── */
  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await api.put('/candidate/profile', {
        name: profile.name,
        phone: profile.phone,
        skills,
        experience: profile.experience,
        education: profile.education,
      });

      const updatedUser = response.data.data;
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /* ── Upload profile picture ─────────────────────────────────────── */
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.put('/candidate/profile/picture', formData);
      const updated = response.data.data;
      setProfile((prev) => ({ ...prev, profilePicture: updated.profilePicture }));
      updateUser({ profilePicture: updated.profilePicture });
      toast.success('Profile picture updated');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to upload picture');
    } finally {
      setUploadingPicture(false);
      if (pictureInputRef.current) pictureInputRef.current.value = '';
    }
  };

  /* ── Upload resume ──────────────────────────────────────────────── */
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.put('/candidate/resume', formData);
      const updated = response.data.data;
      setProfile((prev) => ({ ...prev, resume: updated.resume }));
      updateUser({ resume: updated.resume });
      toast.success('Resume uploaded successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  /* ── Save cover letter ──────────────────────────────────────────── */
  const handleSaveCoverLetter = async () => {
    setSavingCoverLetter(true);
    try {
      await api.put('/candidate/cover-letter', { coverLetter });
      setProfile((prev) => ({ ...prev, coverLetter }));
      updateUser({ coverLetter });
      toast.success('Cover letter saved');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save cover letter');
    } finally {
      setSavingCoverLetter(false);
    }
  };

  /* ── Helpers ────────────────────────────────────────────────────── */
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const parsedSkills = skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  /* ── Loading state ──────────────────────────────────────────────── */
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-0.5">
          Manage your personal information and documents
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ═══════════════════════════════════════════════════════════════
            LEFT COLUMN — Avatar, Resume, Cover Letter
           ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* ── Profile Picture ──────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-28 w-28 ring-4 ring-slate-100">
                  <AvatarImage
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-3xl font-semibold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Hover overlay */}
                <button
                  type="button"
                  onClick={() => pictureInputRef.current?.click()}
                  disabled={uploadingPicture}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                >
                  {uploadingPicture ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>

              <input
                ref={pictureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureUpload}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => pictureInputRef.current?.click()}
                disabled={uploadingPicture}
              >
                {uploadingPicture ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {profile.profilePicture ? 'Change Photo' : 'Upload Photo'}
              </Button>

              <p className="text-xs text-slate-400">JPG, PNG or GIF. Max 5 MB.</p>
            </CardContent>
          </Card>

          {/* ── Resume ──────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Resume
              </CardTitle>
              <CardDescription>PDF format only, max 5 MB</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.resume ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-emerald-700">Resume uploaded</p>
                  </div>
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 hover:underline font-medium shrink-0"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <FileText className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700">Not uploaded</p>
                </div>
              )}

              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleResumeUpload}
              />

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResume}
              >
                {uploadingResume ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileUp className="h-4 w-4 mr-2" />
                )}
                {profile.resume ? 'Replace Resume' : 'Upload Resume'}
              </Button>
            </CardContent>
          </Card>

          {/* ── Cover Letter ────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cover Letter</CardTitle>
              <CardDescription>
                This will be attached to your applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Write your cover letter here..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={10}
                className="resize-none focus-visible:ring-emerald-500"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {coverLetter.length} characters
                </span>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSaveCoverLetter}
                  disabled={savingCoverLetter}
                >
                  {savingCoverLetter ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Cover Letter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT COLUMN — Profile Edit Form
           ═══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Personal Information ──────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>
                Update your details. These will be visible to recruiters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name + Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-red-500" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    className="focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email
                  </Label>
                  <Input id="email" value={profile.email} disabled className="bg-slate-50 text-slate-500" />
                </div>
              </div>

              {/* Phone + Skills */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills" className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                    Skills (comma-separated)
                  </Label>
                  <Input
                    id="skills"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, Node.js, Python..."
                    className="focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Skills Preview */}
              {parsedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {parsedSkills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator />

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  Experience
                </Label>
                <Textarea
                  id="experience"
                  value={profile.experience}
                  onChange={(e) => setProfile((prev) => ({ ...prev, experience: e.target.value }))}
                  placeholder="Describe your work experience..."
                  rows={4}
                  className="resize-none focus-visible:ring-emerald-500"
                />
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label htmlFor="education" className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  Education
                </Label>
                <Textarea
                  id="education"
                  value={profile.education}
                  onChange={(e) => setProfile((prev) => ({ ...prev, education: e.target.value }))}
                  placeholder="Describe your educational background..."
                  rows={4}
                  className="resize-none focus-visible:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={fetchProfile} disabled={saving}>
                  Reset
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
