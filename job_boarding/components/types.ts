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


export interface Job_see {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  description?: string;
  postedDate?: string;
  requirements?: string[];
}

export type ApplicationStage = 
  | 'Applied' 
  | 'Shortlisted' 
  | 'Recruiter Contacted' 
  | 'Technical Assessment' 
  | 'Selected' 
  | 'Rejected';

export interface TrackerNode {
  jobId: number;
  stage: ApplicationStage;
  updatedAt: string;
  notes?: string;
}

export interface SeekerProfile {
  fullName: string;
  email: string;
  phone: string;
  about: string;
  techStack: string[];
  salaryExpectation: string;
  visibility: string;
  resumeName: string | null;
}

export type SortOption = 'default' | 'salary-high' | 'salary-low' | 'title-asc';
export type FilterTypeOption = 'All' | 'Full-time' | 'Contract' | 'Remote' | 'Part-time';
export type DashboardView = 'discover' | 'bookmarks' | 'applied' | 'messages' | 'profile';