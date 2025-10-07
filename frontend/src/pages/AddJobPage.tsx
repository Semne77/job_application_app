import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jobsAPI } from "../services/api";
import { ArrowLeft, Plus, Briefcase, Link, FileText } from "lucide-react";

const AddJobPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [entryMode, setEntryMode] = useState<"manual" | "url">("manual");
  const [url, setUrl] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleAnalyzeUrl = async () => {
    if (!url.trim()) return;

    setAnalyzing(true);
    setError("");

    try {
      const result = await jobsAPI.analyzeJob({ url: url.trim() });
      setFormData({
        title: result.title,
        description: result.description,
      });
      setEntryMode("manual"); // Switch to manual mode to allow editing
    } catch (err: any) {
      console.error("Failed to analyze URL:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to analyze job posting"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");

    try {
      await jobsAPI.create(formData);
      navigate("/jobs");
    } catch (err: any) {
      console.error("Failed to create job:", err);
      setError(
        err.response?.data?.detail || err.message || "Failed to create job"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to add jobs
          </h1>
          <button onClick={() => navigate("/login")} className="btn-primary">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/jobs")}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Jobs</span>
        </button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Job
          </h1>
          <p className="mt-2 text-gray-600">
            Create a new job posting to track
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Entry Mode Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you like to add this job?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="entryMode"
                  value="manual"
                  checked={entryMode === "manual"}
                  onChange={(e) =>
                    setEntryMode(e.target.value as "manual" | "url")
                  }
                  className="text-blue-600"
                />
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Manual Entry
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="entryMode"
                  value="url"
                  checked={entryMode === "url"}
                  onChange={(e) =>
                    setEntryMode(e.target.value as "manual" | "url")
                  }
                  className="text-blue-600"
                />
                <Link className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Analyze from URL
                </span>
              </label>
            </div>
          </div>

          {/* URL Analysis Mode */}
          {entryMode === "url" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Job Posting URL *
                </label>
                <div className="flex space-x-2">
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="input-field flex-1"
                    placeholder="https://linkedin.com/jobs/view/123456 or https://company.com/careers/software-engineer"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeUrl}
                    disabled={!url.trim() || analyzing}
                    className="btn-primary flex items-center space-x-2 px-4"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-4 w-4" />
                        <span>Analyze</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Paste a job posting URL and we'll extract the title and
                  description for you
                </p>
              </div>
            </div>
          )}

          {/* Job Details */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Job Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={8}
              value={formData.description}
              onChange={handleChange}
              className="input-field resize-none"
              placeholder="Describe the job requirements, responsibilities, and qualifications..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobPage;
