import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, CheckCircle, Star, AlertTriangle,
  Upload, X, Loader as LoaderIcon, ImagePlus
} from 'lucide-react';
import {
  getAssignedComplaints, getAuthorityStats,
  acceptComplaint, forwardComplaint, resolveComplaint, markInProgress
} from '../services/complaintService';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import StatsCard from '../components/common/StatsCard';
import OfficerScorecard from '../components/authority/OfficerScorecard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const ModalOverlay = ({ onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center sm:p-4"
    style={{ backgroundColor: 'rgba(0,0,0,0.55)', animation: 'fadeInOverlay 0.2s ease' }}
    onMouseDown={(e) => e.target === e.currentTarget && onClose()}
  >
    <div
      className="bg-white w-full h-full sm:h-auto sm:rounded-2xl sm:shadow-2xl sm:max-w-md overflow-y-auto"
      style={{ animation: 'slideUpModal 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      {children}
    </div>
    <style>{`
      @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUpModal {
        from { opacity: 0; transform: translateY(24px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
  </div>
);

const AcceptModal = ({ complaint, onClose, onSuccess }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const handleClose = () => { if (!loading) onClose(); };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await acceptComplaint(complaint.complaintId, note);
      toast.success('Complaint accepted successfully! ✅');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Accept Complaint</h3>
            <p className="text-sm font-medium text-gray-700 mt-1">{complaint.title}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{complaint.complaintId}</p>
          </div>
          <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 ml-4 mt-0.5">
            <X size={20} />
          </button>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Note <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <LoaderIcon className="animate-spin" size={15} />}
            {loading ? 'Accepting…' : 'Confirm Accept'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const ForwardModal = ({ complaint, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [authorityId, setAuthorityId] = useState('');
  const [loading, setLoading] = useState(false);

  const MIN_CHARS = 20;
  const charOk = reason.length >= MIN_CHARS;
  const canSubmit = charOk && authorityId.trim() && !loading;
  const handleClose = () => { if (!loading) onClose(); };

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await forwardComplaint(complaint.complaintId, authorityId.trim(), reason);
      toast.success('Complaint forwarded successfully! 📤');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to forward complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Forward Complaint</h3>
          <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-600 disabled:opacity-40"><X size={20} /></button>
        </div>
        <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 mb-5">
          <p className="text-sm text-orange-900 leading-relaxed">
            <span className="font-bold text-orange-700">⚠️ Important: </span>
            The reason you provide <span className="font-semibold underline">WILL</span> be visible to the citizen permanently.
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for forwarding <span className="text-red-500">*</span></label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this complaint is being forwarded..."
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition disabled:bg-gray-50"
          />
          <div className="flex justify-between items-center mt-1.5">
            <p className={`text-xs font-medium ${charOk ? 'text-green-600' : 'text-red-500'}`}>
              {charOk ? '✓ Minimum reached' : `${MIN_CHARS - reason.length} more characters needed`}
            </p>
            <p className={`text-xs font-mono ${charOk ? 'text-green-600' : 'text-gray-400'}`}>{reason.length}/{MIN_CHARS} minimum</p>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Authority email to forward to <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={authorityId}
            onChange={(e) => setAuthorityId(e.target.value)}
            placeholder="Enter authority's email (e.g. officer@gmail.com)"
            disabled={loading}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={handleConfirm} disabled={!canSubmit} className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <LoaderIcon className="animate-spin" size={15} />}
            {loading ? 'Forwarding…' : 'Confirm Forward'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const ResolveModal = ({ complaint, onClose, onSuccess }) => {
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const canSubmit = note.trim() && photos.length >= 1 && !loading;
  const handleClose = () => { if (!loading) onClose(); };

  const processFiles = useCallback((files) => {
    const valid = Array.from(files).filter((f) => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5 MB`); return false; }
      return true;
    });
    setPhotos((prev) => [...prev, ...valid].slice(0, 3));
  }, []);

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resolutionNote', note);
      photos.forEach((p) => formData.append('photos', p));
      await resolveComplaint(complaint.complaintId, formData);
      toast.success('Complaint marked as resolved! 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Mark as Resolved</h3>
            <p className="text-sm font-medium text-gray-700 mt-1">{complaint.title}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{complaint.complaintId}</p>
          </div>
          <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-600 disabled:opacity-40 ml-4"><X size={20} /></button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Resolution Note <span className="text-red-500">*</span></label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe how the issue was resolved..."
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition disabled:bg-gray-50"
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Resolution Photos <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal text-xs"> (min 1, max 3, 5 MB each)</span>
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
              ${dragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50/40'}
              ${loading ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => processFiles(e.target.files)} className="hidden" />
            <ImagePlus className={`mx-auto mb-2 ${dragging ? 'text-green-500' : 'text-gray-400'}`} size={32} />
            <p className="text-sm font-medium text-gray-600">{dragging ? 'Drop photos here!' : 'Click or drag & drop photos'}</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5 MB</p>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden">
                  <img src={URL.createObjectURL(photo)} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!loading) setPhotos((prev) => prev.filter((_, i) => i !== idx)); }}
                    disabled={loading}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow disabled:opacity-50"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button onClick={() => !loading && fileInputRef.current?.click()} disabled={loading}
                  className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors disabled:opacity-50">
                  <Upload size={18} />
                  <span className="text-xs">Add more</span>
                </button>
              )}
            </div>
          )}
          {photos.length === 0 && <p className="text-xs text-red-500 mt-1.5">At least 1 photo is required</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={handleConfirm} disabled={!canSubmit} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <LoaderIcon className="animate-spin" size={15} />}
            {loading ? 'Resolving…' : 'Mark Resolved'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
const AuthorityDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { socketRef } = useSocket(user?._id, user?.authorityInfo?.division);

  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // ── Fetch all data for this authority account ──
  const fetchAll = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setComplaints([]);
      setStats(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [complaintsData, statsData] = await Promise.all([
        getAssignedComplaints(),
        getAuthorityStats()
      ]);
      setComplaints(complaintsData.complaints || []);
      setStats(statsData.stats || null);
    } catch {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // ── Re-fetch whenever user/auth state changes (login/logout/switch account) ──
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Reset to empty when logged out ──
  useEffect(() => {
    if (!isAuthenticated) {
      setComplaints([]);
      setStats(null);
    }
  }, [isAuthenticated]);

  // ── Socket: new complaint in division ──
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !user) return;
    const handleNew = (complaint) => {
      toast.success('New complaint assigned to your division!');
      setComplaints((prev) => [complaint, ...prev]);
    };
    socket.on('new_complaint', handleNew);
    return () => socket.off('new_complaint', handleNew);
  }, [socketRef?.current, user]);

  // ── After any modal action: refresh both complaints AND stats ──
  const handleSuccess = async () => {
    closeModal();
    try {
      const [complaintsData, statsData] = await Promise.all([
        getAssignedComplaints(),
        getAuthorityStats()
      ]);
      setComplaints(complaintsData.complaints || []);
      setStats(statsData.stats || null);
    } catch {
      toast.error('Failed to refresh data');
    }
  };

  const openModal = (type, complaint) => {
    setSelectedComplaint(complaint);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedComplaint(null);
  };

  const handleMarkInProgress = async (complaint) => {
    try {
      await markInProgress(complaint.complaintId);
      toast.success('Marked as In Progress! 🔧');
      await handleSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (activeFilter === 'urgent') return c.priority === 'urgent' || c.priority === 'high';
    if (activeFilter === 'overdue') {
      return (
        c.sla?.deadline &&
        new Date(c.sla.deadline) < new Date() &&
        c.status !== 'resolved' &&
        c.status !== 'closed'
      );
    }
    return true;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'overdue', label: 'Overdue' }
  ];

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{user?.name}'s Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {user?.authorityInfo?.designation} — {user?.authorityInfo?.department} —{' '}
          {user?.authorityInfo?.division}
          {user?.authorityInfo?.zone && `, ${user.authorityInfo.zone}`}
        </p>
      </div>

      {/* Stats Cards */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Handled"    value={stats.totalHandled || 0}                                                      icon={<FileText size={24} />}      color="blue"   />
          <StatsCard title="Resolved On Time" value={stats.resolvedOnTime || 0}                                                    icon={<CheckCircle size={24} />}   color="green"  />
          <StatsCard title="Avg Rating"       value={stats.averageRating ? `${Number(stats.averageRating).toFixed(1)}/5` : 'N/A'} icon={<Star size={24} />}          color="yellow" />
          <StatsCard title="False Closures"   value={stats.falseClosuresCaught || 0}                                               icon={<AlertTriangle size={24} />} color="red"    />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {['Total Handled', 'Resolved On Time', 'Avg Rating', 'False Closures'].map((title) => (
            <div key={title} className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm">{title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
          ))}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left – Complaint Queue */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Complaints in Your Division</h2>
              <div className="flex gap-4 border-b border-gray-200">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`pb-2 font-medium transition-colors ${
                      activeFilter === f.key
                        ? 'text-[#3182ce] border-b-2 border-[#3182ce]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-gray-600 font-medium text-lg">No complaints in your division</p>
                  <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                filteredComplaints.map((complaint) => (
                  <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs text-gray-500 font-mono">{complaint.complaintId}</span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
                            style={{
                              backgroundColor: complaint.priority === 'urgent' ? '#fee2e2' : complaint.priority === 'high' ? '#fef3c7' : '#e0e7ff',
                              color: complaint.priority === 'urgent' ? '#dc2626' : complaint.priority === 'high' ? '#d97706' : '#3730a3'
                            }}
                          >
                            {complaint.priority}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-semibold capitalize"
                            style={{
                              backgroundColor:
                                complaint.status === 'in_progress' ? '#d1fae5' :
                                complaint.status === 'accepted' ? '#dbeafe' :
                                complaint.status === 'pending_verification' ? '#fef9c3' :
                                complaint.status === 'reopened' ? '#fee2e2' : '#f3f4f6',
                              color:
                                complaint.status === 'in_progress' ? '#065f46' :
                                complaint.status === 'accepted' ? '#1e40af' :
                                complaint.status === 'pending_verification' ? '#854d0e' :
                                complaint.status === 'reopened' ? '#991b1b' : '#374151'
                            }}
                          >
                            {complaint.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{complaint.title}</h3>
                        <p className="text-sm text-gray-600">{complaint.isAnonymous ? 'Anonymous' : complaint.citizen?.name}</p>
                        {complaint.sla?.deadline && new Date(complaint.sla.deadline) < new Date() && complaint.status !== 'resolved' && (
                          <p className="text-sm text-red-600 font-medium mt-1">⚠️ Overdue</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        {(complaint.status === 'submitted' || complaint.status === 'assigned') && (
                          <button onClick={() => openModal('accept', complaint)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            Accept
                          </button>
                        )}

                        {(complaint.status === 'accepted' || complaint.status === 'in_progress') && (
                          <>
                            <button
                              onClick={() => handleMarkInProgress(complaint)}
                              disabled={complaint.status === 'in_progress'}
                              className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                                complaint.status === 'in_progress' ? 'bg-yellow-400 cursor-default opacity-90' : 'bg-yellow-600 hover:bg-yellow-700'
                              }`}
                            >
                              {complaint.status === 'in_progress' ? '🔧 In Progress' : 'In Progress'}
                            </button>
                            <button onClick={() => openModal('forward', complaint)} className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors">
                              Forward
                            </button>
                            <button onClick={() => openModal('resolve', complaint)} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                              Resolve
                            </button>
                          </>
                        )}

                        {complaint.status === 'reopened' && (
                          <>
                            <button onClick={() => openModal('forward', complaint)} className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors">
                              Forward
                            </button>
                            <button onClick={() => openModal('resolve', complaint)} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
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

        {/* Right – Performance */}
        <div className="space-y-6">
          {stats && <OfficerScorecard stats={stats} />}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {complaints.slice(0, 5).map((c) => (
                <div key={c._id} className="text-sm text-gray-600 border-l-2 border-blue-500 pl-2">
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{c.status.replace(/_/g, ' ')}</p>
                </div>
              ))}
              {complaints.length === 0 && <p className="text-gray-500 text-sm">No recent activity</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'accept'   && selectedComplaint && <AcceptModal  complaint={selectedComplaint} onClose={closeModal} onSuccess={handleSuccess} />}
      {activeModal === 'forward'  && selectedComplaint && <ForwardModal complaint={selectedComplaint} onClose={closeModal} onSuccess={handleSuccess} />}
      {activeModal === 'resolve'  && selectedComplaint && <ResolveModal complaint={selectedComplaint} onClose={closeModal} onSuccess={handleSuccess} />}
    </div>
  );
};

export default AuthorityDashboard;