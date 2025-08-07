import React, { useState, useEffect, useContext } from 'react';
import { userService } from '../../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit3, FiLoader } from 'react-icons/fi';
import AuthContext from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const result = await userService.getUserProfile();
      if (result.success) {
        setProfileData({
          firstName: result.data.firstName || '',
          lastName: result.data.lastName || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          address: result.data.address || '',
          city: result.data.city || '',
          postalCode: result.data.postalCode || '',
          country: result.data.country || ''
        });
      } else {
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      toast.error('Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await userService.updateUserProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Update user context if needed
        updateUser({
          ...user,
          name: `${profileData.firstName} ${profileData.lastName}`,
          firstName: profileData.firstName,
          lastName: profileData.lastName
        });
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchUserProfile(); // Reset to original data
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <FiLoader className="animate-spin" size={24} />
          <span className="text-lg">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background with tech texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23000'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23333' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                PROFILE
              </h1>
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent mt-4"></div>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Manage your personal information and preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-full flex items-center justify-center">
                  <FiUser size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-gray-400">{profileData.email}</p>
                </div>
              </div>
              
              <button
                onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300"
              >
                <FiEdit3 size={18} />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiUser className="inline mr-2" size={16} />
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiUser className="inline mr-2" size={16} />
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiMail className="inline mr-2" size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiPhone className="inline mr-2" size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiMapPin className="inline mr-2" size={16} />
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={profileData.country}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiMapPin className="inline mr-2" size={16} />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiMapPin className="inline mr-2" size={16} />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiMapPin className="inline mr-2" size={16} />
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={profileData.postalCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-white to-gray-200 text-black font-bold rounded-xl hover:from-gray-200 hover:to-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <FiLoader className="animate-spin" size={20} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={20} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
