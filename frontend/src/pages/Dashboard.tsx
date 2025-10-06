import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { jobsAPI, resumesAPI, applicationsAPI } from "../services/api";
import type { Job, Resume, Application } from "../types/api";
import { Briefcase, FileText, User, Plus, BarChart3 } from "lucide-react";

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
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
      value: jobs.length,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Resumes",
      value: resumes.length,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Applications",
      value: applications.length,
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your job search activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Jobs</h2>
          <a
            href="/jobs"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            View all
          </a>
        </div>
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {job.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {job.description.substring(0, 150)}...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Added {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  <button className="btn-primary text-sm">View Details</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No jobs yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first job posting.
            </p>
            <div className="mt-6">
              <a href="/jobs/new" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Applications
          </h2>
          <a
            href="/applications"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            View all
          </a>
        </div>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="card">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Application #{application.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Applied on{" "}
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      application.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : application.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No applications yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start applying to jobs to track your progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
