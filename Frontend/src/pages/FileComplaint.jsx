import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Check, Info, Loader as LoaderIcon } from 'lucide-react';
import { createComplaint } from '../services/complaintService';
import toast from 'react-hot-toast';

const FileComplaint = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'medium',
    isAnonymous: false,
    address: '',
    division: '',
    zone: '',
    ward: '',
    photos: []
  });

  const categories = [
    { name: 'Road Maintenance', dept: 'PWD', days: 7, priority: 'medium' },
    { name: 'Street Lights', dept: 'Electricity Dept', days: 3, priority: 'high' },
    { name: 'Water Supply', dept: 'Water Board', days: 5, priority: 'high' },
    { name: 'Garbage Collection', dept: 'Municipal Corp', days: 2, priority: 'medium' },
    { name: 'Drainage', dept: 'PWD', days: 7, priority: 'high' },
    { name: 'Electricity', dept: 'Electricity Dept', days: 3, priority: 'urgent' },
    { name: 'Other', dept: 'Municipal Corp', days: 7, priority: 'low' }
  ];

  const selectedCategoryInfo = categories.find(c => c.name === formData.category);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (category) => {
    const categoryInfo = categories.find(c => c.name === category);
    setFormData(prev => ({
      ...prev,
      category,
      priority: categoryInfo?.priority || 'medium'
    }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleFileUpload = (files) => {
    const validFiles = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // Check file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        continue;
      }
      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    const totalFiles = formData.photos.length + validFiles.length;
    if (totalFiles > 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...validFiles]
    }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be 100 characters or less';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length > 1000) newErrors.description = 'Description must be 1000 characters or less';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('category', formData.category);
      submitFormData.append('description', formData.description);
      submitFormData.append('priority', formData.priority);
      submitFormData.append('isAnonymous', formData.isAnonymous);
      submitFormData.append('address', formData.address);
      if (formData.division) submitFormData.append('division', formData.division);
      if (formData.zone) submitFormData.append('zone', formData.zone);
      if (formData.ward) submitFormData.append('ward', formData.ward);
      
      formData.photos.forEach((photo) => {
        submitFormData.append('photos', photo);
      });

      const response = await createComplaint(submitFormData);
      setComplaintId(response.complaint?.complaintId || 'N/A');
      setShowSuccessModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const calculateDeadline = () => {
    if (!selectedCategoryInfo) return null;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + selectedCategoryInfo.days);
    return deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">File a Complaint</h1>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step < currentStep
                      ? 'bg-green-500 text-white'
                      : step === currentStep
                      ? 'bg-[#3182ce] text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <Check size={20} /> : step}
                </div>
                <span className="text-xs mt-2 text-gray-600">
                  {step === 1 ? 'Issue Details' : step === 2 ? 'Location' : 'Photos & Submit'}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* STEP 1: Issue Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Issue Details</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={100}
                placeholder="Brief description of the issue"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                <p className="text-xs text-gray-500 ml-auto">{formData.title.length}/100</p>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Category Info Box */}
            {selectedCategoryInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Info className="text-blue-600 mt-0.5" size={18} />
                <div className="text-sm text-blue-900">
                  <span className="font-medium">Department:</span> {selectedCategoryInfo.dept} |{' '}
                  <span className="font-medium">Expected Resolution:</span> {selectedCategoryInfo.days} days
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Provide detailed information about the issue"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                <p className="text-xs text-gray-500 ml-auto">{formData.description.length}/1000</p>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-4">
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <label key={p} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={formData.priority === p}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Anonymous */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">
                Submit anonymously
              </label>
              <div className="group relative">
                <Info className="text-gray-400 cursor-help" size={16} />
                <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 bg-gray-800 text-white text-xs rounded p-2 z-10">
                  Your identity hidden from officers but tracked internally
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                className="bg-[#3182ce] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter the location of the issue"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce] ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* Division, Zone, Ward */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => handleInputChange('division', e.target.value)}
                  placeholder="e.g. Division 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => handleInputChange('zone', e.target.value)}
                  placeholder="e.g. Zone B"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => handleInputChange('ward', e.target.value)}
                  placeholder="e.g. Ward 5-10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182ce]"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="text-blue-600 mt-0.5" size={18} />
              <div className="text-sm text-blue-900">
                Providing division and ward routes your complaint to the correct officer faster.
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-[#3182ce] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Photos and Submit */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos & Submit</h2>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photos
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#3182ce] transition-colors"
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input').click()}
              >
                <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                <p className="text-sm text-gray-600">
                  Click or drag photos here to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, JPEG, PNG, WEBP • Max 3 photos • 5MB each
                </p>
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <p className="text-xs text-gray-600 mt-2">
                <Info className="inline mr-1" size={14} />
                Photos optional but strongly recommended
              </p>
            </div>

            {/* Photo Previews */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Card */}
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-900">Summary</h3>
              <div className="text-sm text-gray-700">
                <p><span className="font-medium">Category:</span> {formData.category}</p>
                <p><span className="font-medium">Location:</span> {formData.address}</p>
                {selectedCategoryInfo && (
                  <>
                    <p><span className="font-medium">Expected Resolution:</span> {selectedCategoryInfo.days} days</p>
                    <p><span className="font-medium">Deadline:</span> {calculateDeadline()}</p>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#3182ce] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 sm:p-4">
          <div className="bg-white w-full h-full sm:h-auto sm:rounded-lg sm:max-w-md p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complaint Filed Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Your ID: <span className="font-mono font-bold text-[#3182ce]">{complaintId}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Save this ID to track your complaint
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/complaint/${complaintId}`)}
                className="flex-1 bg-[#3182ce] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Track This Complaint
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentStep(1);
                  setFormData({
                    title: '',
                    category: '',
                    description: '',
                    priority: 'medium',
                    isAnonymous: false,
                    address: '',
                    division: '',
                    zone: '',
                    ward: '',
                    photos: []
                  });
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                File Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileComplaint;
