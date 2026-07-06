"use client";

import React, { useState, useEffect } from 'react';
import { User, Briefcase, Shield, FolderHeart, Bell, Loader2, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = "http://localhost:8001/api/profile";

// Strict structural type mapping matching FastAPI master Pydantic layout
export interface MasterProfileState {
  fullName: string;
  email: string;
  identity: {
    headline: string;
    workExperience: Array<{ title: string; company: string; dates: string }>;
    educationCertifications: Array<{ degree: string; school: string }>;
    skillsInventory: string[];
  };
  preferences: {
    openToWorkStatus: string;
    desiredTitles: string[];
    desiredLocations: string[];
    jobTypes: string[];
  };
  privacy: {
    profileVisibility: string;
    autoShareResume: boolean;
  };
  applications: {
    storedResumes: Array<{ name: string; uploaded: string }>;
    applicationTracker: Array<{ id: number; role: string; company: string; status: string }>;
  };
  alerts: {
    jobAlerts: Array<{ keyword: string; frequency: string }>;
  };
}

// 1. ADDED COMPONENT PROPS CONTRACT INTERFACE HERE
interface ProfileWindowProps {
  token: string;
  onSave?: (updatedProfile: MasterProfileState) => void;
}

// 2. UPDATED FUNCTION TO DESTRUCTURE PROPS AND APPLY THE TYPE CONTRACT
export default function ProfileWindow({ token, onSave }: ProfileWindowProps) {
  const [activeTab, setActiveTab] = useState<'identity' | 'preferences' | 'privacy' | 'applications' | 'alerts'>('identity');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Structural State Root
  const [profile, setProfile] = useState<MasterProfileState>({
    fullName: "",
    email: "",
    identity: { headline: "", workExperience: [], educationCertifications: [], skillsInventory: [] },
    preferences: { openToWorkStatus: "Only Recruiters", desiredTitles: [], desiredLocations: [], jobTypes: [] },
    privacy: { profileVisibility: "Public", autoShareResume: false },
    applications: { storedResumes: [], applicationTracker: [] },
    alerts: { jobAlerts: [] }
  });

  // Local input field helpers for array additions
  const [newSkill, setNewSkill] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAlert, setNewAlert] = useState({ keyword: "", frequency: "Daily" });
  const [newJob, setNewJob] = useState({ title: "", company: "", dates: "" });

  useEffect(() => {
    if (!token) return;

    fetch(API_URL, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => { setProfile(data); setIsLoading(false); })
      .catch(() => { toast.error("Error pulling active platform state map."); setIsLoading(false); });
  }, [token]);

  const handleTopLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const syncStateToBackend = async () => {
    setIsUpdating(true);
    const tid = toast.loading("Syncing structural datasets to database stream...");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error();
      
      toast.success("Database sync written successfully!", { id: tid });
      if (onSave) onSave(profile);
    } catch {
      toast.error("Failed to compile state updates down to engine.", { id: tid });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleJobTypeToggle = (type: string) => {
    setProfile(p => {
      const current = p.preferences.jobTypes;
      const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
      return { ...p, preferences: { ...p.preferences, jobTypes: updated } };
    });
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <span className="text-xs font-semibold text-slate-500">Parsing Active DB Configuration Clusters...</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40 shadow-xl overflow-hidden text-xs font-semibold text-slate-700 dark:text-slate-300">
      
      {/* Header Panel */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h1>
          </div>
          <p className="text-slate-400 font-normal mt-0.5">Control pipeline discovery, profile indexing architectures, and credential validation telemetry.</p>
        </div>
        <button onClick={syncStateToBackend} disabled={isUpdating} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all">
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />} Apply change
        </button>
      </div>

      {/* Global Context Identity Fields */}
      <div className="p-6 bg-white dark:bg-slate-950/40 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800/40">
        <div>
          <label className="text-slate-400 block mb-1">Identity Display Header String</label>
          <input name="fullName" value={profile.fullName} onChange={handleTopLevelChange} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-medium text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Authenticated Relay Primary Address</label>
          <input name="email" value={profile.email} onChange={handleTopLevelChange} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-medium text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[480px]">
        {/* Navigation Sidebar Matrix */}
    {/* Navigation Sidebar Matrix */}
<div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-900/20 border-r-0 md:border-r border-slate-200 dark:border-slate-800 p-4 space-y-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
  {[
    { id: 'identity', label: '1. Identity & Experience', icon: User },
    { id: 'preferences', label: '2. Job Preferences', icon: Briefcase },
    { id: 'privacy', label: '3. Privacy & Safety', icon: Shield },
    { id: 'applications', label: '4. Documents & Track', icon: FolderHeart },
    { id: 'alerts', label: '5. Automated Alerts', icon: Bell },
  ].map(tab => (
    <button 
      key={tab.id} 
      onClick={() => setActiveTab(tab.id as 'identity' | 'preferences' | 'privacy' | 'applications' | 'alerts')} 
      className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 whitespace-nowrap transition-all ${
        activeTab === tab.id 
          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700' 
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40'
      }`}
    >
      <tab.icon className="h-4 w-4 shrink-0" /> 
      <span className="font-bold">{tab.label}</span>
    </button>
  ))}
</div>

        {/* Tab Panel Context Matrix */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
          
          {/* TAB 1: PROFESSIONAL IDENTITY */}
          {activeTab === 'identity' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Professional Identity & History Layout</h3>
              <div>
                <label className="text-slate-400 block mb-1">Headline Search Engine Optimization Summary</label>
                <textarea value={profile.identity.headline} onChange={e => setProfile(p => ({ ...p, identity: { ...p.identity, headline: e.target.value } }))} rows={2} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none font-medium" />
              </div>

              {/* Skills Tags Inventory */}
              <div>
                <label className="text-slate-400 block mb-1">Skills Inventory (Search Index Keywords)</label>
                <div className="flex gap-2 mb-2">
                  <input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="e.g. Docker, Python" className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent outline-none flex-1 text-slate-900 dark:text-slate-100 font-medium" />
                  <button type="button" onClick={() => { if(newSkill) { setProfile(p => ({ ...p, identity: { ...p.identity, skillsInventory: [...p.identity.skillsInventory, newSkill] } })); setNewSkill(""); } }} className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.identity.skillsInventory.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1 font-medium">
                      {sk} <X className="h-3 w-3 cursor-pointer text-slate-400" onClick={() => setProfile(p => ({ ...p, identity: { ...p.identity, skillsInventory: p.identity.skillsInventory.filter((_, i) => i !== idx) } }))} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience Arrays */}
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-slate-400 block mb-2">Chronological Work Experience</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="Role Title" className="p-2 rounded-lg border border-slate-200 bg-transparent text-slate-900 dark:text-slate-100 font-medium" />
                  <input value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} placeholder="Company" className="p-2 rounded-lg border border-slate-200 bg-transparent text-slate-900 dark:text-slate-100 font-medium" />
                  <div className="flex gap-1">
                    <input value={newJob.dates} onChange={e => setNewJob({ ...newJob, dates: e.target.value })} placeholder="Dates" className="p-2 rounded-lg border border-slate-200 bg-transparent flex-1 text-slate-900 dark:text-slate-100 font-medium" />
                    <button type="button" onClick={() => { if(newJob.title) { setProfile(p => ({ ...p, identity: { ...p.identity, workExperience: [...p.identity.workExperience, newJob] } })); setNewJob({ title: "", company: "", dates: "" }); } }} className="px-2 bg-indigo-600 text-white rounded-lg"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {profile.identity.workExperience.map((job, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center text-slate-900 dark:text-slate-100 font-medium">
                      <span>{job.title} at <strong className="text-indigo-600">{job.company}</strong> ({job.dates})</span>
                      <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => setProfile(p => ({ ...p, identity: { ...p.identity, workExperience: p.identity.workExperience.filter((_, i) => i !== idx) } }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Job Seeking & Availability Vectors</h3>
              <div>
                <label className="text-slate-400 block mb-1">
                  {"\"Open to Work\" Discovery Broadcast Range"}
                </label>
                <select value={profile.preferences.openToWorkStatus} onChange={e => setProfile(p => ({ ...p, preferences: { ...p.preferences, openToWorkStatus: e.target.value } }))} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100">
                  <option value="All Network Members">All Network Members (Open badge display active)</option>
                  <option value="Only Recruiters">Only Recruiters Outside Current Corporate Node</option>
                  <option value="Closed">Closed / Private</option>
                </select>
              </div>

              {/* Target Role Strings */}
              <div>
                <label className="text-slate-400 block mb-1">Desired Job Titles</label>
                <div className="flex gap-2 mb-2">
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Add role title..." className="p-2 rounded-lg border border-slate-200 bg-transparent flex-1 font-medium text-slate-900 dark:text-slate-100" />
                  <button type="button" onClick={() => { if(newTitle) { setProfile(p => ({ ...p, preferences: { ...p.preferences, desiredTitles: [...p.preferences.desiredTitles, newTitle] } })); setNewTitle(""); } }} className="px-3 bg-indigo-600 text-white rounded-lg"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.preferences.desiredTitles.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 flex items-center gap-1 font-medium">{t} <X className="h-3 w-3 cursor-pointer" onClick={() => setProfile(p => ({ ...p, preferences: { ...p.preferences, desiredTitles: p.preferences.desiredTitles.filter((_, idx) => idx !== i) } }))} /></span>
                  ))}
                </div>
              </div>

              {/* Delivery Vector Checkboxes */}
              <div>
                <label className="text-slate-400 block mb-2">Job Arrangement Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Full-time", "Part-time", "Contract", "Internship", "Freelance"].map(type => (
                    <label key={type} className="flex items-center gap-2 p-2.5 border border-slate-100 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <input type="checkbox" checked={profile.preferences.jobTypes.includes(type)} onChange={() => handleJobTypeToggle(type)} className="accent-indigo-600" />
                      <span className="font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY & SECURITY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Privacy Architecture & Data Isolation</h3>
              <div>
                <label className="text-slate-400 block mb-1">Global Profile Map Indexing</label>
                <select value={profile.privacy.profileVisibility} onChange={e => setProfile(p => ({ ...p, privacy: { ...p.privacy, profileVisibility: e.target.value } }))} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100">
                  <option value="Public">Public Index Mode (Visible to external Google/Bing scrapers)</option>
                  <option value="Authenticated Only">Authenticated Only (Internal Platform Verification Clusters)</option>
                  <option value="Private">Private / Locked Entity</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Automated Resume Application Stream-Sharing</p>
                  <p className="text-slate-400 font-normal mt-0.5">Silently include primary stored CV file configurations when passing profile queries.</p>
                </div>
                <input type="checkbox" checked={profile.privacy.autoShareResume} onChange={e => setProfile(p => ({ ...p, privacy: { ...p.privacy, autoShareResume: e.target.checked } }))} className="h-4 w-4 accent-indigo-600 rounded" />
              </div>
            </div>
          )}

          {/* TAB 4: APPLICATION TRACKING & DOCUMENTS */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Asset Repositories & Tracker Metrics</h3>
              <div>
                <h4 className="text-slate-400 mb-1.5">Stored Resumes & Artifacts</h4>
                <div className="p-3 border border-dashed border-slate-200 dark:border-slate-800 text-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/10 cursor-pointer text-slate-400" onClick={() => {
                  const name = prompt("Enter mock document file asset name (e.g., CV_Executive.pdf):");
                  if (name) setProfile(p => ({ ...p, applications: { ...p.applications, storedResumes: [...p.applications.storedResumes, { name, uploaded: new Date().toISOString().split('T')[0] }] } }));
                }}>
                  + Upload New Document Struct Configuration Map Asset
                </div>
                <div className="mt-2 space-y-1">
                  {profile.applications.storedResumes.map((r, i) => (
                    <div key={i} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium">
                      <span>{r.name}</span> <span className="text-slate-400 font-normal">Uploaded {r.uploaded}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracker Board Data Status */}
              <div>
                <h4 className="text-slate-400 mb-1.5">Live Pipeline Stream Application Tracker</h4>
                <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/10 text-right">
                  <button type="button" onClick={() => {
                    const role = prompt("Enter Application Role Title:");
                    const company = prompt("Enter Targeting Corporate Entity:");
                    if(role && company) setProfile(p => ({ ...p, applications: { ...p.applications, applicationTracker: [...p.applications.applicationTracker, { id: Date.now(), role, company, status: "Applied" }] } }));
                  }} className="text-indigo-600 hover:text-indigo-500 font-bold">+ Track Application Node</button>
                </div>
                <div className="mt-2 space-y-2">
                  {profile.applications.applicationTracker.map((app, i) => (
                    <div key={app.id || i} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center bg-white dark:bg-slate-900">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{app.role}</p>
                        <p className="text-slate-400 font-normal">{app.company}</p>
                      </div>
                      <select value={app.status} onChange={e => {
                        const nextStatus = e.target.value;
                        setProfile(p => ({ ...p, applications: { ...p.applications, applicationTracker: p.applications.applicationTracker.map(a => a.id === app.id ? { ...a, status: nextStatus } : a) } }));
                      }} className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold tracking-wider text-indigo-600 border border-slate-200 dark:border-slate-700 outline-none">
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUTOMATED NOTIFICATION ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Automated Daemon Searches & Alerts</h3>
              <div className="grid grid-cols-2 gap-2 border p-3 border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                <div>
                  <label className="text-slate-400 block mb-0.5">Filter Keyword Query String</label>
                  <input value={newAlert.keyword} onChange={e => setNewAlert({ ...newAlert, keyword: e.target.value })} placeholder="e.g. Remote Rust Architect" className="w-full p-2 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-0.5">Stream Frequency Interval</label>
                  <div className="flex gap-2">
                    <select value={newAlert.frequency} onChange={e => setNewAlert({ ...newAlert, frequency: e.target.value })} className="p-2 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 font-medium flex-1 text-slate-900 dark:text-slate-100">
                      <option value="Realtime Stream">Realtime Stream</option>
                      <option value="Daily Summary">Daily Summary</option>
                      <option value="Weekly digest matrix">Weekly digest matrix</option>
                    </select>
                    <button type="button" onClick={() => { if (newAlert.keyword) { setProfile(p => ({ ...p, alerts: { ...p.alerts, jobAlerts: [...p.alerts.jobAlerts, newAlert] } })); setNewAlert({ keyword: "", frequency: "Daily Summary" }); } }} className="px-3 bg-indigo-600 text-white rounded-lg"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {profile.alerts.jobAlerts.map((al, i) => (
                  <div key={i} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 font-medium">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {`Keyword Filter: "${al.keyword}"`}
                      </p>
                      <p className="text-slate-400 font-normal mt-0.5">Frequency Matrix Stream: {al.frequency}</p>
                    </div>
                    <button type="button" onClick={() => setProfile(p => ({ ...p, alerts: { ...p.alerts, jobAlerts: p.alerts.jobAlerts.filter((_, idx) => idx !== i) } }))} className="text-red-500 hover:text-red-400 font-bold">Delete Daemon</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}