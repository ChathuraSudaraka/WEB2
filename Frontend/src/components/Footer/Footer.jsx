import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin, FiArrowUp } from 'react-icons/fi';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23000'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23333' strokeWidth='0.5' opacity='0.2'/%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="mb-8">
                <h2 className="text-4xl font-bold tracking-wider mb-4">DYNEX</h2>
                <p className="text-gray-400 leading-relaxed">
                  Elevating streetwear culture through premium design and uncompromising quality. 
                  Where style meets substance.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-full flex items-center justify-center hover:from-white/20 hover:to-white/10 transition-all duration-300 group"
                >
                  <FiInstagram className="text-white group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-full flex items-center justify-center hover:from-white/20 hover:to-white/10 transition-all duration-300 group"
                >
                  <FiTwitter className="text-white group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-full flex items-center justify-center hover:from-white/20 hover:to-white/10 transition-all duration-300 group"
                >
                  <FiFacebook className="text-white group-hover:scale-110 transition-transform duration-300" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-white transition-colors duration-300">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/products?gender=MEN" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Men's Collection
                  </Link>
                </li>
                <li>
                  <Link to="/products?gender=WOMEN" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Women's Collection
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Categories</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/products?category=T-Shirts" className="text-gray-400 hover:text-white transition-colors duration-300">
                    T-Shirts
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Hoodies" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Hoodies & Sweatshirts
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Jeans" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Jeans & Denim
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Jackets" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Jackets & Outerwear
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Activewear" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Activewear
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm">DYNEX Studios</p>
                    <p className="text-gray-400 text-sm">Fashion District, NYC 10018</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FiPhone className="text-gray-400 flex-shrink-0" />
                  <p className="text-gray-400 text-sm">+1 (555) DYNEX-01</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FiMail className="text-gray-400 flex-shrink-0" />
                  <p className="text-gray-400 text-sm">contact@dynex.com</p>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-white mb-3">Store Hours</h4>
                <div className="text-gray-400 text-sm space-y-1">
                  <p>Mon-Fri: 9AM - 8PM</p>
                  <p>Sat: 10AM - 6PM</p>
                  <p>Sun: 12PM - 5PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
              <p className="text-gray-400 mb-8">
                Subscribe to get exclusive drops, style tips, and be the first to know about DYNEX releases.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-gray-400"
                />
                <button className="px-8 py-3 bg-gradient-to-r from-white to-gray-200 text-black font-bold rounded-lg hover:from-gray-100 hover:to-white transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
                <p className="text-gray-400 text-sm">
                  © 2025 DYNEX. All rights reserved.
                </p>
                <div className="flex items-center space-x-6 text-sm">
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Terms of Service
                  </Link>
                  <Link to="/returns" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Returns
                  </Link>
                </div>
              </div>
              
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-full flex items-center justify-center hover:from-white/20 hover:to-white/10 transition-all duration-300 group"
              >
                <FiArrowUp className="text-white group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
