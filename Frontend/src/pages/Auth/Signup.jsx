import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "",
  });

  const { signup } = useAuth();
  const navigate = useNavigate();

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
      case "firstName":
        if (!value.trim()) {
          errorMessage = "First name is required";
        } else if (value.trim().length < 2) {
          errorMessage = "First name must be at least 2 characters";
        }
        break;
      case "lastName":
        if (!value.trim()) {
          errorMessage = "Last name is required";
        } else if (value.trim().length < 2) {
          errorMessage = "Last name must be at least 2 characters";
        }
        break;
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
        } else if (value.length < 8) {
          errorMessage = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errorMessage = "Password must contain uppercase, lowercase, and number";
        }
        break;
      case "confirmPassword":
        if (!value.trim()) {
          errorMessage = "Please confirm your password";
        } else if (value !== formData.password) {
          errorMessage = "Passwords do not match";
        }
        break;
      case "agreeToTerms":
        if (!value) {
          errorMessage = "You must agree to the terms and conditions";
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
    const firstNameValid = validateField("firstName", formData.firstName);
    const lastNameValid = validateField("lastName", formData.lastName);
    const emailValid = validateField("email", formData.email);
    const passwordValid = validateField("password", formData.password);
    const confirmPasswordValid = validateField("confirmPassword", formData.confirmPassword);
    const agreeToTermsValid = validateField("agreeToTerms", formData.agreeToTerms);

    return firstNameValid && lastNameValid && emailValid && passwordValid && confirmPasswordValid && agreeToTermsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: "",
    });

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const result = await signup({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success) {
        // Redirect to home or dashboard
        navigate("/login");
      } else {
        // Handle specific backend errors
        const errorMessage = result.error || "Registration failed. Please try again.";
        
        if (errorMessage.toLowerCase().includes("email") && 
            errorMessage.toLowerCase().includes("exists")) {
          setFieldErrors(prev => ({ ...prev, email: "Email address is already registered" }));
        } else if (errorMessage.toLowerCase().includes("email")) {
          setFieldErrors(prev => ({ ...prev, email: "Invalid email address" }));
        } else if (errorMessage.toLowerCase().includes("password")) {
          setFieldErrors(prev => ({ ...prev, password: "Password does not meet requirements" }));
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const hasFieldErrors = Object.values(fieldErrors).some(error => error !== "");
  const hasEmptyFields = Object.entries(formData).some(([key, value]) => {
    if (key === "agreeToTerms") return !value;
    return !value.trim();
  });

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

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo/Brand - Zeus Style */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold tracking-[0.3em] text-white hover:text-white/80 transition-colors duration-300">
              DYNEX
            </h1>
          </Link>
          <p className="mt-4 text-white/60 font-light tracking-wide">
            Join the future today
          </p>
        </div>

        {/* Clean Card */}
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-8 relative">
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl"></div>
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Create Account</h2>
              <p className="text-white/60 text-sm">
                Fill in your details to get started
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

            {/* Signup Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-white/80 text-sm font-medium tracking-wide"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User
                        className={`h-4 w-4 ${
                          fieldErrors.firstName ? "text-red-400" : "text-white/40"
                        }`}
                      />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.firstName ? "border-red-500/50" : "border-white/10"
                      } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200`}
                    />
                  </div>
                  {fieldErrors.firstName && (
                    <p className="text-red-400 text-xs flex items-center mt-1">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-white/80 text-sm font-medium tracking-wide"
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User
                        className={`h-4 w-4 ${
                          fieldErrors.lastName ? "text-red-400" : "text-white/40"
                        }`}
                      />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                        fieldErrors.lastName ? "border-red-500/50" : "border-white/10"
                      } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200`}
                    />
                  </div>
                  {fieldErrors.lastName && (
                    <p className="text-red-400 text-xs flex items-center mt-1">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

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
                    placeholder="john@example.com"
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-white/80 text-sm font-medium tracking-wide"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      className={`h-4 w-4 ${
                        fieldErrors.confirmPassword ? "text-red-400" : "text-white/40"
                      }`}
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                      fieldErrors.confirmPassword
                        ? "border-red-500/50"
                        : "border-white/10"
                    } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-white/40 hover:text-white/60 transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/40 hover:text-white/60 transition-colors" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-red-400 text-sm flex items-center mt-1">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 bg-white/5 border border-white/20 rounded focus:ring-white/20 focus:ring-2"
                  />
                  <label htmlFor="agreeToTerms" className="text-white/60 text-sm leading-5">
                    I agree to the{" "}
                    <Link to="/terms" className="text-white hover:text-white/80 font-medium transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-white hover:text-white/80 font-medium transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {fieldErrors.agreeToTerms && (
                  <p className="text-red-400 text-sm flex items-center">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {fieldErrors.agreeToTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || hasFieldErrors || hasEmptyFields}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-white hover:text-white/80 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
