import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {

  const scrollToSection = (sectionId) => {
    if (window.location.pathname === '/') {
      // Already on home — scroll directly
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Go to home page with hash — browser handles scroll
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <footer className="text-white pt-12 pb-12 mt-auto" style={{ backgroundColor: '#1a202c' }}>
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Column 1: Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">ResolveX</h2>
            <p className="text-sm text-gray-400 mb-3 italic">
              Accountability-Driven. Transparent. Citizen-First.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              A modern complaint resolution platform that bridges the gap between citizens
              and authorities, ensuring every voice is heard and every issue is addressed
              with transparency and accountability.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/file-complaint" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  File Complaint
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Track Complaint
                </Link>
              </li>
              <li>
                <Link to="/dashboard/public" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Public Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-700 pt-6">
          <p className="text-center text-gray-500 text-sm">
            © 2025 ResolveX. Built for transparent governance.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;