import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const GROUP_URL = `${API_URL}/api/groups`;

// Get all groups for the logged-in user
const getGroups = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(GROUP_URL, config);
  return response.data;
};

// Create a new group
const createGroup = async (groupData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(GROUP_URL, groupData, config);
  return response.data;
};

// Get a single group by ID
const getGroupById = async (groupId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${GROUP_URL}/${groupId}`, config);
  return response.data;
};

// Add member to group
const addMemberToGroup = async (groupId, memberData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${GROUP_URL}/${groupId}/members`, memberData, config);
  return response.data;
};

const groupService = {
  getGroups,
  createGroup,
  getGroupById,
  addMemberToGroup,
};

export default groupService;
