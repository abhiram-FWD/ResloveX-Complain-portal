import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  Eye, 
  CheckCircle, 
  FileText, 
  UserCheck, 
  Lock, 
  Clock, 
  Camera, 
  User, 
  TrendingUp,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import Loader from '../components/common/Loader';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getPublicStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch public stats:', error);
        // Fallback stats in case of error
        setStats({
          totalResolved: 0,
          onTimePercentage: 0,
          avgResolutionDays: 0,
          activeComplaints: 0
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Section 1: Hero Card */}
      <section className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-4xl mx-auto mt-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Report. Track. <span className="text-[#3182ce]">Resolve.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A transparent complaint system where every issue gets the attention it deserves.
            Join thousands of citizens making a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to={`/dashboard/${user.role}`}
                className="bg-[#3182ce] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/file-complaint"
                className="bg-[#3182ce] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
              >
                File a Complaint
              </Link>
            )}
            <Link
              to="/track"
              className="bg-white border-2 border-gray-200 hover:border-[#3182ce] text-gray-700 hover:text-[#3182ce] px-8 py-3 rounded-lg font-semibold transition-all text-lg"
            >
              Track Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Trust Badges */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Lock, text: "100% Secure" },
            { icon: Zap, text: "Instant Assignment" },
            { icon: Eye, text: "Full Transparency" },
            { icon: CheckCircle, text: "Verified Results" }
          ].map((badge, index) => (
            <div key={index} className="flex items-center justify-center gap-2 text-gray-600 bg-white py-3 rounded-xl border border-gray-100 shadow-sm">
              <badge.icon className="w-5 h-5 text-[#3182ce]" />
              <span className="font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Live Stats Bar */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-12 text-white">
        <div className="container mx-auto px-4">
          {loadingStats ? (
            <div className="flex justify-center">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
              <div>
                <div className="text-4xl font-bold mb-1">{stats?.totalResolved || 0}</div>
                <div className="text-blue-100">Issues Resolved</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">{stats?.onTimePercentage || 0}%</div>
                <div className="text-blue-100">On-Time Resolution</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">{stats?.avgResolutionDays || 0}</div>
                <div className="text-blue-100">Avg Days to Fix</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">{stats?.activeComplaints || 0}</div>
                <div className="text-blue-100">Active Complaints</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Problem vs Solution */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose ResolveX?</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Traditional Portals */}
          <div className="bg-white p-8 rounded-2xl border-2 border-red-100 shadow-sm">
            <h3 className="text-xl font-bold text-red-600 mb-6 pb-4 border-b border-red-50">Traditional Portals</h3>
            <div className="space-y-4">
              {[
                "Complaints get lost in the system",
                "No accountability for officials",
                "Indefinite waiting periods",
                "Zero transparency on progress",
                "Manual paper-based processing"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-gray-600">
                  <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ResolveX */}
          <div className="bg-white p-8 rounded-2xl border-2 border-green-100 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              BETTER WAY
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-6 pb-4 border-b border-green-50">ResolveX Platform</h3>
            <div className="space-y-4">
              {[
                "Real-time tracking available",
                "Strict SLA & deadlines",
                "Auto-escalation if delayed",
                "Full audit trail visible",
                "Digital, instant processing"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-gray-700 font-medium">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: How It Works */}
      <section className="container mx-auto px-4 bg-gray-50 py-16 rounded-3xl">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-12">
              {[
                { title: "Submit Complaint", desc: "File your issue with photos and location details in under 2 minutes." },
                { title: "Auto-Assigned", desc: "System instantly routes your complaint to the relevant department." },
                { title: "Authority Action", desc: "Official accepts liability and provides an estimated resolution date." },
                { title: "Track Progress", desc: "Watch the status change in real-time with SLA countdown timers." },
                { title: "Verification", desc: "You verify the solution before the complaint can be officially closed." }
              ].map((step, index) => (
                <div key={index} className="relative flex gap-8">
                  <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-white border-4 border-[#3182ce] text-[#3182ce] font-bold text-xl shadow-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Key Features */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600">Designed to bridge the gap between citizens and authorities</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Lock, title: "Responsibility Lock", desc: "Officials must accept complaints to start the timer." },
            { icon: Clock, title: "SLA Countdown", desc: "Visual timers ensure complaints aren't ignored." },
            { icon: Camera, title: "Photo Proof", desc: "Mandatory updated photos required for closure." },
            { icon: User, title: "Know Your Handler", desc: "See exactly who is working on your issue." },
            { icon: UserCheck, title: "Citizen Verification", desc: "Only you can close the complaint after satisfaction." },
            { icon: TrendingUp, title: "Auto-Escalation", desc: "Unresolved issues automatically move to higher authorities." }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-[#3182ce]">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7: CTA Banner */}
      <section className="container mx-auto px-4 mb-8">
        <div className="bg-gradient-to-r from-[#3182ce] to-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Ready to Make Your Voice Heard?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join the movement for better governance. It takes less than 2 minutes to file your first complaint.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-[#3182ce] hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;

