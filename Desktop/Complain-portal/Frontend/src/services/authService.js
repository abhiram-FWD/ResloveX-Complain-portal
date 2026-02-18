import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerCitizen = async (formData) => {
  const response = await api.post('/auth/register/citizen', formData);
  return response.data;
};

export const registerAuthority = async (formData) => {
  const response = await api.post('/auth/register/authority', formData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};
