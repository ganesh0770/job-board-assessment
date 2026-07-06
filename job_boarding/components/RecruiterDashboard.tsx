"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Briefcase, Users, Plus, FileText, CheckCircle, X } from 'lucide-react';
const API_URL = "http://localhost:8001";
// Explicit type definitions converted to valid TypeScript interfaces
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  shiftType: 'Day' | 'Night' | 'Flexible';
  location: string;
  salary: string;
  postedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  seekerEmail: string;
  coverLetter: string;
  appliedAt: string;
  status: 'Pending' | 'Shortlisted' | 'Rejected';
}

interface RecruiterDashboardProps {
  token: string;
  jobsCount: number;
  applications: Application[];
  onJobPosted: () => void;
  onUpdateStatus: (appId: string, status: 'Shortlisted' | 'Rejected') => void;
}

export default function RecruiterDashboard({ token, jobsCount, applications, onJobPosted, onUpdateStatus }: RecruiterDashboardProps) {
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: 'Globalco Ltd',
    location: 'Hitech City, Hyderabad (Onsite)',
    salary: '',
    type: 'Full-time',
    tags: ''
  });

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // const res = await );
      const res = await fetch(`${API_URL}/api/jobs/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newJob.title,
          company: newJob.company,
          location: newJob.location,
          salary: newJob.salary,
          type: newJob.type,
          tags: newJob.tags.split(",").map(t => t.trim()).filter(t => t !== "")
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed creating pipeline index");

      toast.success("Job listed across global indexes successfully!");
      setIsPostJobModalOpen(false);

      // Reset State
      setNewJob({
        title: '',
        company: 'Globalco Ltd',
        location: 'Hitech City, Hyderabad (Onsite)',
        salary: '',
        type: 'Full-time',
        tags: ''
      });

      onJobPosted();
    }
    catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error posting item.");
      }
    }
  };

  return (
    <div className="space-y-8 ">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Index Pipelines</span>
            <div className="text-xl font-bold text-white mt-1">{jobsCount} Jobs</div>
          </div>
          <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-lg"><Briefcase className="h-4 w-4" /></div>
        </div>
        <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Indexed Applications</span>
            <div className="text-xl font-bold text-white mt-1">{applications.length} Candidates</div>
          </div>
          <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-lg"><Users className="h-4 w-4" /></div>
        </div>
        <button
          onClick={() => setIsPostJobModalOpen(true)}
          className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md group flex items-center justify-between text-left"
        >
          <div>
            <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Workspace Actions</span>
            <div className="text-sm font-bold text-white mt-1 flex items-center gap-1">
              Post New Vacancy <Plus className="h-3.5 w-3.5 group-hover:scale-125 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <FileText className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Application Pipeline Tracking</h3>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
            No applications received inside this tracking node cycle.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => (
              <div key={app.id} className="p-5 bg-slate-950/40 rounded-xl border border-white/5 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{app.id}</span>
                    <h4 className="text-xs font-bold text-white mt-0.5 animate-pulse">
                      Target: <span className="text-indigo-400">{app.jobTitle}</span>
                    </h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-semibold text-slate-400">{app.seekerEmail}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${app.status === 'Shortlisted' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                        app.status === 'Rejected' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                          'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-white/5 rounded-lg text-xs text-slate-400 leading-relaxed">
                  {/* Option A: Safely wrapped in a JSX template literal expression */}
                  {`"${app.coverLetter}"`}
                </div>
                {app.status === 'Pending' && (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onUpdateStatus(app.id, 'Rejected')}
                      className="px-2.5 py-1 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[11px] font-bold rounded-lg transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onUpdateStatus(app.id, 'Shortlisted')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" /> Shortlist
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isPostJobModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
              <div>
                <h3 className="text-sm font-bold text-white">Initialize New Pipeline Vacancy</h3>
                <span className="text-[10px] text-slate-400">Configure public discovery parameters.</span>
              </div>
              <button onClick={() => setIsPostJobModalOpen(false)} className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleJobSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Title</label>
                  <input type="text" required placeholder="e.g., Software Engineer" className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500 outline-none p-2.5 rounded-xl text-xs text-white" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Salary Metrics</label>
                  <input type="text" required placeholder="e.g., $140k" className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500 outline-none p-2.5 rounded-xl text-xs text-white" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Type Configuration</label>
                  <select className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-300 font-semibold cursor-pointer" value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Physical Location</label>
                  <input type="text" required className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white font-medium" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Capabilities (Comma-Separated)</label>
                <input type="text" placeholder="React, Python, FastAPI" className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white" value={newJob.tags} onChange={e => setNewJob({ ...newJob, tags: e.target.value })} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-2.5 rounded-xl text-xs transition shadow-md">Deploy Job Posting Pipeline</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}