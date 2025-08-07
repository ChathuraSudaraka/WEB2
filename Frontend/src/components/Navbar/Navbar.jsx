import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../store';
import { ShoppingBag, User, Search, Menu, X, Package, Settings, LogOut, History, LayoutDashboard } from 'lucide-react';
import Cart from '../../pages/Cart/Cart';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { getCartItemCount } = useCart();
  const totalItems = getCartItemCount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsCartOpen(false);
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    return 'User';
  };

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Zeus Style */}
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="text-2xl font-bold tracking-[0.2em] text-white hover:text-white/80 transition-colors duration-300"
                onClick={closeMenus}
              >
                DYNEX
              </Link>
            </div>

            {/* Desktop Navigation - Centered like Zeus */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              <Link 
                to="/blog" 
                className="text-white/70 hover:text-white transition-colors duration-300 font-semibold tracking-wide text-sm"
              >
                Blog
              </Link>
              <Link 
                to="/contact" 
                className="text-white/70 hover:text-white transition-colors duration-300 font-semibold tracking-wide text-sm"
              >
                Contact
              </Link>
            </div>

            {/* Right side - Cart and Login like Zeus */}
            <div className="flex items-center space-x-6">
              {/* Cart Icon */}
              <button
                onClick={toggleCart}
                className="relative text-white/70 hover:text-white transition-colors duration-300"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center text-white/70 hover:text-white transition-colors duration-300 space-x-2"
                  >
                    <User size={16} strokeWidth={1.5} />
                    <span className="hidden sm:block text-sm font-light tracking-wide">
                      {getUserDisplayName()}
                    </span>
                  </button>

                  {/* User Dropdown - More transparent like Zeus */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-black/80 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 z-50">
                      <div className="py-2">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white">{getUserDisplayName()}</p>
                          <p className="text-xs text-white/50">{user?.email}</p>
                        </div>

                        {/* Admin Links */}
                        {isAdmin() && (
                          <>
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                              onClick={closeMenus}
                            >
                              <LayoutDashboard className="mr-3" size={14} strokeWidth={1.5} />
                              Admin Dashboard
                            </Link>
                            <Link
                              to="/admin/products"
                              className="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                              onClick={closeMenus}
                            >
                              <Package className="mr-3" size={14} strokeWidth={1.5} />
                              Manage Products
                            </Link>
                            <Link
                              to="/admin/orders"
                              className="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                              onClick={closeMenus}
                            >
                              <History className="mr-3" size={14} strokeWidth={1.5} />
                              All Orders
                            </Link>
                            <Link
                              to="/admin/settings"
                              className="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                              onClick={closeMenus}
                            >
                              <Settings className="mr-3" size={14} strokeWidth={1.5} />
                              Settings
                            </Link>
                            <hr className="border-white/10 my-1" />
                          </>
                        )}

                        {/* Regular User Links - Hide only Profile for Admins */}
                        {!isAdmin() && (
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                            onClick={closeMenus}
                          >
                            <User className="mr-3" size={14} strokeWidth={1.5} />
                            My Profile
                          </Link>
                        )}
                        
                        {/* Order History - Show for all users */}
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                          onClick={closeMenus}
                        >
                          <History className="mr-3" size={14} strokeWidth={1.5} />
                          Order History
                        </Link>
                        
                        <hr className="border-white/10 my-1" />
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                        >
                          <LogOut className="mr-3" size={14} strokeWidth={1.5} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Login button exactly like Zeus
                <Link 
                  to="/login" 
                  className="px-5 py-1.5 border-2 border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-full transition-all duration-300 font-semibold tracking-wide text-sm"
                >
                  Log In
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden text-white/70 hover:text-white transition-colors duration-300"
              >
                {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/10 bg-black/90 backdrop-blur-xl rounded-b-lg mt-2">
                {/* Navigation Links */}
                <Link
                  to="/blog"
                  className="block px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors font-semibold"
                  onClick={closeMenus}
                >
                  Blog
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors font-semibold"
                  onClick={closeMenus}
                >
                  Contact
                </Link>

                {/* Cart Button for Mobile */}
                <button
                  onClick={() => {
                    toggleCart();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors font-semibold"
                >
                  <div className="flex items-center">
                    <ShoppingBag className="mr-3" size={16} strokeWidth={1.5} />
                    Shopping Cart
                  </div>
                  {totalItems > 0 && (
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </button>
                
                {/* Authentication Section */}
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div className="px-3 py-2 border-t border-white/10 mt-2">
                      <p className="text-sm font-medium text-white">{getUserDisplayName()}</p>
                      <p className="text-xs text-white/50">{user?.email}</p>
                    </div>

                    {/* Admin Links for Mobile */}
                    {isAdmin() && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                          onClick={closeMenus}
                        >
                          <LayoutDashboard className="mr-2" size={14} strokeWidth={1.5} />
                          Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/products"
                          className="flex items-center px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                          onClick={closeMenus}
                        >
                          <Package className="mr-2" size={14} strokeWidth={1.5} />
                          Manage Products
                        </Link>
                        <Link
                          to="/admin/orders"
                          className="flex items-center px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                          onClick={closeMenus}
                        >
                          <History className="mr-2" size={14} strokeWidth={1.5} />
                          All Orders
                        </Link>
                        <Link
                          to="/admin/settings"
                          className="flex items-center px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                          onClick={closeMenus}
                        >
                          <Settings className="mr-2" size={14} strokeWidth={1.5} />
                          Settings
                        </Link>
                      </>
                    )}

                    {/* Regular User Links for Mobile - Hide only Profile for Admins */}
                    {!isAdmin() && (
                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        onClick={closeMenus}
                      >
                        <User className="mr-2" size={14} strokeWidth={1.5} />
                        My Profile
                      </Link>
                    )}
                    
                    {/* Order History - Show for all users */}
                    <Link
                      to="/orders"
                      className="flex items-center px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      onClick={closeMenus}
                    >
                      <History className="mr-2" size={14} strokeWidth={1.5} />
                      Order History
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    >
                      <LogOut className="mr-2" size={14} strokeWidth={1.5} />
                      Logout
                    </button>
                  </>
                ) : (
                  // Login/Signup for unauthenticated users in mobile
                  <>
                    <div className="border-t border-white/10 mt-2 pt-2">
                      <Link
                        to="/login"
                        className="block px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors text-center font-medium"
                        onClick={closeMenus}
                      >
                        Log In
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-3 py-2 bg-white/10 text-white hover:bg-white/20 rounded-md transition-colors text-center font-medium mt-2"
                        onClick={closeMenus}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Drawer */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
