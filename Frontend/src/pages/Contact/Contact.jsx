import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log('Contact form submitted:', formData);
  };

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
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                CONTACT
              </h1>
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent mt-4"></div>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Connect with DYNEX. We're here to elevate your style journey.
            </p>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Contact Information - Left Side */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500">
                <h3 className="text-2xl font-bold mb-8 text-center">Get In Touch</h3>
                
                <div className="space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center">
                      <FiMail className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Email Us</p>
                      <p className="text-white font-medium">contact@dynex.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center">
                      <FiPhone className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Call Us</p>
                      <p className="text-white font-medium">+1 (555) DYNEX-01</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center">
                      <FiMapPin className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Visit Us</p>
                      <p className="text-white font-medium">
                        DYNEX Studios<br/>
                        Fashion District, NYC 10018
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-bold mb-6 text-center">Business Hours</h4>
                <div className="space-y-3 text-center">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Monday - Friday</span>
                    <span className="text-white">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Saturday</span>
                    <span className="text-white">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sunday</span>
                    <span className="text-white">12:00 PM - 5:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-bold mb-6 text-center">Follow DYNEX</h4>
                <div className="flex justify-center space-x-6">
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center hover:from-white/30 hover:to-white/20 transition-all duration-300">
                    <FiInstagram className="text-white text-xl" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center hover:from-white/30 hover:to-white/20 transition-all duration-300">
                    <FiTwitter className="text-white text-xl" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center hover:from-white/30 hover:to-white/20 transition-all duration-300">
                    <FiFacebook className="text-white text-xl" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form - Right Side */}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500">
              <h3 className="text-2xl font-bold mb-8 text-center">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Your first name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Your last name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white transition-all duration-300"
                    required
                  >
                    <option value="" className="bg-gray-800">Select a subject</option>
                    <option value="general" className="bg-gray-800">General Inquiry</option>
                    <option value="sizing" className="bg-gray-800">Sizing Questions</option>
                    <option value="orders" className="bg-gray-800">Order Support</option>
                    <option value="returns" className="bg-gray-800">Returns & Exchanges</option>
                    <option value="collaboration" className="bg-gray-800">Brand Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-gray-400 resize-vertical transition-all duration-300"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-white to-gray-200 text-black font-bold py-4 px-8 rounded-lg hover:from-gray-100 hover:to-white transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>Send Message</span>
                  <FiSend className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
