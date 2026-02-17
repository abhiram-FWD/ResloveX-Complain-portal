import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Track Complaint', path: '/track' },
    { name: 'Public Dashboard', path: '/dashboard/public' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <span className="text-2xl font-bold text-blue-600">ResolveX</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  {user?.name || 'User'}
                </span>
                
                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                  user?.role === 'authority' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                }`}>
                  {user?.role}
                </span>

                <Link
                  to={user?.role === 'authority' ? '/dashboard/authority' : '/dashboard/citizen'}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium transition-colors ml-2"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg absolute w-full left-0 top-full">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`font-medium ${
                  isActive(link.path) ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="border-t border-gray-100 pt-4">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{user?.name}</span>
                    <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded">
                      {user?.role}
                    </span>
                  </div>
                  <Link
                    to={user?.role === 'authority' ? '/dashboard/authority' : '/dashboard/citizen'}
                    onClick={closeMenu}
                    className="flex items-center gap-2 text-blue-600 font-medium"
                  >
                    <LayoutDashboard size={18} />
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex items-center gap-2 text-red-500 font-medium text-left"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block text-center text-blue-600 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="block text-center bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
