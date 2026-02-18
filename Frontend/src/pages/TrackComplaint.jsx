import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader as LoaderIcon } from 'lucide-react';
import { getComplaintById, getAllComplaints } from '../services/complaintService';
import ComplaintCard from '../components/complaint/ComplaintCard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const TrackComplaint = () => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Fetch recent complaints on mount
  React.useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await getAllComplaints({ limit: 5 });
        setRecentComplaints(data.complaints || []);
      } catch (err) {
        console.error('Failed to fetch recent complaints:', err);
      } finally {
        setRecentLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error('Please enter a complaint ID');
      return;
    }

    setLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const data = await getComplaintById(searchId.trim());
      setSearchResult(data);
    } catch (err) {
      setSearchError('No complaint found with this ID');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Search Card */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Track Your Complaint
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Enter your complaint ID to check the status
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Complaint ID — e.g. REX20240001"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#3182ce] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <LoaderIcon className="animate-spin" size={20} />
            ) : (
              <Search size={20} />
            )}
            Search
          </button>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-1">{searchResult.title}</p>
                <p className="text-sm text-gray-600 mb-2">
                  Status: <span className="font-medium">{searchResult.status}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Category: {searchResult.category} | Location: {searchResult.address}
                </p>
              </div>
              <button
                onClick={() => navigate(`/complaint/${searchResult.complaintId}`)}
                className="bg-[#3182ce] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View Full Details
              </button>
            </div>
          </div>
        )}

        {/* Search Error */}
        {searchError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{searchError}</p>
          </div>
        )}
      </div>

      {/* Recent Complaints */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Complaints</h2>
        
        {recentLoading ? (
          <Loader />
        ) : recentComplaints.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent complaints found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentComplaints.map(complaint => (
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
  );
};

export default TrackComplaint;
