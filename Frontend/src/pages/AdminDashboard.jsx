import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Clock, Users } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/authority/admin/pending');
      setPending(res.data.authorities || []);
    } catch {
      toast.error('Failed to fetch pending authorities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id, name) => {
    setActionLoading(id + '_approve');
    try {
      await api.post(`/authority/admin/approve/${id}`);
      toast.success(`${name} approved ✅`);
      setPending(prev => prev.filter(a => a._id !== id));
    } catch {
      toast.error('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}'s application?`)) return;
    setActionLoading(id + '_reject');
    try {
      await api.post(`/authority/admin/reject/${id}`);
      toast.success(`${name} rejected`);
      setPending(prev => prev.filter(a => a._id !== id));
    } catch {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authority Approvals</h1>
          <p className="text-gray-500 text-sm mt-0.5">Review and approve pending authority accounts</p>
        </div>
        <button
          onClick={fetchPending}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Counter badge */}
      <div className="flex items-center gap-2 mb-6">
        <Clock size={18} className="text-yellow-500" />
        <span className="font-semibold text-gray-800">{pending.length}</span>
        <span className="text-gray-500 text-sm">pending {pending.length === 1 ? 'request' : 'requests'}</span>
      </div>

      {/* Empty state */}
      {pending.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-20 text-center">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No pending approvals</p>
          <p className="text-gray-400 text-sm mt-1">All authority accounts are reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(authority => (
            <div key={authority._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

              {/* Name + email */}
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 text-lg">{authority.name}</h3>
                <p className="text-gray-500 text-sm">{authority.email}</p>
                {authority.phone && <p className="text-gray-400 text-sm">{authority.phone}</p>}
              </div>

              {/* Authority details grid */}
              {authority.authorityInfo && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Designation', value: authority.authorityInfo.designation },
                    { label: 'Department',  value: authority.authorityInfo.department },
                    { label: 'Division',    value: authority.authorityInfo.division },
                    { label: 'Zone',        value: authority.authorityInfo.zone },
                    { label: 'Ward',        value: authority.authorityInfo.ward },
                    { label: 'Level',       value: authority.authorityInfo.level },
                  ].filter(f => f.value).map(field => (
                    <div key={field.label} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400">{field.label}</p>
                      <p className="text-sm font-medium text-gray-800 capitalize">{field.value.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                  {authority.authorityInfo.categories?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 col-span-2">
                      <p className="text-xs text-gray-400">Categories</p>
                      <p className="text-sm font-medium text-gray-800">{authority.authorityInfo.categories.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-400 mb-4">
                Applied: {new Date(authority.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              {/* Approve / Reject buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(authority._id, authority.name)}
                  disabled={actionLoading !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {actionLoading === authority._id + '_approve' ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(authority._id, authority.name)}
                  disabled={actionLoading !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle size={18} />
                  {actionLoading === authority._id + '_reject' ? 'Rejecting...' : 'Disapprove'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;