import axios from 'axios';
import type { AuthResponse, LoginForm, RegisterForm, Job, JobAnalyzeForm, Resume, Application } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: LoginForm): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(res => res.data);
  },
  
  register: (data: RegisterForm): Promise<AuthResponse> =>
    api.post('/auth/register', data).then(res => res.data),
};

export const jobsAPI = {
  getJobs: (): Promise<Job[]> =>
    api.get('/jobs').then(res => res.data),
  
  analyzeJob: (data: JobAnalyzeForm): Promise<Job> =>
    api.post('/jobs/analyze', data).then(res => res.data),
};

export const resumesAPI = {
  getResumes: (): Promise<Resume[]> =>
    api.get('/resumes').then(res => res.data),
  
  uploadResume: (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  deleteResume: (id: number): Promise<void> =>
    api.delete(`/resumes/${id}`).then(res => res.data),
};

export const applicationsAPI = {
  getApplications: (): Promise<Application[]> =>
    api.get('/applications').then(res => res.data),
  
  createApplication: (data: { job_id: number; resume_id: number }): Promise<Application> =>
    api.post('/applications', data).then(res => res.data),
  
  updateApplication: (id: number, data: { status: string }): Promise<Application> =>
    api.put(`/applications/${id}`, data).then(res => res.data),
};

export default api;