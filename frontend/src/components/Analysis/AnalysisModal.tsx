import React, { useState } from "react";
import { analysisAPI } from "../../services/api";
import type { AnalysisScore, Resume } from "../../types/api";
import {
  X,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  resumes: Resume[];
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  resumes,
}) => {
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!selectedResumeId) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await analysisAPI.analyzeFit({
        job_id: jobId,
        resume_id: selectedResumeId,
      });
      setAnalysis(result);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.response?.data?.detail || err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Resume Fit Analysis
            </h2>
            <p className="text-gray-600 mt-1">
              Analyze how well your resume matches this job
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Job Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-1">Job Position</h3>
            <p className="text-gray-700">{jobTitle}</p>
          </div>

          {/* Resume Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Resume to Analyze
            </label>
            <div className="space-y-2">
              {resumes.map((resume) => (
                <label
                  key={resume.id}
                  className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                    selectedResumeId === resume.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="resume"
                    value={resume.id}
                    checked={selectedResumeId === resume.id}
                    onChange={(e) =>
                      setSelectedResumeId(Number(e.target.value))
                    }
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {resume.filename}
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded{" "}
                      {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <div className="mb-6">
            <button
              onClick={handleAnalyze}
              disabled={!selectedResumeId || loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  <span>Analyze Resume Fit</span>
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Score */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center mb-4">
                  {getScoreIcon(analysis.score)}
                  <span className="ml-2 text-lg font-semibold text-gray-700">
                    Compatibility Score
                  </span>
                </div>
                <div
                  className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreColor(
                    analysis.score
                  )} ${getScoreBgColor(analysis.score)}`}
                >
                  {analysis.score}%
                </div>
              </div>

              {/* Reasons */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Analysis Summary
                </h4>
                <div className="space-y-2">
                  {analysis.reasons.map((reason, index) => (
                    <p key={index} className="text-gray-700 text-sm">
                      • {reason}
                    </p>
                  ))}
                </div>
              </div>

              {/* Matched Keywords */}
              {analysis.matched_keywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Matched Keywords ({analysis.matched_keywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matched_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {analysis.missing_keywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                    Missing Keywords ({analysis.missing_keywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
