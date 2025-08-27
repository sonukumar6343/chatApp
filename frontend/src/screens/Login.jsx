import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Users,
  Code,
  GitBranch,
  CheckCircle,
  XCircle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Toast functions
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const hideToast = () => {
    setToast(null);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      showToast("Welcome back! Logging you in...", "success");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex">
      {/* Left Side - Illustration/Features */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-600 to-slate-700 items-center justify-center p-8">
        <div className="max-w-lg text-white">
          {/* Collaborative Features Showcase */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Collaborate Better</h2>
            <p className="text-slate-300 text-lg">
              Join thousands of development teams who trust DevChat for seamless
              collaboration
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Team Collaboration</h3>
              </div>
              <p className="text-slate-200">
                Work together in real-time with your development team on
                projects
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Code Reviews</h3>
              </div>
              <p className="text-slate-200">
                Share code snippets, discuss implementations, and review
                together
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <GitBranch className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Project Management</h3>
              </div>
              <p className="text-slate-200">
                Organize your projects and track progress with integrated tools
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-slate-300 text-sm">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-slate-300 text-sm">Teams</div>
            </div>
            <div>
              <div className="text-2xl font-bold">50k+</div>
              <div className="text-slate-300 text-sm">Projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-700 mb-2">
              Welcome to DevChat
            </h1>
            <p className="text-slate-500">
              Sign in to collaborate with your development team
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <form onSubmit={submitHandler} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-slate-600 mb-2"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 bg-white/90"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-600 mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 pr-12 bg-white/90"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p
                className={`text-sm font-medium ${
                  toast.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={hideToast}
              className={`ml-4 inline-flex text-sm ${
                toast.type === "success"
                  ? "text-green-400 hover:text-green-600"
                  : "text-red-400 hover:text-red-600"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
