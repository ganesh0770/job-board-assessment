"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Bookmark,
  CheckCircle2,
  MessageSquare,
  User,
  Bell,
  Sun,
  Moon,
  Monitor,
  Share2,
  LogOut,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DashboardView } from './types';

interface NavbarProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
  savedCount: number;
  appliedCount: number;
  notifications: Array<{ id: number; message: string; timestamp: string }>;
  onClearNotifications?: () => void;
  onLogout?: () => void;
}

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  savedCount, 
  appliedCount,
  notifications = [],
  onClearNotifications,
  onLogout 
}: NavbarProps) {
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('system');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeSubmenu, setShowThemeSubmenu] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile menu if clicked outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowThemeSubmenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Theme Synchronizer Engine
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const handleShareProfile = () => {
    const dummyUrl = `${window.location.origin}/profile/share_node_id_9482`;
    navigator.clipboard.writeText(dummyUrl);
    toast.success("Profile link copied securely to clipboard!");
  };

  return (
    <nav className="sticky top-2 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-lg transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('discover')}>
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/20">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white hidden sm:block">
              Unploy
            </span>
          </div>

          {/* Navigation Action Anchors */}
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'discover', label: 'Discover', icon: Briefcase, count: null },
              { id: 'bookmarks', label: 'Saved', icon: Bookmark, count: savedCount },
              { id: 'applied', label: 'Applied', icon: CheckCircle2, count: appliedCount },
              { id: 'messages', label: 'Messages', icon: MessageSquare, count: 2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id as DashboardView)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:block">{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white px-1">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); setShowThemeSubmenu(false); }}
                className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl relative transition-all"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <>
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
                  </>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl text-slate-800 dark:text-slate-100 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Updates</h4>
                    {notifications.length > 0 && (
                      <span onClick={onClearNotifications} className="text-[10px] text-indigo-500 font-semibold cursor-pointer hover:underline">Clear items</span>
                    )}
                  </div>
                  <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-slate-400 font-normal py-2 text-center">No unread tracking alerts.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                          <p className="font-semibold">{n.message}</p>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Frame */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); setShowThemeSubmenu(false); }}
                className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              >
                <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">JD</div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl z-50">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">John Doe</p>
                    <p className="text-[11px] text-slate-400 truncate">john.doe@vectorpipeline.io</p>
                  </div>
                  
                  <div className="space-y-0.5 text-xs">
                    <button onClick={() => { setCurrentView('profile'); setShowProfileMenu(false); }} className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center gap-2 font-semibold">
                      <User className="h-3.5 w-3.5" /> Workspace Profile
                    </button>
                    
                    <button onClick={handleShareProfile} className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center gap-2 font-semibold">
                      <Share2 className="h-3.5 w-3.5" /> Share Profile Link
                    </button>

                    {/* App Appearance Setting */}
                    <div className="border-t border-b border-slate-100 dark:border-slate-800/60 my-1 py-1">
                      <button onClick={() => setShowThemeSubmenu(!showThemeSubmenu)} className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-2">
                          {theme === 'system' ? <Monitor className="h-3.5 w-3.5" /> : theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                          App Appearance
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">{theme}</span>
                      </button>

                      {showThemeSubmenu && (
                        <div className="mt-1 ml-2 pl-2 border-l border-slate-100 dark:border-slate-800 space-y-0.5">
                          {[
                            { id: 'system', label: 'System Default', icon: Monitor },
                            { id: 'light', label: 'Light Mode', icon: Sun },
                            { id: 'dark', label: 'Dark Mode', icon: Moon }
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => {
                                setTheme(mode.id as 'system' | 'light' | 'dark');
                                toast(`Theme updated to: ${mode.id}`, { icon: '🌓' });
                                setShowProfileMenu(false);
                                setShowThemeSubmenu(false);
                              }}
                              className={`w-full text-left p-1.5 rounded-lg flex items-center gap-2 transition-all ${
                                theme === mode.id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
                              }`}
                            >
                              <mode.icon className="h-3 w-3" />
                              <span>{mode.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={onLogout} className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 rounded-xl flex items-center gap-2 mt-1 font-semibold">
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}