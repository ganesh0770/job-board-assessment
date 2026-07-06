"use client";
import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign, ArrowRight, X } from 'lucide-react';
import { Job } from '../types';

interface JobSeekerFeedProps {
  jobs: Job[];
  onApplySubmit: (job: Job, coverLetter: string) => void;
}

export default function JobSeekerFeed({ jobs, onApplySubmit }: JobSeekerFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState('All');
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [coverLetterText, setCoverLetterText] = useState('');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.requirements.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesShift = filterShift === 'All' || job.shiftType === filterShift;
    return matchesSearch && matchesShift;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForApply) return;
    onApplySubmit(selectedJobForApply, coverLetterText);
    setSelectedJobForApply(null);
    setCoverLetterText('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/40 to-transparent p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white tracking-tight">Open Opportunities Pipeline</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Explore real-time vacancies matching production deployments. Target specific workspace shift configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-3 flex items-center gap-2.5 border border-white/10 p-2.5 rounded-xl bg-slate-950/40 focus-within:border-indigo-500 transition-all">
          <Search className="h-4 w-4 text-slate-500 flex-shrink-0" />
          <input 
            type="text"
            placeholder="Filter listings by role titles, companies, or tech requirement stack..."
            className="bg-transparent w-full outline-none text-xs text-white placeholder-slate-600 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 border border-white/10 p-2.5 rounded-xl bg-slate-950/40">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            className="bg-transparent w-full text-xs text-slate-300 outline-none font-semibold cursor-pointer"
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
          >
            <option value="All" className="bg-slate-950 text-white">All Shift Schedules</option>
            <option value="Day" className="bg-slate-950 text-white">Day Shift</option>
            <option value="Night" className="bg-slate-950 text-white">Night Shift (Required)</option>
            <option value="Flexible" className="bg-slate-950 text-white">Flexible Shift</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
            No matching production job listings currently indexed.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="p-5 bg-slate-950/40 rounded-xl border border-white/5 hover:border-indigo-500/40 transition-all group duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 uppercase">
                    {job.company}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex items-center gap-1 ${
                    job.shiftType === 'Night' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Clock className="h-2.5 w-2.5" />
                    {job.shiftType} Shift
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {job.salary}</span>
                  <span className="text-slate-600">Posted {job.postedAt}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requirements.map((req, idx) => (
                    <span key={idx} className="bg-slate-900 px-2 py-0.5 border border-white/5 rounded text-[10px] text-slate-400 font-medium">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setSelectedJobForApply(job)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 self-start md:self-auto shadow-sm"
              >
                Apply Now
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {selectedJobForApply && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
              <div>
                <h3 className="text-sm font-bold text-white">Application Pipeline Manifest</h3>
                <span className="text-[10px] text-indigo-400 font-medium">To: {selectedJobForApply.company}</span>
              </div>
              <button onClick={() => setSelectedJobForApply(null)} className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Position</label>
                <input type="text" disabled className="w-full bg-slate-950 border border-white/5 p-2.5 rounded-xl text-xs text-slate-400 font-semibold" value={selectedJobForApply.title} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Covering Pitch Narrative</label>
                <textarea 
                  required rows={4}
                  placeholder="Articulate how your architecture matches the requirements parameters..."
                  className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500 outline-none p-2.5 rounded-xl text-xs text-white placeholder-slate-600 font-medium resize-none transition"
                  value={coverLetterText}
                  onChange={(e) => setCoverLetterText(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-2.5 rounded-xl text-xs transition shadow-md">
                Transmit Verified Application Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}