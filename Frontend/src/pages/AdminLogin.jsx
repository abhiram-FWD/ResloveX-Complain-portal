import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, KeyRound, Loader as LoaderIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ADMIN_SECRET_KEY = 'RESOLVEX@ADMIN2026';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState('login'); // 'login' | 'secret'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Access denied. Admin credentials only.');
        localStorage.removeItem('resolvex_token');
        return;
      }
      setStep('secret');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecretKey = () => {
    setError('');
    if (!secretKey) { setError('Please enter the secret key'); return; }
    if (secretKey !== ADMIN_SECRET_KEY) {
      setError('Wrong secret key.');
      setSecretKey('');
      return;
    }
    toast.success('Access granted!');
    navigate('/dashboard/admin');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="bg-white w-full max-w-[380px] rounded-xl shadow-lg p-8">

        {/* Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center mb-3">
            {step === 'login' ? <Shield size={26} className="text-white" /> : <KeyRound size={26} className="text-white" />}
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {step === 'login' ? 'Admin Login' : 'Secret Key'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {step === 'login' ? 'Step 1 of 2' : 'Step 2 of 2'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 h-1 rounded-full bg-gray-900" />
          <div className={`flex-1 h-1 rounded-full transition-colors ${step === 'secret' ? 'bg-gray-900' : 'bg-gray-200'}`} />
        </div>

        {/* STEP 1 */}
        {step === 'login' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="admin@gmail.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Password"
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm text-center mb-4 bg-red-50 rounded-lg py-2">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><LoaderIcon className="animate-spin" size={17} /> Verifying...</> : 'Continue →'}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 'secret' && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5 text-center">
              <p className="text-yellow-800 text-xs">🔐 Enter your secret key to access the admin panel</p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Secret Key</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSecretKey()}
                  placeholder="Enter secret key"
                  autoFocus
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
                <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showSecret ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm text-center mb-4 bg-red-50 rounded-lg py-2">{error}</p>}

            <button
              onClick={handleSecretKey}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Access Dashboard →
            </button>

            <button
              onClick={() => { setStep('login'); setError(''); setSecretKey(''); }}
              className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-800"
            >
              ← Back
            </button>
          </>
        )}

        <p className="text-center text-gray-400 text-xs mt-5">
          Not admin?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">Regular login</button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;