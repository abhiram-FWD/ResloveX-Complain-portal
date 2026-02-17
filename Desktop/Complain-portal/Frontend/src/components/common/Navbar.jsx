import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Track Complaint', path: '/track' },
    { name: 'Public Dashboard', path: '/dashboard/public' },
  ];

  const truncateUsername = (name) => {
    if (!name) return 'User';
    return name.length > 12 ? name.substring(0, 12) + '...' : name;
  };

  return (
    <nav 
      className="bg-white sticky top-0 z-[100]" 
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    >
      <div className="px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Tagline */}
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <span className="font-bold text-[#3182ce]" style={{ fontSize: '1.6rem' }}>
              ResolveX
            </span>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Complaint Portal
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `font-medium transition-colors duration-200 pb-1 ${
                    isActive
                      ? 'text-[#3182ce] border-b-2 border-[#3182ce]'
                      : 'text-gray-600 hover:text-[#3182ce]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Auth Buttons / User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  <User size={18} className="text-[#3182ce]" />
                  {truncateUsername(user?.name)}
                </span>
                
                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                  user?.role === 'citizen' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {user?.role}
                </span>

                <Link
                  to={user?.role === 'authority' ? '/dashboard/authority' : '/dashboard/citizen'}
                  className="flex items-center gap-1 text-gray-600 hover:text-[#3182ce] font-medium transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-50 font-medium transition-colors text-sm"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-[#3182ce] border border-[#3182ce] px-4 py-2 rounded font-medium hover:bg-blue-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#3182ce] text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors shadow-sm"
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
              className="text-gray-600 hover:text-[#3182ce] focus:outline-none"
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
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `font-medium ${isActive ? 'text-[#3182ce]' : 'text-gray-600'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            <div className="border-t border-gray-100 pt-4">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">
                      {truncateUsername(user?.name)}
                    </span>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      user?.role === 'citizen'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                  <Link
                    to={user?.role === 'authority' ? '/dashboard/authority' : '/dashboard/citizen'}
                    onClick={closeMenu}
                    className="flex items-center gap-2 text-[#3182ce] font-medium"
                  >
                    <LayoutDashboard size={18} />
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex items-center gap-2 text-red-500 border border-red-500 px-3 py-2 rounded font-medium text-left justify-center"
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
                    className="block text-center text-[#3182ce] border border-[#3182ce] px-4 py-2 rounded font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="block text-center bg-[#3182ce] text-white px-4 py-2 rounded font-medium"
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
