'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, Briefcase, User, LayoutDashboard, FileText, Building2, Users } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setOpen(false);
  };

  const navLinks = (
    <>
      <Link href="/" className="text-slate-300 hover:text-white transition-colors text-sm" onClick={() => setOpen(false)}>
        Home
      </Link>
      <Link href="/jobs" className="text-slate-300 hover:text-white transition-colors text-sm" onClick={() => setOpen(false)}>
        Jobs
      </Link>

      {!mounted ? null : !isAuthenticated ? (
        <>
          <Link href="/login" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Login
            </Button>
          </Link>
          <Link href="/register" onClick={() => setOpen(false)}>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              Register
            </Button>
          </Link>
        </>
      ) : user?.role === 'candidate' ? (
        <>
          <Link href="/candidate/applications" className="text-slate-300 hover:text-white transition-colors text-sm" onClick={() => setOpen(false)}>
            My Applications
          </Link>
          <Link href="/candidate/profile" className="text-slate-300 hover:text-white transition-colors text-sm" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-slate-800">
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </>
      ) : user?.role === 'admin' ? (
        <>
          <Link href="/admin/dashboard" className="text-slate-300 hover:text-white transition-colors text-sm" onClick={() => setOpen(false)}>
            <LayoutDashboard className="h-4 w-4 inline mr-1" /> Dashboard
          </Link>
          <Link href="/admin/jobs" className="text-slate-300 hover:text-white transition-colors text-sm" onClick={() => setOpen(false)}>
            <Briefcase className="h-4 w-4 inline mr-1" /> Jobs
          </Link>
          <Link href="/admin/applications" className="text-slate-300 hover:text-white transition-colors text-sm" onClick={() => setOpen(false)}>
            <FileText className="h-4 w-4 inline mr-1" /> Applications
          </Link>
          <Link href="/admin/interviews" className="text-slate-300 hover:text-white transition-colors text-sm" onClick={() => setOpen(false)}>
            <Users className="h-4 w-4 inline mr-1" /> Interviews
          </Link>
          <Link href="/admin/branches" className="text-slate-300 hover:text-white transition-colors text-sm" onClick={() => setOpen(false)}>
            <Building2 className="h-4 w-4 inline mr-1" /> Branches
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-slate-800">
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </>
      ) : null}
    </>
  );

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-500" />
            <span className="text-white font-bold text-xl">ATS Portal</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks}
          </div>

          {/* Mobile nav */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-900 border-slate-800 w-64">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
