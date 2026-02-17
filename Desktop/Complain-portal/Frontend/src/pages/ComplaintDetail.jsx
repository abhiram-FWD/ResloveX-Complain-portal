import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, verifyResolution } from '../services/complaintService';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import ComplaintTimeline from '../components/complaint/ComplaintTimeline';
import SLATimer from '../components/complaint/SLATimer';
import HandlerInfo from '../components/authority/HandlerInfo';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const ComplaintDetail = () => {
  const { id } = useParams(); // complaintId from URL
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Verification state
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await getComplaintById(id);
        setComplaint(data);
        setNotFound(false);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  // Socket real-time updates
  useEffect(() => {
    if (!socket || !id) return;

    // Join complaint room
    socket.joinComplaintRoom(id);

    // Listen for updates
    const handleUpdate = (updatedComplaint) => {
      setComplaint(updatedComplaint);
      toast.success(`Status updated: ${updatedComplaint.status}`);
    };

    socket.socket.on('complaint_updated', handleUpdate);

    return () => {
      socket.socket.off('complaint_updated', handleUpdate);
    };
  }, [socket, id]);

  const handleVerify = async (isResolved) => {
    setVerifyLoading(true);
    try {
      const data = {
        isResolved,
        rating: isResolved ? rating : undefined,
        feedback: isResolved ? feedback : undefined,
        reason: !isResolved ? rejectReason : undefined
      };

      await verifyResolution(id, data);
      toast.success(isResolved ? 'Complaint verified and closed' : 'Complaint reopened');
      
      // Reload complaint
      const updatedComplaint = await getComplaintById(id);
      setComplaint(updatedComplaint);
      setShowRejectReason(false);
      setRating(0);
      setFeedback('');
      setRejectReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify resolution');
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Complaint Not Found</h2>
          <p className="text-gray-600 mb-4">
            No complaint found with ID: <span className="font-mono font-bold">{id}</span>
          </p>
          <button
            onClick={() => navigate('/track')}
            className="bg-[#3182ce] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Track Page
          </button>
        </div>
      </div>
    );
  }

  const showVerificationCard = 
    complaint.status === 'pending_verification' &&
    isAuthenticated &&
    user?._id === complaint.citizen?._id;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Main Content (60%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-mono">{complaint.complaintId}</span>
              <StatusBadge status={complaint.status} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{complaint.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {complaint.category}
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium uppercase"
                style={{
                  backgroundColor: `${complaint.priority === 'urgent' ? '#e53e3e' : complaint.priority === 'high' ? '#d69e2e' : complaint.priority === 'medium' ? '#3182ce' : '#718096'}20`,
                  color: complaint.priority === 'urgent' ? '#e53e3e' : complaint.priority === 'high' ? '#d69e2e' : complaint.priority === 'medium' ? '#3182ce' : '#718096'
                }}
              >
                {complaint.priority}
              </span>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Location:</span> {complaint.address}
                {complaint.division && `, Division: ${complaint.division}`}
                {complaint.zone && `, Zone: ${complaint.zone}`}
                {complaint.ward && `, Ward: ${complaint.ward}`}
              </p>
              <p>
                <span className="font-medium">Created:</span> {formatDate(complaint.createdAt)}
              </p>
              {complaint.isAnonymous && (
                <p className="text-purple-600 font-medium">📌 Anonymous Complaint</p>
              )}
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">{complaint.description}</p>
            
            {complaint.photos && complaint.photos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Complaint Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {complaint.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Complaint ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(photo, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Journey</h2>
            <ComplaintTimeline timeline={complaint.timeline} />
          </div>
        </div>

        {/* RIGHT COLUMN - Sidebar (40%) */}
        <div className="space-y-6">
          {/* SLA Timer */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-900 mb-3">SLA Status</h3>
            <SLATimer 
              deadline={complaint.slaDeadline}
              createdAt={complaint.createdAt}
              status={complaint.status}
            />
          </div>

          {/* Handler Info */}
          <HandlerInfo handler={complaint.currentHandler} />

          {/* Verification Card */}
          {showVerificationCard && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Verify Resolution</h3>
              <p className="text-sm text-gray-600 mb-4">
                Authority has marked this complaint as resolved. Please verify if the issue is fixed.
              </p>

              {/* Resolution Note */}
              {complaint.resolutionNote && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <p className="text-sm text-gray-700">{complaint.resolutionNote}</p>
                </div>
              )}

              {/* Resolution Photos */}
              {complaint.resolutionPhotos && complaint.resolutionPhotos.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Resolution Photos</p>
                  <div className="grid grid-cols-2 gap-2">
                    {complaint.resolutionPhotos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Resolution ${idx + 1}`}
                        className="w-full h-24 object-cover rounded cursor-pointer"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!showRejectReason ? (
                <>
                  {/* Star Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate the service (optional)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-2xl focus:outline-none"
                        >
                          <span className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback (optional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      placeholder="Share your experience..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleVerify(true)}
                      disabled={verifyLoading}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      ✅ Issue Fixed — Close
                    </button>
                    <button
                      onClick={() => setShowRejectReason(true)}
                      disabled={verifyLoading}
                      className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      ❌ Not Fixed — Reopen
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Reject Reason */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why is the issue not fixed? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      placeholder="Please explain what's still wrong..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce]"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleVerify(false)}
                      disabled={verifyLoading || !rejectReason.trim()}
                      className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Submit and Reopen
                    </button>
                    <button
                      onClick={() => setShowRejectReason(false)}
                      disabled={verifyLoading}
                      className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
