import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl font-bold text-blue-400">ResolveX</h2>
            <p className="text-gray-400 mt-2 text-sm">Empowering citizens, resolving complaints efficiently.</p>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200">About</Link>
            <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors duration-200">How It Works</Link>
            <Link to="/dashboard/public" className="text-gray-300 hover:text-white transition-colors duration-200">Public Dashboard</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">Contact</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} ResolveX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
