'use client';

import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_LINKS = [
  { href: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidate/profile', label: 'Profile', icon: User },
  { href: '/candidate/applications', label: 'My Applications', icon: FileText },
] as const;

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <ProtectedRoute requiredRole="candidate">
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* ── Top Navigation Bar ──────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 flex items-center justify-between h-14">
            {/* Brand */}
            <Link href="/candidate/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-slate-900 hidden sm:inline">ATS Portal</span>
            </Link>

            {/* Center Navigation Tabs */}
            <nav className="flex items-center gap-1 mx-4 overflow-x-auto">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePicture} alt={user?.name ?? ''} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePicture} alt={user?.name ?? ''} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/candidate/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Page Content ────────────────────────────────────────────── */}
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
