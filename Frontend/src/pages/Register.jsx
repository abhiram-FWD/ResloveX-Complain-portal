import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader as LoaderIcon, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [activeTab, setActiveTab] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [pendingApproval, setPendingApproval] = useState(false); // ← new

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    designation: '',
    department: '',
    division: '',
    zone: '',
    ward: '',
    jurisdictionArea: '',
    level: '',
    categoriesHandled: []
  });

  const designations = [
    'Field Officer', 'Junior Engineer', 'Senior Engineer', 'Department Head', 'Commissioner'
  ];

  const departments = [
    'Public Works Department', 'Water Board', 'Electricity Department', 'Municipal Corporation', 'Police'
  ];

  const categories = [
    'Road Maintenance', 'Street Lights', 'Water Supply', 'Garbage Collection', 'Drainage', 'Electricity', 'Other'
  ];

  const getLevelFromDesignation = (designation) => {
    const levelMap = {
      'Field Officer': 'field_officer',
      'Junior Engineer': 'junior',
      'Senior Engineer': 'senior',
      'Department Head': 'head',
      'Commissioner': 'commissioner'
    };
    return levelMap[designation] || 'junior';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'designation' ? { level: getLevelFromDesignation(value) } : {})
    }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categoriesHandled: prev.categoriesHandled.includes(category)
        ? prev.categoriesHandled.filter(c => c !== category)
        : [...prev.categoriesHandled, category]
    }));
    if (errors.categoriesHandled) setErrors(prev => ({ ...prev, categoriesHandled: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (activeTab === 'authority') {
      if (!formData.designation) newErrors.designation = 'Designation is required';
      if (!formData.department) newErrors.department = 'Department is required';
      if (formData.categoriesHandled.length === 0) newErrors.categoriesHandled = 'Please select at least one category';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };

      if (activeTab === 'authority') {
        submitData.authorityInfo = {
          designation: formData.designation,
          department: formData.department,
          division: formData.division,
          zone: formData.zone,
          ward: formData.ward,
          jurisdictionArea: formData.jurisdictionArea,
          level: formData.level,
          categories: formData.categoriesHandled,
        };
      }

      const response = await register(submitData, activeTab);

      // Authority → show pending screen instead of redirecting
      if (activeTab === 'authority' && response?.pending) {
        setPendingApproval(true);
      } else {
        toast.success('Account created! Please login.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Pending Approval Screen ──
  if (pendingApproval) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="bg-white w-full max-w-[480px] rounded-xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-5">
            <Clock size={32} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
          <p className="text-gray-600 mb-2">
            Your authority account registration is <span className="font-semibold text-yellow-600">pending admin approval</span>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Once the admin reviews and approves your application, you will be able to login with your credentials.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-yellow-800 text-sm font-medium mb-1">What happens next?</p>
            <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside">
              <li>Admin reviews your designation and department details</li>
              <li>Your account gets approved or rejected</li>
              <li>Once approved, login with your registered email and password</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#3182ce] text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
          <p className="text-gray-400 text-xs mt-4">
            Registered as: <span className="font-medium text-gray-600">{formData.email}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div
        className="bg-white w-full max-w-[600px] p-8"
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
        }}
      >
        <h1 className="text-3xl font-bold text-[#3182ce] mb-2 text-center">ResolveX</h1>
        <p className="text-gray-600 text-center mb-6">Create your account</p>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('citizen')}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'citizen'
                ? 'text-[#3182ce] border-b-2 border-[#3182ce] bg-white'
                : 'text-gray-600 bg-gray-50'
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => setActiveTab('authority')}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'authority'
                ? 'text-[#3182ce] border-b-2 border-[#3182ce] bg-white'
                : 'text-gray-600 bg-gray-50'
            }`}
          >
            Authority
          </button>
        </div>

        {/* Authority pending notice */}
        {activeTab === 'authority' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5">
            <p className="text-yellow-800 text-sm text-center">
              ⏳ Authority accounts require <span className="font-semibold">admin approval</span> before you can login
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Minimum 6 characters"
                className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Authority Fields */}
          {activeTab === 'authority' && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="text-lg font-semibold text-[#3182ce]">Official Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation <span className="text-red-500">*</span></label>
                <select
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent ${errors.designation ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Designation</option>
                  {designations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department <span className="text-red-500">*</span></label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[['division', 'Division', 'e.g. Division 2'], ['zone', 'Zone', 'e.g. Zone B'], ['ward', 'Ward', 'e.g. Ward 5-10']].map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <input
                      type="text"
                      value={formData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction Area</label>
                <input
                  type="text"
                  value={formData.jurisdictionArea}
                  onChange={(e) => handleInputChange('jurisdictionArea', e.target.value)}
                  placeholder="e.g. Station Road to MG Road"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] focus:border-transparent"
                />
              </div>

              {formData.level && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level (auto-filled)</label>
                  <input type="text" value={formData.level} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed capitalize" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories Handled <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.categoriesHandled.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-[#3182ce] border-gray-300 rounded focus:ring-[#3182ce]"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
                {errors.categoriesHandled && <p className="text-red-500 text-xs mt-1">{errors.categoriesHandled}</p>}
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#3182ce] text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          {loading ? <><LoaderIcon className="animate-spin" size={20} /> Creating Account...</> : 'Create Account'}
        </button>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#3182ce] font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;