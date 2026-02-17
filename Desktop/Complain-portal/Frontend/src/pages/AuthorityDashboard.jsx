import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Star, AlertTriangle } from 'lucide-react';
import { getAssignedComplaints, getAuthorityStats } from '../services/complaintService';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import StatsCard from '../components/common/StatsCard';
import OfficerScorecard from '../components/authority/OfficerScorecard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsData, statsData] = await Promise.all([
          getAssignedComplaints(),
          getAuthorityStats()
        ]);
        setComplaints(complaintsData.complaints || []);
        setStats(statsData);
      } catch (err) {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Socket for new complaints
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewComplaint = (complaint) => {
      toast.success('New complaint assigned to your division!');
      setComplaints(prev => [complaint, ...prev]);
    };

    socket.socket.on('new_complaint', handleNewComplaint);

    return () => {
      socket.socket.off('new_complaint', handleNewComplaint);
    };
  }, [socket, user]);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'urgent') return c.priority === 'urgent';
    if (activeFilter === 'overdue') {
      return c.slaDeadline && new Date(c.slaDeadline) < new Date() && 
             c.status !== 'resolved' && c.status !== 'closed';
    }
    return true;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'overdue', label: 'Overdue' }
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{user?.name}'s Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {user?.authorityInfo?.designation} — {user?.authorityInfo?.department} — {user?.authorityInfo?.division}
          {user?.authorityInfo?.zone && `, ${user.authorityInfo.zone}`}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Handled"
            value={stats.totalHandled || 0}
            icon={<FileText size={24} />}
            color="blue"
          />
          <StatsCard
            title="Resolved On Time"
            value={stats.resolvedOnTime || 0}
            icon={<CheckCircle size={24} />}
            color="green"
          />
          <StatsCard
            title="Avg Rating"
            value={stats.avgRating ? `${stats.avgRating.toFixed(1)}/5` : 'N/A'}
            icon={<Star size={24} />}
            color="yellow"
          />
          <StatsCard
            title="False Closures"
            value={stats.falseClosures || 0}
            icon={<AlertTriangle size={24} />}
            color="red"
          />
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Complaint Queue (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Complaints in Your Division
              </h2>
              
              {/* Filter Tabs */}
              <div className="flex gap-4 border-b border-gray-200">
                {filters.map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`pb-2 font-medium transition-colors ${
                      activeFilter === filter.key
                        ? 'text-[#3182ce] border-b-2 border-[#3182ce]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {filteredComplaints.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No complaints found</p>
              ) : (
                filteredComplaints.map(complaint => (
                  <div
                    key={complaint._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 font-mono">{complaint.complaintId}</span>
                          <span 
                            className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
                            style={{
                              backgroundColor: complaint.priority === 'urgent' ? '#fee' : complaint.priority === 'high' ? '#fef3c7' : '#e0e7ff',
                              color: complaint.priority === 'urgent' ? '#dc2626' : complaint.priority === 'high' ? '#d97706' : '#3730a3'
                            }}
                          >
                            {complaint.priority}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{complaint.title}</h3>
                        <p className="text-sm text-gray-600">
                          {complaint.isAnonymous ? 'Anonymous' : complaint.citizen?.name}
                        </p>
                        {complaint.slaDeadline && new Date(complaint.slaDeadline) < new Date() && 
                         complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                          <p className="text-sm text-red-600 font-medium mt-1">⚠️ Overdue</p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        {(complaint.status === 'submitted' || complaint.status === 'assigned') && (
                          <button
                            onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {complaint.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                            >
                              In Progress
                            </button>
                            <button
                              onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                            >
                              Forward
                            </button>
                            <button
                              onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                        {complaint.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                            >
                              Forward
                            </button>
                            <button
                              onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right - Performance (1/3) */}
        <div className="space-y-6">
          {/* Officer Scorecard */}
          {stats && (
            <OfficerScorecard stats={stats} />
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {complaints.slice(0, 5).map(c => (
                <div key={c._id} className="text-sm text-gray-600 border-l-2 border-blue-500 pl-2">
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.status}</p>
                </div>
              ))}
              {complaints.length === 0 && (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
