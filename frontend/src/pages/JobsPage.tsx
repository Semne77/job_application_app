import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jobsAPI } from "../services/api";
import type { Job } from "../types/api";
import { Briefcase, Plus, Search, Filter } from "lucide-react";

const JobsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
    }
  }, [isAuthenticated]);

  const loadJobs = async () => {
    try {
      const data = await jobsAPI.getJobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      setLoading(true);
      await jobsAPI.delete(jobId);
      await loadJobs(); // Reload the jobs list
    } catch (err: any) {
      console.error("Failed to delete job:", err);
      alert(
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
            Please log in to view jobs
          </h1>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
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
            Jobs
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your job postings and applications
          </p>
        </div>
        <Link
          to="/jobs/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Job</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="card card-hover group">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <Briefcase className="h-5 w-5 text-blue-500 flex-shrink-0" />
              </div>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                {job.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">
                  Added {new Date(job.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="btn-primary text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="btn-danger text-sm"
                  >
                    Delete
                  </button>
                </div>
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
            {searchTerm ? "No jobs found" : "No jobs yet"}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by adding your first job posting"}
          </p>
          {!searchTerm && (
            <Link to="/jobs/new" className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Job
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
