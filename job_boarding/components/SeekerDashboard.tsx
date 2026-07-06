
"use client";


import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, MapPin, DollarSign, ExternalLink, Briefcase,
  Sparkles, X, FileText, Send, AlertCircle, ArrowUpDown,
  Bookmark, CheckCircle2, User, Mail, Shield, Check, Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar';
import { Job_see, SortOption, FilterTypeOption, DashboardView } from './types';

// Mock expanded production data if optional metadata variants are omitted
const fallbackDesc = "We are searching for systems engineers capable of running scalable infrastructure pipelines. You will own architecture deployment, state mapping transformations, and coordinate across decoupled micro-services frameworks.";
const mockRequirements = [
  "Minimum 3+ Years running production ecosystems environments.",
  "Deep familiarity building services with Node.js, Go, or Rust structures.",
  "Validated understanding of relational configurations and caching engines (Redis/Postgres)."
];

interface SeekerDashboardProps {
  Job_see: Job_see[];
  token?: string | null;
  API_URL?: string;
}

export default function SeekerDashboard({ Job_see = [], token, API_URL = "http://localhost:8001" }: SeekerDashboardProps) {
  // Navigation State Layout Linkages
  const [currentView, setCurrentView] = useState<DashboardView>('discover');

  // Search, Selection, Tracking States
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<FilterTypeOption>('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  
  // Track the selected job object reference
  const [activeJobId, setActiveJobId] = useState<Job_see | null>(null);

  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  // Application Form Handlers
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Profile Options Config Management Panel States
  const [profileForm, setProfileForm] = useState({
    fullName: "Name",
    email: "john.doe@example.io",
    visibility: "Public index match alignment",
    salaryExpectation: "140,000"
  });

  // 1. Inject defaults to ensure detail pane state consistency
  const normalizedJobs = useMemo(() => {
    return Job_see.map(job => ({
      ...job,
      description: job.description || fallbackDesc,
      postedDate: job.postedDate || "recent",
      requirements: typeof job.requirements === 'string' 
        ? [job.requirements] 
        : (Array.isArray(job.requirements) ? job.requirements : mockRequirements)
    }));
  }, [Job_see]);

  // 2. Compute and process searchable datasets
  const filteredJobs = useMemo(() => {
    let result = [...normalizedJobs];
    
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.company.toLowerCase().includes(q) || 
        j.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    
    if (selectedType !== 'All') {
      result = result.filter(j => j.type.toLowerCase() === selectedType.toLowerCase());
    }
    
    const parseSalary = (salaryStr: string) => {
      const clean = salaryStr.replace(/[^0-9]/g, '');
      return clean ? parseInt(clean, 10) : 0;
    };

    if (sortBy === 'salary-high') {
      result.sort((a, b) => parseSalary(b.salary) - parseSalary(a.salary));
    } else if (sortBy === 'salary-low') {
      result.sort((a, b) => parseSalary(a.salary) - parseSalary(b.salary));
    }
    
    return result;
  }, [normalizedJobs, search, selectedType, sortBy]);

  // 3. FIX: Compute activeJob from the synchronized data stream so it's never null
  const activeJob = useMemo(() => {
    if (filteredJobs.length === 0) return null;
    const currentSelection = filteredJobs.find(j => j.id === activeJobId?.id);
    return currentSelection || filteredJobs[0];
  }, [filteredJobs, activeJobId]);

  const toggleSaveJob = (id: number) => {
    setSavedJobIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    toast.success(savedJobIds.includes(id) ? "Bookmark wiped." : "Position bookmarked!");
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob || !token) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Routing operational application pipeline...");

    try {
      const res = await fetch(`${API_URL}/api/jobs/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: activeJob.id,
          cover_letter: coverLetter
        })
      });

      if (!res.ok) throw new Error("Application delivery matrix execution failed.");

      toast.success("Application compiled and transmitted directly!", { id: toastId });
      setAppliedJobIds(p => [...p, activeJob.id]);
      setIsModalOpen(false);
      setCoverLetter("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Application pipeline processing dropped.");
      } else {
        toast.error("An unknown pipeline processing error occurred.");
      }
      toast.dismiss(toastId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProfileSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Production profile settings successfully saved!");
  };

  // Switch context dependent on selected navbar view state
  const viewFilteredJobs = useMemo(() => {
    if (currentView === 'bookmarks') return filteredJobs.filter(j => savedJobIds.includes(j.id));
    if (currentView === 'applied') return filteredJobs.filter(j => appliedJobIds.includes(j.id));
    return filteredJobs;
  }, [filteredJobs, currentView, savedJobIds, appliedJobIds]);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 rounded-lg mt-[-14] max-w-7xl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)]">

        {/* VIEW CONDITIONAL 1: CHAT SYSTEM FALLBACK */}
        {currentView === 'messages' && (
          <div className="h-full flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 p-8 text-center">
            <Mail className="h-10 w-10 text-indigo-500 mb-3 animate-bounce" />
            <h3 className="text-base font-bold">Secure Communication Node Channels</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Recruiter chat channels activate automatically following formal application confirmation vectors.</p>
          </div>
        )}

        {/* VIEW CONDITIONAL 2: PRODUCTION SETTINGS PROFILE VIEW */}
        {currentView === 'profile' && (
          <div className="max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40 p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold"><User /></div>
              <div>
                <h3 className="font-bold text-lg">Production Engineering Profile</h3>
                <p className="text-xs text-slate-500">Configure global workspace preferences and metadata visibility maps.</p>
              </div>
            </div>

            <form onSubmit={saveProfileSettings} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Full Public Identity Mapping</label>
                  <input type="text" value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Primary Contact String</label>
                  <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Target Numeric Salary Target ($ / Year)</label>
                <input type="text" value={profileForm.salaryExpectation} onChange={e => setProfileForm({ ...profileForm, salaryExpectation: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:border-indigo-500" />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Vector Workspace Visibility Settings</label>
                <select value={profileForm.visibility} onChange={e => setProfileForm({ ...profileForm, visibility: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-indigo-500">
                  <option>Public index match alignment</option>
                  <option>Anonymous matching pipeline routing only</option>
                  <option>Locked credential architecture state</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-bold rounded-xl flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" /> Save Production Profile System State
              </button>
            </form>
          </div>
        )}

        {/* VIEW CONDITIONAL 3: MASTER-DETAIL TWO COLUMN SPLIT INTERFACE */}
        {(currentView === 'discover' || currentView === 'bookmarks' || currentView === 'applied') && (
          <div className="h-full flex flex-col gap-4">

            {/* Upper Search/Control Toolbar assembly block */}
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <div className="w-full md:flex-1 flex items-center gap-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20">
                <Search className="h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Filter positions..." className="w-full py-2.5 text-xs bg-transparent outline-none" value={search} onChange={e => setSearch(e.target.value)} />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs font-semibold">
                {(['All', 'Full-time', 'Contract', 'Remote'] as FilterTypeOption[]).map(t => (
                  <button key={t} onClick={() => setSelectedType(t)} className={`px-3 py-2 rounded-xl border ${selectedType === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>{t}</button>
                ))}
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl outline-none">
                  <option value="default">Sort: Default</option>
                  <option value="salary-high">Salary: High-Low</option>
                  <option value="salary-low">Salary: Low-High</option>
                </select>
              </div>
            </div>

            {/* Split Screen Master Detail Chassis Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100%-5rem)] min-h-0">

              {/* LEFT COLUMN: Master Job Feeds Card Deck Scrollable View */}
              <div className="lg:col-span-5 overflow-y-auto space-y-2 pr-1 h-full max-h-full">
                {viewFilteredJobs.map(jobItem => {
                  const isCurrent = activeJob?.id === jobItem.id;
                  const isSaved = savedJobIds.includes(jobItem.id);
                  const isApplied = appliedJobIds.includes(jobItem.id);

                  return (
                    <div
                      key={jobItem.id}
                      onClick={() => setActiveJobId(jobItem)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${isCurrent
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                        }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">{jobItem.type}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{jobItem.postedDate}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{jobItem.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{jobItem.company} • {jobItem.location}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5"><DollarSign className="h-3 w-3" />{jobItem.salary}</span>
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleSaveJob(jobItem.id)} className={`p-1.5 rounded-lg border ${isSaved ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 'text-slate-400 border-slate-200 dark:border-slate-800'}`}><Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} /></button>
                          {isApplied && <span className="p-1 text-emerald-500 bg-emerald-500/10 rounded-lg"><Check className="h-3.5 w-3.5" /></span>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {viewFilteredJobs.length === 0 && (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 text-slate-500" /> No positions found matching parameters.
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Permanent Job Specification Display Panel View */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-full max-h-full overflow-y-auto hidden lg:flex flex-col justify-between">
                {activeJob ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between h-full">
                    <div className="space-y-5">
                      {/* Top Context Segment header info */}
                      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20 uppercase tracking-widest">{activeJob.type}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {activeJob.location}</span>
                          <span className="text-xs text-emerald-500 font-bold flex items-center"><DollarSign className="h-3.5 w-3.5" />{activeJob.salary} / year</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{activeJob.title}</h2>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Globe className="h-4 w-4 text-slate-400" /> {activeJob.company}</p>
                      </div>

                      {/* Job Rich Text Metadata Requirements fields */}
                      <div className="space-y-3 text-xs leading-relaxed">
                        <div className="space-y-1">
                          <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">Role Context Description</h4>
                          <p className="text-slate-600 dark:text-slate-300 font-medium">{activeJob.description}</p>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">Deployment Target Requirements</h4>
                          {/* <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
                            {activeJob.requirements?.map((req, idx) => (
                              <li key={idx} className="list-item text-xs pl-1 marker:text-indigo-500 dark:marker:text-indigo-400">{req}</li>
                            ))}
                          </ul> */}
                        </div>
                      </div>

                      {/* Display Stack Tags inside card details */}
                      {activeJob.tags && activeJob.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-3">
                          {activeJob.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Operational Action Footer */}
                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-6 flex items-center justify-between gap-3 bg-white dark:bg-slate-900/10">
                      <button onClick={() => toggleSaveJob(activeJob.id)} className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${savedJobIds.includes(activeJob.id) ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                        <Bookmark className="h-4 w-4" /> {savedJobIds.includes(activeJob.id) ? 'Bookmarked' : 'Save Listing'}
                      </button>

                      {appliedJobIds.includes(activeJob.id) ? (
                        <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-950 text-slate-400 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Application Dispatched
                        </div>
                      ) : (
                        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs border border-indigo-500 flex items-center gap-1.5 shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all">
                          Apply <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                    <Briefcase className="h-8 w-8 text-slate-600 mb-2" /> Select an indexed listing vector to visualize system parameters.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* 4. MODAL COMPONENT LAYER */}
      {isModalOpen && activeJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 transition-colors"><X className="h-4 w-4" /></button>
            <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-[9px] font-bold tracking-wider text-indigo-500 dark:text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">Modal Gate Channel</span>
              <h3 className="text-lg font-bold tracking-tight">Apply to {activeJob.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activeJob.company} • {activeJob.location}</p>
            </div>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="space-y-1.5 text-xs font-bold">
                <label className="text-slate-500 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-indigo-500" /> Cover Letter Parameters</label>
                <textarea required rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Draft an introduction message explaining your vector tags matching mapping alignment..." className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 font-medium resize-none leading-relaxed text-xs text-slate-900 dark:text-slate-100" />
              </div>
              <div className="flex items-center justify-end gap-2 text-xs font-bold">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/15 disabled:opacity-50 transition-colors">{isSubmitting ? "Processing..." : "Send"} <Send className="h-3 w-3" /></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}