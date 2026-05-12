import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const GROUP_URL = `${API_URL}/api/groups`;

const getGroups = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(GROUP_URL, config);
  return response.data;
};

const groupService = {
  getGroups,
};

export default groupService;
