


"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AuthPage from '@/components/AuthModal';
import RecruiterDashboard, { Application } from '@/components/RecruiterDashboard';
import SeekerDashboard from '@/components/SeekerDashboard';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { toast } from 'react-hot-toast';
import ProfileWindow from '@/components/Profile/ProfileWindow';
import { TrendingUp } from 'lucide-react';
import { DashboardView } from '@/components/types';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  description: string; 
  likes: number;       
}
// 
// const API_URL = "http://localhost:8001";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // 'seeker' or 'recruiter'
  const [activeTab, setActiveTab] = useState<"seeker" | "recruiter">("seeker");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Navigation & Counter State Layout Linkages
  const [currentView, setCurrentView] = useState<DashboardView>("discover"); 
  const [savedCount, setSavedCount] = useState<number>(0);             
  const [appliedCount, setAppliedCount] = useState<number>(0);

  // Live Update Notification Items Array
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; timestamp: string }>>([
    { id: 1, message: "Welcome to your clean dashboard operational timeline matrix.", timestamp: "Just Now" }
  ]);

  // 1. Fetch Job Positions Map List
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

  // 2. Fetch Recruiter Applications Vector Queue
  const fetchApplications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/recruiter/applications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
        
        if (userRole === "seeker") {
          setAppliedCount(data.length);
        }
      }
    } catch (err) {
      console.error("Applications trace down node failed:", err);
    }
  }, [token, userRole]);

  // 3. Mutate Candidate Profile Application Status State Loop
  const handleUpdateStatus = async (appId: string, status: 'Shortlisted' | 'Rejected') => {
    try {
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status } : app));
      toast.success(`Application state mutated to ${status} successfully!`);
      
      setNotifications(prev => [
        { id: Date.now(), message: `Application reference ID ${appId} was marked as ${status}.`, timestamp: "1s ago" },
        ...prev
      ]);
    } catch (err) {
      toast.error("Failed to push status mutation cluster.");
    }
  };

  // Synchronize component data lifecycle chains
  useEffect(() => {
    const initializeDataPipeline = async () => {
      await fetchJobs();
      if (token) {
        await fetchApplications();
      }
    };
    initializeDataPipeline();
  }, [token, userRole, fetchJobs, fetchApplications]);

  // Handle Login Event Matrix Handshake
  const handleLoginSuccess = (role: string, userToken: string) => {
    setToken(userToken);
    setUserRole(role);
    setActiveTab(role as "seeker" | "recruiter");
    setCurrentView(role === "recruiter" ? ("dashboard" as DashboardView) : ("discover" as DashboardView));
    toast.success(`Authenticated securely as a system ${role}!`);
  };

  // Session Cleanup Primitives
  const handleLogout = () => {
    setToken(null);
    setUserRole(null);
    setApplications([]);
    setAppliedCount(0);
    setSavedCount(0);
    setCurrentView("discover");
    toast.success("Token session evicted safely.");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Core Workspace View Frame */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col justify-center my-6">
        {!token ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
            <div className="lg:col-span-7 space-y-6 text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                <TrendingUp className="h-3.5 w-3.5" /> Hire
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
          /* Active Authorized Client Session Stream */
          <div className="space-y-6 flex-1 flex flex-col animate-in fade-in duration-500">
            
            {/* Integrated Main Navbar Router */}
            <Navbar
              currentView={currentView}
              setCurrentView={(view) => {
                setCurrentView(view);
                if (view === 'profile' && userRole === 'recruiter') {
                  setActiveTab('recruiter');
                } else if (userRole === 'seeker') {
                  setActiveTab('seeker');
                }
              }}
              savedCount={savedCount}
              appliedCount={appliedCount}
              notifications={notifications}
              onClearNotifications={() => setNotifications([])}
              onLogout={handleLogout}
            />

            {/* Dynamic Application Frame Context Router */}
            <div className="flex-1 min-h-0 bg-white/[0.02] dark:bg-slate-950/20 backdrop-blur-md rounded-2xl border border-slate-200/10 dark:border-white/5 p-4 sm:p-6 overflow-y-auto">
              {currentView === 'profile' ? (
                /* Injected token mapping to prevent API profile authorization fallbacks */
                <ProfileWindow
                  token={token}
                  onSave={(updatedProfile) => {
                    // toast.success("Vector configuration profile updated successfully!");
                    console.log("Vector payload mapped successfully: ", updatedProfile);
                  }}
                />
              ) : activeTab === "recruiter" ? (
                <RecruiterDashboard
                  token={token}
                  jobsCount={jobs.length}
                  applications={applications}
                  onJobPosted={() => {
                    fetchJobs();
                    fetchApplications(); 
                  }}
                  onUpdateStatus={handleUpdateStatus}
                />
              ) : (
                <SeekerDashboard 
                  Job_see={jobs} 
                  token={token} 
                  API_URL={API_URL}
                />
              )}
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}