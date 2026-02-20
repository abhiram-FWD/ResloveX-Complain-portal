import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import FileComplaint from './pages/FileComplaint';
import TrackComplaint from './pages/TrackComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import PublicDashboard from './pages/PublicDashboard';

import Loader from './components/common/Loader';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) return <Loader full text="Initializing ResolveX..." />;

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public */}
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/admin/login"   element={<AdminLogin />} />
          <Route path="/track"         element={<TrackComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
          <Route path="/dashboard/public" element={<PublicDashboard />} />

          {/* Citizen only */}
          <Route path="/file-complaint" element={
            <ProtectedRoute roles={['citizen']}><FileComplaint /></ProtectedRoute>
          } />
          <Route path="/dashboard/citizen" element={
            <ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>
          } />

          {/* Authority only */}
          <Route path="/dashboard/authority" element={
            <ProtectedRoute roles={['authority']}><AuthorityDashboard /></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px', maxWidth: '360px' },
          success: { iconTheme: { primary: '#38a169', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#e53e3e', secondary: '#fff' } },
        }}
      />
      <AppContent />
    </AuthProvider>
  );
}

export default App;