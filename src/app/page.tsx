'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Building2, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Multi-Branch Recruitment & Applicant Tracking System
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
              Streamline your hiring process across multiple branches. Post jobs, manage applicants, schedule interviews, and track applications — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link href="/register">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg w-full sm:w-auto">
                      <UserCheck className="mr-2 h-5 w-5" /> I&apos;m a Candidate
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-slate-400 text-white hover:bg-slate-700 px-8 py-6 text-lg w-full sm:w-auto">
                      <ShieldCheck className="mr-2 h-5 w-5" /> I&apos;m HR / Admin
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {user?.role === 'candidate' && (
                    <Link href="/candidate/profile">
                      <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
                        Go to My Profile <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link href="/admin/dashboard">
                      <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
                        Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">For Candidates</h3>
              <ul className="space-y-2 text-slate-600">
                <li>Create your professional profile</li>
                <li>Upload resume (PDF) to Cloudinary</li>
                <li>Write cover letters (plain text)</li>
                <li>Apply for jobs across branches</li>
                <li>Track application status in real-time</li>
                <li>View interview details when scheduled</li>
              </ul>
            </div>
            <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">For HR / Admin</h3>
              <ul className="space-y-2 text-slate-600">
                <li>Dashboard with hiring pipeline stats</li>
                <li>Post and manage job openings</li>
                <li>Review applications from all branches</li>
                <li>Shortlist or reject candidates</li>
                <li>Schedule interviews (On-site/Online/Phone)</li>
                <li>Manage company branches</li>
              </ul>
            </div>
            <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Multi-Branch Support</h3>
              <ul className="space-y-2 text-slate-600">
                <li>Islamabad Office</li>
                <li>Lahore Office</li>
                <li>Karachi Office</li>
                <li>Remote Positions</li>
                <li>Each branch with dedicated contact info</li>
                <li>Jobs linked to specific branches</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-8 text-lg">Browse open positions or create an account to start applying.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 w-full sm:w-auto">
                <Briefcase className="mr-2 h-5 w-5" /> Browse Jobs
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-slate-400 text-white hover:bg-slate-700 px-8 w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
