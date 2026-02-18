import api from './api';

export const createComplaint = async (formData) =>
  (await api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data;

export const getAllComplaints = async (filters = {}) =>
  (await api.get('/complaints', { params: filters })).data;

export const getComplaintById = async (id) =>
  (await api.get(`/complaints/${id}`)).data;

export const getMyComplaints = async () =>
  (await api.get('/complaints/my')).data;

export const acceptComplaint = async (id, note) =>
  (await api.post(`/authority/accept/${id}`, { note })).data;

export const forwardComplaint = async (id, toAuthorityId, reason) =>
  (await api.post(`/authority/forward/${id}`, 
  { toAuthorityId, reason })).data;

export const resolveComplaint = async (id, formData) =>
  (await api.post(`/authority/resolve/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data;

export const verifyResolution = async (id, isResolved, rating, feedback) =>
  (await api.post(`/authority/verify/${id}`, 
  { isResolved, rating, feedback })).data;

export const getPublicDashboard = async () =>
  (await api.get('/authority/dashboard/public')).data;

export const getOfficerScorecard = async (id) =>
  (await api.get(`/authority/scorecard/${id}`)).data;

export const getAssignedComplaints = async () =>
  (await api.get('/authority/complaints')).data;

export const getAuthorityStats = async () =>
  (await api.get('/authority/stats')).data;
