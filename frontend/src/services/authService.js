import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const AUTH_URL = `${API_URL}/api/auth`;

const register = async (userData) => {
  const response = await axios.post(`${AUTH_URL}/register`, userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${AUTH_URL}/login`, userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const updateProfile = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${AUTH_URL}/profile`, userData, config);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const deleteAccount = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${AUTH_URL}/profile`, config);
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
