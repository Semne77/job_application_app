export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Job {
  id: number;
  user_id: number;
  title: string;
  description: string;
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  file_path: string;
  uploaded_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  resume_id: number;
  status: 'draft' | 'submitted' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
}

export interface JobAnalyzeForm {
  jd_text?: string;
  url?: string;
}
