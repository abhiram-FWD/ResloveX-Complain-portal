import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, CheckCircle, TrendingUp, Clock, Activity } from 'lucide-react';
import { getPublicDashboard } from '../services/complaintService';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const PublicDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPublicDashboard();
        setData(response);
      } catch (err) {
        console.error('Failed to fetch public dashboard:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  if (!data) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-gray-700 font-semibold text-lg">Failed to load dashboard data</p>
        <p className="text-gray-500 text-sm mt-1">Please refresh the page</p>
      </div>
    );
  }

  // Backend returns: { success, stats: { totalComplaints, totalResolved, activeComplaints, avgResolutionDays, onTimePercentage }, byCategory, byDepartment, recentResolved }
  const stats = data.stats || {};
  const categoryData = (data.byCategory || []).map(item => ({
    category: item._id || 'Unknown',
    total: item.total || 0,
    resolved: item.resolved || 0
  }));
  const deptData = data.byDepartment || [];
  const recentResolved = data.recentResolved || [];

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">ResolveX Public Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Live Data</span>
          </div>
        </div>
        <p className="text-gray-600">Real-time transparency into complaint resolution</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Complaints', value: stats.totalComplaints ?? 0, color: '#3182ce', Icon: FileText },
          { title: 'Total Resolved', value: stats.totalResolved ?? 0, color: '#38a169', Icon: CheckCircle },
          { title: 'On-Time Rate', value: `${stats.onTimePercentage ?? 0}%`, color: '#805ad5', Icon: TrendingUp },
          { title: 'Avg Resolution', value: `${stats.avgResolutionDays ?? 0} days`, color: '#d69e2e', Icon: Clock },
        ].map(({ title, value, color, Icon }) => (
          <div key={title} className="bg-white rounded-xl p-5 shadow-md" style={{ borderLeft: `4px solid ${color}` }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">{title}</p>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20` }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Active Complaints Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center gap-4">
        <Activity className="text-blue-600" size={28} />
        <div>
          <p className="font-semibold text-blue-900">Active Complaints</p>
          <p className="text-blue-700 text-sm">{stats.activeComplaints ?? 0} complaints currently being processed</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Complaints by Category */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Complaints by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} margin={{ bottom: 60 }}>
                <XAxis dataKey="category" angle={-35} textAnchor="end" fontSize={11} interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" name="Total" fill="#3182ce" radius={[4,4,0,0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#38a169" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-16">No data yet</p>
          )}
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Department Performance</h2>
          {deptData.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {deptData.map((dept, i) => {
                const pct = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                const barColor = pct >= 75 ? '#38a169' : pct >= 50 ? '#d69e2e' : '#e53e3e';
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate">{dept._id || 'Unknown'}</span>
                      <span className="text-gray-500 ml-2">{dept.resolved}/{dept.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-16">No department data yet</p>
          )}
        </div>
      </div>

      {/* Recently Resolved Complaints */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Resolved Complaints</h2>
        <div className="space-y-4">
          {recentResolved.length > 0 ? recentResolved.map(complaint => (
            <div key={complaint._id} className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Category: <span className="font-medium">{complaint.category}</span>
                {complaint.currentAuthority?.name && (
                  <> · Handled by <span className="font-medium">{complaint.currentAuthority.name}</span>
                  {complaint.currentAuthority?.authorityInfo?.designation && 
                    ` (${complaint.currentAuthority.authorityInfo.designation})`}</>
                )}
              </p>
              {complaint.citizenVerification?.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className={star <= complaint.citizenVerification.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                  ))}
                </div>
              )}
            </div>
          )) : (
            <p className="text-gray-500 text-center py-8">No recently resolved complaints</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
