import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Eye, CheckCircle, Lock, Clock, Camera, User, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getPublicDashboard } from '../services/complaintService';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isCitizen, isAuthority } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPublicDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleDashboardClick = () => {
    if (isCitizen) {
      navigate('/dashboard/citizen');
    } else if (isAuthority) {
      navigate('/dashboard/authority');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section 1 - Hero Card */}
      <section className="py-16 px-4">
        <div className="max-w-[800px] mx-auto bg-white rounded-lg shadow-md p-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Report. Track. Resolve.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A transparent complaint system where every issue gets the attention it deserves.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate('/file-complaint')}
                className="bg-[#3182ce] text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
              >
                File a Complaint
              </button>
              <button
                onClick={() => navigate('/track')}
                className="border-2 border-[#3182ce] text-[#3182ce] px-8 py-3 rounded-lg font-medium text-lg hover:bg-blue-50 transition-colors"
              >
                Track Complaint
              </button>
            </div>
          ) : (
            <button
              onClick={handleDashboardClick}
              className="bg-[#3182ce] text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </section>

      {/* Section 2 - Trust Badges */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🔒', text: '100% Secure' },
              { icon: '⚡', text: 'Instant Assignment' },
              { icon: '👁️', text: 'Full Transparency' },
              { icon: '✅', text: 'Verified Results' }
            ].map((badge, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="font-medium text-gray-900">{badge.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 - Live Stats Bar */}
      <section className="py-12 px-4">
        <div 
          className="max-w-6xl mx-auto rounded-lg shadow-lg p-8"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-white bg-opacity-30 rounded mb-2 animate-pulse" />
                    <div className="h-4 bg-white bg-opacity-20 rounded animate-pulse" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="text-center text-white">
                  <p className="text-3xl font-bold">{stats?.resolvedComplaints || 0}</p>
                  <p className="text-sm opacity-90">Issues Resolved</p>
                </div>
                <div className="text-center text-white">
                  <p className="text-3xl font-bold">
                    {stats?.totalComplaints > 0 
                      ? Math.round((stats.resolvedOnTime / stats.totalComplaints) * 100) 
                      : 0}%
                  </p>
                  <p className="text-sm opacity-90">On-Time Resolution</p>
                </div>
                <div className="text-center text-white">
                  <p className="text-3xl font-bold">{stats?.avgResolutionDays?.toFixed(1) || 0}</p>
                  <p className="text-sm opacity-90">Avg Days to Fix</p>
                </div>
                <div className="text-center text-white">
                  <p className="text-3xl font-bold">
                    {stats?.totalComplaints - stats?.resolvedComplaints || 0}
                  </p>
                  <p className="text-sm opacity-90">Active Complaints</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Section 4 - Problem vs Solution */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Problem Card */}
            <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-[#fc8181]">
              <h2 className="text-2xl font-bold text-red-600 mb-6">❌ Traditional Portals</h2>
              <div className="space-y-4">
                {[
                  'Complaints vanish with no tracking',
                  'No idea who is handling your issue',
                  'Issues closed without real fixing',
                  'No deadlines or accountability',
                  'Complaints forwarded silently'
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution Card */}
            <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-[#68d391]">
              <h2 className="text-2xl font-bold text-green-600 mb-6">✅ ResolveX</h2>
              <div className="space-y-4">
                {[
                  'Real-time tracking at every stage',
                  'See exact officer name and division',
                  'Photo proof required before closure',
                  'SLA deadlines with auto-escalation',
                  'Forwarding reason visible to citizen'
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          
          <div className="space-y-8">
            {[
              {
                num: 1,
                title: 'Submit Complaint',
                desc: 'Describe the issue, add photos, provide location'
              },
              {
                num: 2,
                title: 'Auto-Assigned to Division',
                desc: 'Routed to the right officer based on category and area'
              },
              {
                num: 3,
                title: 'Authority Accepts and Locks Responsibility',
                desc: 'Officer owns the complaint — no silent forwarding'
              },
              {
                num: 4,
                title: 'Track Every Step with SLA Timer',
                desc: 'See live countdown and who is handling it'
              },
              {
                num: 5,
                title: 'Verify Resolution Before Closure',
                desc: 'You confirm the fix — complaint stays open until you approve'
              }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-6 relative">
                {/* Vertical Line */}
                {idx < 4 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-300" />
                )}
                
                {/* Number Circle */}
                <div className="w-12 h-12 rounded-full bg-[#3182ce] text-white flex items-center justify-center font-bold text-lg flex-shrink-0 z-10">
                  {step.num}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 - Key Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What Makes ResolveX Different
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Lock size={28} />,
                title: 'Responsibility Lock',
                desc: 'Once accepted, authority owns it. No passing the buck.',
                color: '#3182ce'
              },
              {
                icon: <Clock size={28} />,
                title: 'SLA Countdown',
                desc: 'Every complaint has a deadline visible to everyone.',
                color: '#d69e2e'
              },
              {
                icon: <Camera size={28} />,
                title: 'Photo Proof Required',
                desc: 'Authorities upload before/after photos to close complaints.',
                color: '#38a169'
              },
              {
                icon: <User size={28} />,
                title: 'Know Your Handler',
                desc: 'See officer name, designation, division at all times.',
                color: '#553c9a'
              },
              {
                icon: <CheckCircle size={28} />,
                title: 'Citizen Verification',
                desc: 'Only you can confirm the complaint is resolved.',
                color: '#2f855a'
              },
              {
                icon: <TrendingUp size={28} />,
                title: 'Auto-Escalation',
                desc: 'Overdue complaints escalate automatically to seniors.',
                color: '#e53e3e'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                <div 
                  className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                    color: 'white'
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 - CTA Banner */}
      <section className="py-16 px-4">
        <div 
          className="max-w-4xl mx-auto rounded-lg shadow-lg p-12 text-center"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join citizens using ResolveX to create real change.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-[#3182ce] px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
