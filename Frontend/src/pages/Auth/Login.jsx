import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, default to home
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear errors when user starts typing
    if (error) setError("");
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Real-time validation
    validateField(name, type === "checkbox" ? checked : value);
  };

  const validateField = (fieldName, value) => {
    let errorMessage = "";

    switch (fieldName) {
      case "email":
        if (!value.trim()) {
          errorMessage = "Email is required";
        } else if (!isValidEmail(value)) {
          errorMessage = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value.trim()) {
          errorMessage = "Password is required";
        } else if (value.length < 6) {
          errorMessage = "Password must be at least 6 characters";
        }
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));

    return errorMessage === "";
  };

  const validateForm = () => {
    const emailValid = validateField("email", formData.email);
    const passwordValid = validateField("password", formData.password);

    return emailValid && passwordValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({ email: "", password: "" });

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (result.success) {
        // Redirect to the page they were trying to visit or home
        navigate(from, { replace: true });
      } else {
        // Handle specific backend errors
        const errorMessage =
          result.error || "Login failed. Please check your credentials.";

        // Check for specific error messages from backend
        if (
          errorMessage.toLowerCase().includes("email") ||
          errorMessage.toLowerCase().includes("user not found") ||
          errorMessage.toLowerCase().includes("invalid email")
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            email: "Email address not found",
          }));
        } else if (
          errorMessage.toLowerCase().includes("password") ||
          errorMessage.toLowerCase().includes("invalid password")
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            password: "Incorrect password",
          }));
        } else if (
          errorMessage.toLowerCase().includes("invalid email or password")
        ) {
          // Generic invalid credentials error
          setError(
            "Invalid email or password. Please check your credentials and try again."
          );
        } else if (
          errorMessage.toLowerCase().includes("account") &&
          errorMessage.toLowerCase().includes("inactive")
        ) {
          setError(
            "Your account has been deactivated. Please contact support."
          );
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center')`,
          filter: 'blur(1px) brightness(0.3)'
        }}
      ></div>
      
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Subtle animated particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand - Zeus Style */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold tracking-[0.3em] text-white hover:text-white/80 transition-colors duration-300">
              DYNEX
            </h1>
          </Link>
          <p className="mt-4 text-white/60 font-light tracking-wide">
            Welcome back to the future
          </p>
        </div>

        {/* Clean Card */}
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-8 relative">
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl"></div>
          <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Sign In</h2>
            <p className="text-white/60 text-sm">
              Enter your credentials below
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-white/80 text-sm font-medium tracking-wide"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    className={`h-4 w-4 ${
                      fieldErrors.email ? "text-red-400" : "text-white/40"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                    fieldErrors.email ? "border-red-500/50" : "border-white/10"
                  } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-400 text-sm flex items-center mt-1">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-white/80 text-sm font-medium tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    className={`h-4 w-4 ${
                      fieldErrors.password ? "text-red-400" : "text-white/40"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                    fieldErrors.password
                      ? "border-red-500/50"
                      : "border-white/10"
                  } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-white/40 hover:text-white/60 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-white/40 hover:text-white/60 transition-colors" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-sm flex items-center mt-1">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-white/20 focus:ring-2"
                />
                <label htmlFor="rememberMe" className="text-white/60 text-sm">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                loading ||
                fieldErrors.email ||
                fieldErrors.password ||
                !formData.email ||
                !formData.password
              }
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-white hover:text-white/80 font-medium transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
