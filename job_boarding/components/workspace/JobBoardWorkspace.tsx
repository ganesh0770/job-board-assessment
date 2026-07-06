// "use client";
// import React, { useState } from 'react';
// import { toast } from 'react-hot-toast';
// import WorkspaceNavbar from './Navbar';
// import JobSeekerFeed from './JobSeekerFeeds';
// import RecruiterDashboard from './h';
// // import { Job, Application } from './types';

// // 1. ADDED: Clean structural contract for the incoming raw form data
// export interface JobPostInput {
//   title: string;
//   company: string;
//   description: string;
//   requirements: string; // The form sends this as a raw comma-separated string
//   shiftType: 'Day' | 'Night' | 'Flexible';
//   location: string;
//   salary: string;
// }

// export default function JobBoardWorkspace({
//   userRole,
//   userEmail,
//   onLogout
// }: {
//   userRole: 'seeker' | 'recruiter';
//   userEmail: string;
//   onLogout: () => void;
// }) {
//   const [jobs, setJobs] = useState<Job[]>([
//     {
//       id: '1',
//       title: 'Senior Software Engineer',
//       company: 'Globalco Tech Labs',
//       description: 'Looking for a skilled engineer to maintain high-throughput backend services and build out custom dashboard architectures.',
//       requirements: ['React / Next.js', 'Python / FastAPI', 'CI/CD Pipelines'],
//       shiftType: 'Night',
//       location: 'Hitech City, Hyderabad (Onsite)',
//       salary: '₹18,0,000 - ₹24,0,000 Lpa',
//       postedAt: '2 days ago'
//     }
//   ]);

//   const [applications, setApplications] = useState<Application[]>([
//     {
//       id: 'app-1',
//       jobId: '1',
//       jobTitle: 'Senior Software Engineer',
//       seekerEmail: 'ganesh@assessment.dev',
//       coverLetter: 'Highly experienced with Next.js and writing robust automated workflows.',
//       appliedAt: 'Yesterday',
//       status: 'Pending'
//     }
//   ]);

// //   # 2. FIXED: Replaced 'any' with the concrete 'JobPostInput' interface
//   const handlePostJob = (newJob: JobPostInput) => {
//     const createdJob: Job = {
//       id: String(jobs.length + 1),
//       title: newJob.title,
//       company: newJob.company,
//       description: newJob.description,
//       // Safely split and clean up strings into an array
//       requirements: newJob.requirements.split(',').map((req: string) => req.trim()).filter(Boolean),
//       shiftType: newJob.shiftType,
//       location: newJob.location,
//       salary: newJob.salary,
//       postedAt: 'Just now'
//     };
//     setJobs([createdJob, ...jobs]);
//     toast.success("Job posting successfully synchronized and live!");
//   };

//   const handleApplySubmit = (job: Job, coverLetter: string) => {
//     const newApp: Application = {
//       id: `app-${Date.now()}`,
//       jobId: job.id,
//       jobTitle: job.title,
//       seekerEmail: userEmail || "candidate@test.com",
//       coverLetter: coverLetter,
//       appliedAt: 'Just now',
//       status: 'Pending'
//     };
//     setApplications([newApp, ...applications]);
//     toast.success(`Application sent directly to ${job.company}!`);
//   };

//   const updateStatus = (appId: string, newStatus: 'Shortlisted' | 'Rejected') => {
//     setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
//     toast.success(`Applicant profile updated to status: ${newStatus}`);
//   };

//   return (
//     <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased">
//       <WorkspaceNavbar userRole={userRole} userEmail={userEmail} onLogout={onLogout} />
//       <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
//         {userRole === 'seeker' ? (
//           <JobSeekerFeed jobs={jobs} onApplySubmit={handleApplySubmit} />
//         ) : (
//           <RecruiterDashboard 
//             jobsCount={jobs.length} 
//             applications={applications} 
//             onPostJobSubmit={handlePostJob} 
//             onUpdateStatus={updateStatus} 
//           />
//         )}
//       </main>
//     </div>
//   );
// }