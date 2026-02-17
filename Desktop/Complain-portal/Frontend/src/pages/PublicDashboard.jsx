import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { getPublicDashboard } from '../services/complaintService';
import StatsCard from '../components/common/StatsCard';
import Loader from '../components/common/Loader';
import { getStatusColor } from '../utils/statusHelpers';

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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!data) {
    return <p className="text-center text-gray-500 py-12">Failed to load dashboard data</p>;
  }

  const onTimePercent = data.totalComplaints > 0 
    ? Math.round((data.resolvedOnTime / data.totalComplaints) * 100) 
    : 0;

  // Prepare chart data
  const categoryData = data.complaintsByCategory?.map(item => ({
    category: item._id,
    count: item.count
  })) || [];

  const statusData = data.statusBreakdown?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const statusColors = {
    submitted: '#718096',
    assigned: '#3182ce',
    accepted: '#553c9a',
    in_progress: '#d69e2e',
    pending_verification: '#38a169',
    resolved: '#2f855a',
    closed: '#1a202c',
    reopened: '#e53e3e'
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Complaints"
          value={data.totalComplaints || 0}
          icon={<FileText size={24} />}
          color="blue"
        />
        <StatsCard
          title="Resolved"
          value={data.resolvedComplaints || 0}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <StatsCard
          title="On-Time Resolution"
          value={`${onTimePercent}%`}
          icon={<TrendingUp size={24} />}
          color="purple"
        />
        <StatsCard
          title="Avg Resolution Time"
          value={`${data.avgResolutionDays?.toFixed(1) || 0} days`}
          icon={<Clock size={24} />}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Complaints by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#718096'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Department Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Resolved</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">On-Time %</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Days</th>
              </tr>
            </thead>
            <tbody>
              {data.departmentPerformance?.sort((a, b) => b.onTimePercent - a.onTimePercent).map((dept, index) => {
                const onTimeColor = dept.onTimePercent > 80 
                  ? 'text-green-600 bg-green-50' 
                  : dept.onTimePercent > 60 
                  ? 'text-yellow-600 bg-yellow-50' 
                  : 'text-red-600 bg-red-50';
                
                return (
                  <tr key={dept.department} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{dept.department}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{dept.total}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{dept.resolved}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${onTimeColor}`}>
                        {dept.onTimePercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{dept.avgDays.toFixed(1)}</td>
                  </tr>
                );
              })}
              {(!data.departmentPerformance || data.departmentPerformance.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No department data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Resolved Complaints */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Resolved Complaints</h2>
        <div className="space-y-4">
          {data.recentResolved?.slice(0, 5).map(complaint => (
            <div key={complaint._id} className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Resolved by <span className="font-medium">{complaint.resolvedBy?.name}</span>, {complaint.resolvedBy?.designation}
                {complaint.resolvedBy?.division && `, ${complaint.resolvedBy.division}`}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-600">
                  Resolved in <span className="font-medium text-green-600">{complaint.resolutionDays} days</span>
                </p>
                {complaint.citizenRating && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= complaint.citizenRating ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {(!data.recentResolved || data.recentResolved.length === 0) && (
            <p className="text-gray-500 text-center py-8">No recently resolved complaints</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
