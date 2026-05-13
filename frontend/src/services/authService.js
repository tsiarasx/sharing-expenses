import api from './api';

const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await api.post('/api/auth/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const updateProfile = async (userData) => {
  const response = await api.put('/api/auth/profile', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const deleteAccount = async () => {
  const response = await api.delete('/api/auth/profile');
  if (response.data) {
    localStorage.removeItem('user');
  }
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  updateProfile,
  deleteAccount,
};

export default authService;
