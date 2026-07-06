"use client";

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Globe, Link, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface IdentityProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  professionalHeadline: string;
  portfolioUrl: string;
  githubUrl: string;
  websiteUrl: string;
}

interface ContactAndSocialsProps {
  initialData?: IdentityProfileData;
  onSave?: (updatedData: IdentityProfileData) => void | Promise<void>;
}

const defaultIdentity: IdentityProfileData = {
  fullName: "John Doe",
  email: "john.doe@unploy.com",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA",
  professionalHeadline: "Full Stack Engineer | React, Node.js, Go | 5+ Years Exp",
  portfolioUrl: "https://Unlop@gmail.com",
  githubUrl: "https://github.com/Unploy",
  websiteUrl: "https://Unploy@gmail.com"
};

export default function ContactAndSocials({ initialData = defaultIdentity, onSave }: ContactAndSocialsProps) {
  const [formData, setFormData] = useState<IdentityProfileData>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);

  // Unified state change handler for all input elements
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const toastId = toast.loading("Syncing profile vector parameters...");

    try {
      if (onSave) {
        await onSave(formData);
      } else {
        // Fallback simulation for stand-alone state validation
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      toast.success("Identity vectors updated successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to compile profile records.", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40 p-6 shadow-xl space-y-6">
      
      {/* Block Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Core Identity & Network Nodes</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your indexing contact metadata and exterior portfolio pipelines.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
        
        {/* Section 1: Core Contact Coordinates */}
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Contact Coordinates</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-indigo-500" /> Full Identity Mapping</label>
              <input 
                name="fullName"
                type="text" 
                value={formData.fullName} 
                onChange={handleInputChange} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium"
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-indigo-500" /> Primary Email Routing</label>
              <input 
                name="email"
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-indigo-500" /> Secure Dial String</label>
              <input 
                name="phone"
                type="text" 
                value={formData.phone} 
                onChange={handleInputChange} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-indigo-500" /> Geo Location Vertex</label>
              <input 
                name="location"
                type="text" 
                value={formData.location} 
                onChange={handleInputChange} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium"
                placeholder="City, State"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Professional Branding Index */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Market Vector Branding</h4>
          
          <div className="space-y-1">
            <label className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-indigo-500" /> Professional Tagline Headline</label>
            <input 
              name="professionalHeadline"
              type="text" 
              value={formData.professionalHeadline} 
              onChange={handleInputChange} 
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium"
              placeholder="e.g., Lead Systems Architect | Rust, Kubernetes | Distributed Infrastructure"
            />
          </div>
        </div>

        {/* Section 3: Extrinsic Connection Registries */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">External Network Pipelines</h4>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-indigo-500" /> Showcase Portfolio Registry (URL)</label>
              <input 
                name="portfolioUrl"
                type="url" 
                value={formData.portfolioUrl} 
                onChange={handleInputChange} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium font-mono"
                placeholder="https://"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"> GitHub Repository Hub Vector (URL)</label>
              <input 
                name="githubUrl"
                type="url" 
                value={formData.githubUrl} 
                onChange={handleInputChange} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium font-mono"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Link className="h-3.5 w-3.5 text-indigo-500" /> Alternate Domain Connection (URL)</label>
              <input 
                name="websiteUrl"
                type="url" 
                value={formData.websiteUrl} 
                onChange={handleInputChange} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-medium font-mono"
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        {/* Submit Execution Button */}
        <button 
          type="submit" 
          disabled={isUpdating}
          className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 transition-colors text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 active:scale-[0.99]"
        >
          {isUpdating ? (
            <>Processing Identity Mapping State...</>
          ) : (
            <>
              <Shield className="h-4 w-4" /> Save Core Profile Channels
            </>
          )}
        </button>
      </form>

    </div>
  );
}