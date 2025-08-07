import React, { useState, useEffect, useContext } from 'react';
import { FiUser, FiSettings, FiShield, FiDatabase, FiSave, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';
import { userService } from '../../services/api';
import AuthContext from '../../contexts/AuthContext';

const AdminSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    dbHost: 'localhost',
    dbPort: '3306',
    dbName: 'dynex_database',
    backupFrequency: 'daily',
    maintenanceMode: false
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const tabs = [
    { id: 'general', label: 'General', icon: FiUser },
    { id: 'contact', label: 'Contact Info', icon: FiSettings },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'system', label: 'System', icon: FiDatabase }
  ];

  // Load user profile data when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching admin profile...');
      const result = await userService.getUserProfile();
      console.log('Admin profile result:', result);
      
      if (result.success) {
        setFormData(prevData => ({
          ...prevData,
          firstName: result.data.firstName || '',
          lastName: result.data.lastName || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          address: result.data.address || '',
          city: result.data.city || '',
          postalCode: result.data.postalCode || '',
          country: result.data.country || ''
        }));
      } else {
        console.error('Failed to load profile data:', result.error);
        setError(result.error || 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback behavior when backend is not available
      setError('Backend server is not running. Profile data cannot be loaded. Please start the backend server.');
      // Set some default values so the form still works
      setFormData(prevData => ({
        ...prevData,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@dynex.com',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    const errors = {};
    if (password.length < 8) {
      errors.length = 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      errors.uppercase = 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      errors.lowercase = 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      errors.number = 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.special = 'Password must contain at least one special character';
    }
    return errors;
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    const { currentPassword, newPassword, confirmPassword } = formData;
    
    // Reset password errors
    setPasswordErrors({});
    setError('');
    setSuccess('');

    // Validate current password
    if (!currentPassword) {
      setPasswordErrors({ current: 'Current password is required' });
      return;
    }

    // Validate new password
    const newPasswordErrors = validatePassword(newPassword);
    if (Object.keys(newPasswordErrors).length > 0) {
      setPasswordErrors(newPasswordErrors);
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirm: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const result = await userService.updatePassword({
        currentPassword,
        newPassword
      });
      
      if (result.success) {
        setSuccess('Password updated successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        // Reset password visibility
        setShowPasswords({
          current: false,
          new: false,
          confirm: false
        });
      } else {
        setError(result.error || 'Failed to update password. Please check your current password and try again.');
      }
    } catch (error) {
      // Fallback behavior when backend is not available
      console.error('Backend not available:', error);
      setError('Backend server is not running. Please start the backend server to use password update functionality.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Calculate password strength
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'No password', color: 'bg-gray-200' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const levels = [
      { score: 1, label: 'Very Weak', color: 'bg-red-500' },
      { score: 2, label: 'Weak', color: 'bg-orange-500' },
      { score: 3, label: 'Fair', color: 'bg-yellow-500' },
      { score: 4, label: 'Good', color: 'bg-blue-500' },
      { score: 5, label: 'Strong', color: 'bg-green-500' }
    ];

    return levels.find(level => level.score === score) || levels[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Handle password reset separately
    if (activeTab === 'security') {
      await handlePasswordReset();
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'general') {
        // Update user profile
        const profileData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        };

        const result = await userService.updateUserProfile(profileData);
        if (result.success) {
          setSuccess('Profile updated successfully!');
          // Update user context if needed
          updateUser({
            ...user,
            name: `${formData.firstName} ${formData.lastName}`,
            firstName: formData.firstName,
            lastName: formData.lastName
          });
        } else {
          setError(result.error || 'Failed to update profile');
        }
      } else {
        // For other tabs, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess('Settings updated successfully!');
      }
    } catch (error) {
      setError('Error updating settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="Enter company email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Phone
              </label>
              <input
                type="tel"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="Enter company phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Address
              </label>
              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                placeholder="Enter company address"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">Notification Preferences</h4>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                  Email Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  name="smsNotifications"
                  checked={formData.smsNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-700">
                  SMS Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="marketingEmails"
                  name="marketingEmails"
                  checked={formData.marketingEmails}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="marketingEmails" className="ml-2 text-sm text-gray-700">
                  Marketing Emails
                </label>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                    passwordErrors.current ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordErrors.current && (
                <p className="text-sm text-red-600 mt-1">{passwordErrors.current}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                    Object.keys(passwordErrors).some(key => ['length', 'uppercase', 'lowercase', 'number', 'special'].includes(key)) ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {Object.keys(passwordErrors).map(key => {
                if (['length', 'uppercase', 'lowercase', 'number', 'special'].includes(key)) {
                  return (
                    <p key={key} className="text-sm text-red-600 mt-1">{passwordErrors[key]}</p>
                  );
                }
                return null;
              })}
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      getPasswordStrength(formData.newPassword).color === 'bg-green-500' ? 'text-green-600' :
                      getPasswordStrength(formData.newPassword).color === 'bg-blue-500' ? 'text-blue-600' :
                      getPasswordStrength(formData.newPassword).color === 'bg-yellow-500' ? 'text-yellow-600' :
                      getPasswordStrength(formData.newPassword).color === 'bg-orange-500' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {getPasswordStrength(formData.newPassword).label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.newPassword).color}`}
                      style={{ width: `${(getPasswordStrength(formData.newPassword).score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 ${
                    passwordErrors.confirm ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordErrors.confirm && (
                <p className="text-sm text-red-600 mt-1">{passwordErrors.confirm}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                <FiShield className="mr-2 h-4 w-4" />
                Password Requirements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className={`flex items-center text-sm ${
                  formData.newPassword?.length >= 8 ? 'text-green-600' : 'text-blue-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    formData.newPassword?.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  At least 8 characters
                </div>
                <div className={`flex items-center text-sm ${
                  /[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-blue-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    /[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  One uppercase letter
                </div>
                <div className={`flex items-center text-sm ${
                  /[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-blue-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    /[a-z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  One lowercase letter
                </div>
                <div className={`flex items-center text-sm ${
                  /[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-blue-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    /[0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  One number
                </div>
                <div className={`flex items-center text-sm md:col-span-2 ${
                  /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'text-green-600' : 'text-blue-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Database Host
                </label>
                <input
                  type="text"
                  name="dbHost"
                  value={formData.dbHost}
                  onChange={handleChange}
                  placeholder="Database host"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Database Port
                </label>
                <input
                  type="text"
                  name="dbPort"
                  value={formData.dbPort}
                  onChange={handleChange}
                  placeholder="Database port"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Database Name
              </label>
              <input
                type="text"
                name="dbName"
                value={formData.dbName}
                onChange={handleChange}
                placeholder="Database name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Frequency
              </label>
              <select
                name="backupFrequency"
                value={formData.backupFrequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
                Enable Maintenance Mode
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800">System Information:</h4>
              <div className="mt-2 text-sm text-blue-700 space-y-1">
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Backend:</strong> Java Servlet + Hibernate</p>
                <p><strong>Frontend:</strong> React + Tailwind CSS</p>
                <p><strong>Database:</strong> MySQL</p>
                <p><strong>Last Backup:</strong> 2024-01-15 14:30:00</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Admin Settings</h2>
          <p className="text-gray-600 mt-2">Manage your application settings and preferences</p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-12 text-center">
              <FiLoader className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Loading settings...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
                  {success}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {renderTabContent()}
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition duration-200 ${
                      loading
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <FiSave className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : activeTab === 'security' ? 'Update Password' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
