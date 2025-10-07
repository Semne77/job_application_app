import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { applicationsAPI, jobsAPI, resumesAPI } from "../services/api";
import type { Application, Job, Resume } from "../types/api";
import { User, Plus, Briefcase, FileText, Calendar } from "lucide-react";

const ApplicationsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [applicationsData, jobsData, resumesData] = await Promise.all([
        applicationsAPI.getApplications(),
        jobsAPI.getJobs(),
        resumesAPI.getResumes(),
      ]);
      setApplications(applicationsData);
      setJobs(jobsData);
      setResumes(resumesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getJobTitle = (jobId: number) => {
    const job = jobs.find((j) => j.id === jobId);
    return job?.title || "Unknown Job";
  };

  const getResumeName = (resumeId: number) => {
    const resume = resumes.find((r) => r.id === resumeId);
    return resume?.filename || "Unknown Resume";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "badge-success";
      case "rejected":
        return "badge-danger";
      case "submitted":
        return "badge-info";
      default:
        return "badge-warning";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view applications
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Applications
          </h1>
          <p className="mt-2 text-gray-600">
            Track your job applications and their status
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>New Application</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Draft
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter((app) => app.status === "draft").length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Submitted
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  applications.filter((app) => app.status === "submitted")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Accepted
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter((app) => app.status === "accepted").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="card card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Application #{application.id}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{getJobTitle(application.job_id)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{getResumeName(application.resume_id)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(
                            application.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`badge ${getStatusColor(application.status)}`}
                  >
                    {application.status}
                  </span>
                  <button className="btn-secondary text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start applying to jobs to track your progress and manage your
            applications
          </p>
          <button className="btn-primary">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Application
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
