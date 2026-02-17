import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Star, AlertTriangle, Upload, X, Loader as LoaderIcon } from 'lucide-react';
import { getAssignedComplaints, getAuthorityStats, acceptComplaint, forwardComplaint, resolveComplaint } from '../services/complaintService';
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
  
  // Modal states
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  // Accept modal state
  const [acceptNote, setAcceptNote] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);
  
  // Forward modal state
  const [forwardReason, setForwardReason] = useState('');
  const [forwardToId, setForwardToId] = useState('');
  const [forwardLoading, setForwardLoading] = useState(false);
  
  // Resolve modal state
  const [resolveNote, setResolveNote] = useState('');
  const [resolvePhotos, setResolvePhotos] = useState([]);
  const [resolveLoading, setResolveLoading] = useState(false);

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

  // Modal handlers
  const openAcceptModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAcceptNote('');
    setShowAcceptModal(true);
  };

  const openForwardModal = (complaint) => {
    setSelectedComplaint(complaint);
    setForwardReason('');
    setForwardToId('');
    setShowForwardModal(true);
  };

  const openResolveModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResolveNote('');
    setResolvePhotos([]);
    setShowResolveModal(true);
  };

  const closeAllModals = () => {
    if (acceptLoading || forwardLoading || resolveLoading) return;
    setShowAcceptModal(false);
    setShowForwardModal(false);
    setShowResolveModal(false);
    setSelectedComplaint(null);
  };

  const refreshComplaints = async () => {
    try {
      const data = await getAssignedComplaints();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to refresh complaints:', err);
    }
  };

  // Accept handler
  const handleAccept = async () => {
    if (!selectedComplaint) return;
    setAcceptLoading(true);
    try {
      await acceptComplaint(selectedComplaint.complaintId, acceptNote);
      toast.success('Complaint accepted successfully');
      closeAllModals();
      await refreshComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept complaint');
    } finally {
      setAcceptLoading(false);
    }
  };

  // Forward handler
  const handleForward = async () => {
    if (!selectedComplaint || forwardReason.length < 20) return;
    setForwardLoading(true);
    try {
      await forwardComplaint(selectedComplaint.complaintId, forwardToId, forwardReason);
      toast.success('Complaint forwarded successfully');
      closeAllModals();
      await refreshComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to forward complaint');
    } finally {
      setForwardLoading(false);
    }
  };

  // Resolve handler
  const handleResolve = async () => {
    if (!selectedComplaint || !resolveNote || resolvePhotos.length === 0) return;
    setResolveLoading(true);
    try {
      const formData = new FormData();
      formData.append('resolutionNote', resolveNote);
      resolvePhotos.forEach(photo => {
        formData.append('resolutionPhotos', photo);
      });
      await resolveComplaint(selectedComplaint.complaintId, formData);
      toast.success('Complaint marked as resolved');
      closeAllModals();
      await refreshComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setResolveLoading(false);
    }
  };

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      if (!isUnder5MB) {
        toast.error(`${file.name} is over 5MB`);
      }
      return isValid && isUnder5MB;
    });
    setResolvePhotos(prev => [...prev, ...validFiles].slice(0, 3));
  };

  const removePhoto = (index) => {
    setResolvePhotos(prev => prev.filter((_, i) => i !== index));
  };

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
                            onClick={() => openAcceptModal(complaint)}
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
                              onClick={() => openForwardModal(complaint)}
                              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                            >
                              Forward
                            </button>
                            <button
                              onClick={() => openResolveModal(complaint)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                        {complaint.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => openForwardModal(complaint)}
                              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                            >
                              Forward
                            </button>
                            <button
                              onClick={() => openResolveModal(complaint)}
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

      {/* Accept Modal */}
      {showAcceptModal && selectedComplaint && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && closeAllModals()}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Accept Complaint</h3>
            <p className="text-sm text-gray-600 mb-1">{selectedComplaint.title}</p>
            <p className="text-xs text-gray-500 font-mono mb-4">{selectedComplaint.complaintId}</p>
            
            <textarea
              value={acceptNote}
              onChange={(e) => setAcceptNote(e.target.value)}
              placeholder="Add a note..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] mb-4"
            />
            
            <div className="flex gap-3">
              <button
                onClick={closeAllModals}
                disabled={acceptLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={acceptLoading}
                className="flex-1 px-4 py-2 bg-[#3182ce] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {acceptLoading && <LoaderIcon className="animate-spin" size={16} />}
                Confirm Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && selectedComplaint && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && closeAllModals()}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Forward Complaint</h3>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-800">
                <span className="font-semibold">⚠️ Warning:</span> The reason you provide WILL be visible to the citizen in their complaint timeline permanently.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for forwarding <span className="text-red-500">*</span>
              </label>
              <textarea
                value={forwardReason}
                onChange={(e) => setForwardReason(e.target.value)}
                placeholder="Explain why this complaint is being forwarded..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce]"
              />
              <p className={`text-xs mt-1 ${forwardReason.length >= 20 ? 'text-green-600' : 'text-red-600'}`}>
                {forwardReason.length}/20 minimum
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authority ID to forward to <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={forwardToId}
                onChange={(e) => setForwardToId(e.target.value)}
                placeholder="Enter authority ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce]"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeAllModals}
                disabled={forwardLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForward}
                disabled={forwardLoading || forwardReason.length < 20 || !forwardToId}
                className="flex-1 px-4 py-2 bg-[#3182ce] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {forwardLoading && <LoaderIcon className="animate-spin" size={16} />}
                Confirm Forward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedComplaint && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && closeAllModals()}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mark as Resolved</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Note <span className="text-red-500">*</span>
              </label>
              <textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce]"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Photos <span className="text-red-500">* (Min 1 photo)</span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3182ce] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="resolve-photo-upload"
                />
                <label htmlFor="resolve-photo-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600">Click or drag photos here</p>
                  <p className="text-xs text-gray-500 mt-1">Max 3 photos, 5MB each</p>
                </label>
              </div>
              
              {resolvePhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {resolvePhotos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeAllModals}
                disabled={resolveLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={resolveLoading || !resolveNote || resolvePhotos.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resolveLoading && <LoaderIcon className="animate-spin" size={16} />}
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
