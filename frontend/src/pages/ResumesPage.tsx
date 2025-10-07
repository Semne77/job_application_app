import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { resumesAPI } from "../services/api";
import type { Resume } from "../types/api";
import { FileText, Upload, Download, Trash2, Plus } from "lucide-react";

const ResumesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadResumes();
    }
  }, [isAuthenticated]);

  const loadResumes = async () => {
    try {
      const data = await resumesAPI.getResumes();
      setResumes(data);
    } catch (error) {
      console.error("Failed to load resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await resumesAPI.uploadResume(file);
      await loadResumes();
    } catch (error) {
      console.error("Failed to upload resume:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      await resumesAPI.deleteResume(id);
      await loadResumes();
    } catch (error) {
      console.error("Failed to delete resume:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view resumes
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
            Resumes
          </h1>
          <p className="mt-2 text-gray-600">Manage your resume files</p>
        </div>
        <label className="btn-primary flex items-center space-x-2 cursor-pointer">
          <Upload className="h-5 w-5" />
          <span>Upload Resume</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload New Resume
          </h3>
          <p className="text-gray-600 mb-4">
            Upload your resume in PDF, DOC, or DOCX format
          </p>
          <label className="btn-primary inline-flex items-center space-x-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Choose File</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Resumes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resumes...</p>
        </div>
      ) : resumes.length > 0 ? (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div key={resume.id} className="card card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {resume.filename}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Uploaded{" "}
                      {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="btn-secondary text-sm flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="btn-danger text-sm flex items-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No resumes yet
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Upload your first resume to get started with job applications
          </p>
          <label className="btn-primary cursor-pointer">
            <Upload className="h-5 w-5 mr-2" />
            Upload Your First Resume
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ResumesPage;
