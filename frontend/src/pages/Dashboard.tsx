import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jobsAPI, resumesAPI, applicationsAPI } from "../services/api";
import type { Job, Resume, Application } from "../types/api";
import { Briefcase, FileText, User, Plus, BarChart3 } from "lucide-react";

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalResumes, setTotalResumes] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [jobsData, resumesData, applicationsData] = await Promise.all([
        jobsAPI.getJobs(),
        resumesAPI.getResumes(),
        applicationsAPI.getApplications(),
      ]);

      setJobs(jobsData.slice(0, 3)); // Show only recent 3 jobs
      setResumes(resumesData.slice(0, 3)); // Show only recent 3 resumes
      setApplications(applicationsData.slice(0, 5)); // Show only recent 5 applications

      // Store total counts for stats
      setTotalJobs(jobsData.length);
      setTotalResumes(resumesData.length);
      setTotalApplications(applicationsData.length);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to JobTracker
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in to access your dashboard
          </p>
          <a href="/login" className="btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Jobs",
      value: totalJobs,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Resumes",
      value: totalResumes,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Applications",
      value: totalApplications,
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Welcome back! Here's an overview of your job search activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {stats.map((stat, index) => (
          <div key={stat.name} className="stat-card group">
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}
              >
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Recent Jobs</h2>
          <a
            href="/jobs"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 transition-colors"
          >
            <span>View all</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="card card-hover group">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {job.description.substring(0, 150)}...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">
                    Added {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  <Link to={`/jobs/${job.id}`} className="btn-primary text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No jobs yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by adding your first job posting to track your
              applications.
            </p>
            <Link to="/jobs/new" className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Job
            </Link>
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Recent Applications
          </h2>
          <a
            href="/applications"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 transition-colors"
          >
            <span>View all</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="card card-hover group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Application #{application.id}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        Applied on{" "}
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      application.status === "accepted"
                        ? "badge-success"
                        : application.status === "rejected"
                        ? "badge-danger"
                        : application.status === "submitted"
                        ? "badge-info"
                        : "badge-warning"
                    }`}
                  >
                    {application.status}
                  </span>
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
              applications.
            </p>
            <Link to="/jobs" className="btn-primary">
              <Briefcase className="h-5 w-5 mr-2" />
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
