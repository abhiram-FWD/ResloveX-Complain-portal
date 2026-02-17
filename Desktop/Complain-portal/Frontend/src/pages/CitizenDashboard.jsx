import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getUserComplaints } from '../services/complaintService';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import ComplaintCard from '../components/complaint/ComplaintCard';
import StatsCard from '../components/common/StatsCard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await getUserComplaints();
        setComplaints(data.complaints || []);
      } catch (err) {
        toast.error('Failed to fetch complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Socket notifications
  useEffect(() => {
    if (!socket || !user) return;

    const handleNotification = (notification) => {
      toast.success(notification.message || 'New update on your complaint');
      // Optionally refresh complaints
    };

    socket.socket.on('notification', handleNotification);

    return () => {
      socket.socket.off('notification', handleNotification);
    };
  }, [socket, user]);

  // Calculate stats
  const stats = {
    total: complaints.length,
    inProgress: complaints.filter(c => c.status === 'in_progress' || c.status === 'accepted').length,
    pendingVerification: complaints.filter(c => c.status === 'pending_verification').length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'submitted') return c.status === 'submitted' || c.status === 'assigned';
    if (activeFilter === 'in_progress') return c.status === 'in_progress' || c.status === 'accepted';
    if (activeFilter === 'pending_verification') return c.status === 'pending_verification';
    if (activeFilter === 'resolved') return c.status === 'resolved' || c.status === 'closed';
    return true;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'pending_verification', label: 'Pending Verification' },
    { key: 'resolved', label: 'Resolved' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome, {user?.name} 👋
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Complaints"
          value={stats.total}
          icon={<FileText size={24} />}
          color="blue"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Clock size={24} />}
          color="yellow"
        />
        <StatsCard
          title="Pending Verification"
          value={stats.pendingVerification}
          icon={<AlertCircle size={24} />}
          color="purple"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle size={24} />}
          color="green"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'text-[#3182ce] border-b-2 border-[#3182ce]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Complaint List */}
        <div className="p-6">
          {loading ? (
            <Loader />
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">📋 No complaints yet</p>
              <button
                onClick={() => navigate('/file-complaint')}
                className="bg-[#3182ce] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                File Your First Complaint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplaints.map(complaint => (
                <ComplaintCard
                  key={complaint._id}
                  complaint={complaint}
                  onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/file-complaint')}
        className="fixed bottom-8 right-8 bg-[#3182ce] text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 group"
        title="File New Complaint"
      >
        <Plus size={28} />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          File New Complaint
        </span>
      </button>
    </div>
  );
};

export default CitizenDashboard;
