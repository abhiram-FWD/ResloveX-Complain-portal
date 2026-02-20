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
import { Loader as LoaderIcon } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   Star Rating sub-component
───────────────────────────────────────────── */
const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl leading-none focus:outline-none transition-transform hover:scale-110"
          aria-label={`${star} star`}
        >
          <span
            className="transition-colors"
            style={{
              color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db'
            }}
          >
            ★
          </span>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-500 self-center">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Verification Card
───────────────────────────────────────────── */
const VerificationCard = ({ complaint, onVerified }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showReopen, setShowReopen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [reopenLoading, setReopenLoading] = useState(false);

  const hasBeforePhotos =
    complaint.photos && complaint.photos.length > 0;
  const hasAfterPhotos =
    complaint.resolutionPhotos && complaint.resolutionPhotos.length > 0;

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      await verifyResolution(complaint.complaintId, {
        isResolved: true,
        rating: rating || undefined,
        feedback: feedback.trim() || undefined,
      });
      toast.success('✅ Complaint verified and closed!');
      onVerified();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify resolution');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReopen = async () => {
    if (!reopenReason.trim()) return;
    setReopenLoading(true);
    try {
      await verifyResolution(complaint.complaintId, {
        isResolved: false,
        reason: reopenReason.trim(),
      });
      toast.success('🔄 Complaint reopened successfully');
      onVerified();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen complaint');
    } finally {
      setReopenLoading(false);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100"
      style={{ animation: 'slideDown 0.3s ease' }}
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Card header strip */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3">
        <h3 className="text-white font-bold text-base">
          Authority Has Marked This Resolved
        </h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Green info box */}
        <div className="flex gap-2.5 bg-green-50 border border-green-200 rounded-xl p-3.5">
          <span className="text-green-600 text-lg leading-none mt-0.5">ℹ️</span>
          <p className="text-sm text-green-800 leading-relaxed">
            Please verify if the issue is actually fixed before we close this
            complaint. Your confirmation helps us maintain accountability.
          </p>
        </div>

        {/* Resolution note from authority */}
        {complaint.resolutionNote && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Authority's Resolution Note
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {complaint.resolutionNote}
              </p>
            </div>
          </div>
        )}

        {/* Before / After photo comparison */}
        {(hasBeforePhotos || hasAfterPhotos) && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Before / After Comparison
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Before */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                  Before
                </p>
                {hasBeforePhotos ? (
                  <div className="space-y-1.5">
                    {complaint.photos.slice(0, 2).map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Before ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer
                                   hover:opacity-90 transition-opacity border border-gray-200"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                    <p className="text-xs text-gray-400">No photos</p>
                  </div>
                )}
              </div>

              {/* After */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  After
                </p>
                {hasAfterPhotos ? (
                  <div className="space-y-1.5">
                    {complaint.resolutionPhotos.slice(0, 2).map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`After ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer
                                   hover:opacity-90 transition-opacity border border-green-200"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                    <p className="text-xs text-gray-400">No photos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Main action area (hidden when reopen flow is active) ── */}
        {!showReopen ? (
          <>
            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate the resolution{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            {/* Feedback textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Feedback{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="Share your experience with how this was handled..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500
                           focus:border-transparent resize-none transition"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              {/* Confirm fixed */}
              <button
                onClick={handleConfirm}
                disabled={confirmLoading}
                className="w-full py-2.5 bg-green-600 text-white rounded-xl font-semibold
                           text-sm hover:bg-green-700 transition-colors disabled:opacity-60
                           flex items-center justify-center gap-2"
              >
                {confirmLoading
                  ? <><LoaderIcon className="animate-spin" size={15} /> Confirming…</>
                  : '✅ Yes, Issue is Fixed'}
              </button>

              {/* Trigger reopen flow */}
              <button
                onClick={() => setShowReopen(true)}
                disabled={confirmLoading}
                className="w-full py-2.5 border-2 border-red-400 text-red-600 rounded-xl
                           font-semibold text-sm hover:bg-red-50 transition-colors
                           disabled:opacity-50"
              >
                ❌ Not Fixed — Reopen
              </button>
            </div>
          </>
        ) : (
          /* ── Reopen flow ── */
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <span className="text-red-500 text-lg">⚠️</span>
              <p className="text-sm text-red-700 font-medium">
                Please describe what is still wrong so the authority can fix it.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason for reopening <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={4}
                placeholder="Describe what is still not fixed..."
                autoFocus
                className="w-full px-3 py-2.5 border border-red-300 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-red-400
                           focus:border-transparent resize-none transition"
              />
            </div>

            <div className="flex gap-2">
              {/* Cancel reopen */}
              <button
                onClick={() => { setShowReopen(false); setReopenReason(''); }}
                disabled={reopenLoading}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl
                           text-sm font-medium hover:bg-gray-50 transition-colors
                           disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Confirm reopen */}
              <button
                onClick={handleReopen}
                disabled={reopenLoading || !reopenReason.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm
                           font-semibold hover:bg-red-700 transition-colors
                           disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reopenLoading
                  ? <><LoaderIcon className="animate-spin" size={15} /> Reopening…</>
                  : 'Confirm Reopen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();

  const [complaint, setComplaint] = useState(null);
  const [slaInfo, setSlaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchComplaint = async () => {
    try {
      const data = await getComplaintById(id);
      // API returns { success, complaint, slaInfo }
      setComplaint(data.complaint);
      setSlaInfo(data.slaInfo || null);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);
  // Socket real-time updates
  useEffect(() => {
    if (!socket.ready || !id) return;
    socket.joinComplaintRoom(id);
    const handleUpdate = (updated) => {
      setComplaint(updated);
      toast.success(`Status updated: ${updated.status}`);
    };
    socket.on('complaint_updated', handleUpdate);
    return () => socket.off('complaint_updated', handleUpdate);
  }, [socket.ready, id]);

  if (loading) return <Loader />;

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Complaint Not Found</h2>
          <p className="text-gray-600 mb-4">
            No complaint found with ID:{' '}
            <span className="font-mono font-bold">{id}</span>
          </p>
          <button
            onClick={() => navigate('/track')}
            className="bg-[#3182ce] text-white px-6 py-2 rounded-lg font-medium
                       hover:bg-blue-700 transition-colors"
          >
            Go to Track Page
          </button>
        </div>
      </div>
    );
  }

  // Determine if the logged-in user is the complaint owner
  const citizenId =
    typeof complaint.citizen === 'object'
      ? complaint.citizen?._id
      : complaint.citizen;

  const showVerificationCard =
    complaint.status === 'pending_verification' &&
    isAuthenticated &&
    user?._id === citizenId;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ── */}
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
                  backgroundColor: `${
                    complaint.priority === 'urgent' ? '#e53e3e' :
                    complaint.priority === 'high'   ? '#d69e2e' :
                    complaint.priority === 'medium' ? '#3182ce' : '#718096'
                  }20`,
                  color:
                    complaint.priority === 'urgent' ? '#e53e3e' :
                    complaint.priority === 'high'   ? '#d69e2e' :
                    complaint.priority === 'medium' ? '#3182ce' : '#718096'
                }}
              >
                {complaint.priority}
              </span>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Location:</span> {complaint.location?.address}
                {complaint.location?.division && `, Division: ${complaint.location.division}`}
                {complaint.location?.zone && `, Zone: ${complaint.location.zone}`}
                {complaint.location?.ward && `, Ward: ${complaint.location.ward}`}
              </p>
              {slaInfo && (
                <p>
                  <span className="font-medium">SLA:</span>{' '}
                  <span className={slaInfo.isOverdue ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {slaInfo.isOverdue ? '⚠ Overdue' : `${slaInfo.daysRemaining} day(s) remaining`}
                  </span>
                </p>
              )}
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
                      className="w-full h-40 object-cover rounded-lg cursor-pointer
                                 hover:opacity-90 transition-opacity"
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

        {/* ── RIGHT COLUMN (Sidebar) ── */}
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
          <HandlerInfo
            authority={complaint.currentAuthority}
            assignedAt={complaint.timeline?.find(e => e.action === 'accepted')?.timestamp}
          />

          {/* ── Verification Card ── */}
          {showVerificationCard && (
            <VerificationCard
              complaint={complaint}
              onVerified={fetchComplaint}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
