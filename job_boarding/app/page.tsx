
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AuthPage from '@/components/AuthModal';
import RecruiterDashboard, { Application } from '@/components/RecruiterDashboard';
import SeekerDashboard from '@/components/SeekerDashboard';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { toast } from 'react-hot-toast';
import {
  Briefcase,
  UserCheck,
  LogOut,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Fingerprint,
  User
} from 'lucide-react';
import { DashboardView } from '@/components/types';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
}

const API_URL = "http://localhost:8001";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // 'seeker' or 'recruiter'
  const [activeTab, setActiveTab] = useState<"seeker" | "recruiter">("seeker");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentView, setCurrentView] = useState("dashboard"); // Default view state
const [savedCount, setSavedCount] = useState(0);             // Default count
const [appliedCount, setAppliedCount] = useState(0);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`);
      if (!res.ok) throw new Error("Data retrieval state mapping failed");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Critical fetching rejection caught:", err);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/applications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Applications trace down node failed:", err);
    }
  }, [token]);

  const handleUpdateStatus = async (appId: string, status: 'Shortlisted' | 'Rejected') => {
    try {
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status } : app));
      toast.success(`Application state mutated to ${status}`);
    } catch (err) {
      toast.error("Failed to push status mutation cluster.");
    }
  };

  useEffect(() => {
    const initializeDataPipeline = async () => {
      await fetchJobs();
      if (token && userRole === "recruiter") {
        await fetchApplications();
      }
    };
    initializeDataPipeline();
  }, [token, userRole, fetchJobs, fetchApplications]);

  const handleLoginSuccess = (role: string, userToken: string) => {
    setToken(userToken);
    setUserRole(role);
    setActiveTab(role as "seeker"); // Automatically land on native default path
  };

  const handleLogout = () => {
    setToken(null);
    setUserRole(null);
    setApplications([]);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white ">
      {/* Lighting Background effects */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />



      {/* Main Workspace Frame */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col justify-center ">
        {!token ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                <TrendingUp className="h-3.5 w-3.5" /> Core Network Indices Active
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Automated clusters for <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">matching talent</span> instantly.
              </h1>
              <p className="text-base text-slate-400 font-medium leading-relaxed">
                Connect directly into raw production indices. Post open roles across high-fidelity clusters or parse metrics with instant validation primitives built-in.
              </p>
            </div>
            <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
              <div className="w-full sm:max-w-[580px] min-h-[380px] p-6 sm:p-8 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <AuthPage onLoginSuccess={handleLoginSuccess} API_URL={API_URL} />
              </div>
            </div>
          </div>
        ) : (
          /* Active Client Session Interface */
          <div className="space-y-6 animate-in fade-in duration-500">

            {/* INTERFACE SWITCH BUTTON SYSTEM FOR DISCOVERY & RECRUITMENT */}


            {/* Display View Node based on tab */}

            {activeTab === "recruiter" ? (


        <>
  {/* The Navbar stays fixed at the top */}
  <Navbar
    currentView={currentView as DashboardView}
    setCurrentView={setCurrentView}
    savedCount={savedCount}
    appliedCount={appliedCount}
  />

  {/* Wrap your dashboard in a container with padding-top to account for the fixed nav */}
  <div className="pt-10 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <RecruiterDashboard
        token={token}
        jobsCount={jobs.length}
        applications={applications}
        onJobPosted={fetchJobs}
        onUpdateStatus={handleUpdateStatus}
      />
    </main>
  </div>
</>
            
            ) : (
              <>
              
                  <Navbar
                  currentView={currentView as DashboardView}
                  setCurrentView={setCurrentView}
                  savedCount={savedCount}
                  appliedCount={appliedCount}
                />
                  <SeekerDashboard Job_see={jobs} token={token} API_URL={API_URL} />
                </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}




