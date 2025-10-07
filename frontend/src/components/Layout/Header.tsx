import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Briefcase, FileText, User, LogOut, Plus } from "lucide-react";

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobTracker
              </span>
            </Link>
          </div>

          {isAuthenticated && (
            <nav className="hidden md:flex space-x-2">
              <Link to="/jobs" className="nav-link">
                <Briefcase className="h-5 w-5" />
                <span>Jobs</span>
              </Link>
              <Link to="/resumes" className="nav-link">
                <FileText className="h-5 w-5" />
                <span>Resumes</span>
              </Link>
              <Link to="/applications" className="nav-link">
                <User className="h-5 w-5" />
                <span>Applications</span>
              </Link>
            </nav>
          )}

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/jobs/new"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Job</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 font-medium py-2 px-3 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
