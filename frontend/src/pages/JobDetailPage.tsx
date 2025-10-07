import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jobsAPI, resumesAPI } from "../services/api";
import type { Job, Resume } from "../types/api";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react";
import AnalysisModal from "../components/Analysis/AnalysisModal";

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (isAuthenticated && id) {
      loadJob();
    }
  }, [isAuthenticated, id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      setError("");
      // For now, we'll get all jobs and find the one with matching ID
      // In a real app, you'd have a getJobById endpoint
      const [jobs, resumesData] = await Promise.all([
        jobsAPI.getJobs(),
        resumesAPI.getResumes(),
      ]);

      const foundJob = jobs.find((j) => j.id === parseInt(id!));

      if (foundJob) {
        setJob(foundJob);
        setResumes(resumesData);
      } else {
        setError("Job not found");
      }
    } catch (err: any) {
      console.error("Failed to load job:", err);
      setError(
        err.response?.data?.detail || err.message || "Failed to load job"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job || !confirm("Are you sure you want to delete this job?")) return;

    try {
      setLoading(true);
      await jobsAPI.delete(job.id);
      navigate("/jobs");
    } catch (err: any) {
      console.error("Failed to delete job:", err);
      setError(
        err.response?.data?.detail || err.message || "Failed to delete job"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view job details
          </h1>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Job not found"}
          </h1>
          <Link to="/jobs" className="btn-primary">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/jobs")}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Jobs</span>
        </button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {job.title}
          </h1>
          <p className="mt-2 text-gray-600">Job Details</p>
        </div>
      </div>

      {/* Job Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Description */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span>Job Description</span>
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Info */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Job Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {resumes.length > 0 && (
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Analyze Resume Fit</span>
                </button>
              )}
              <button className="btn-secondary w-full flex items-center justify-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit Job</span>
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger w-full flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Job</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Modal */}
      {job && (
        <AnalysisModal
          isOpen={showAnalysis}
          onClose={() => setShowAnalysis(false)}
          jobId={job.id}
          jobTitle={job.title}
          resumes={resumes}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
