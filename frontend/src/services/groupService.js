import api from './api';

// Get all groups for the logged-in user
const getGroups = async () => {
  const response = await api.get('/api/groups');
  return response.data;
};

// Create a new group
const createGroup = async (groupData) => {
  const response = await api.post('/api/groups', groupData);
  return response.data;
};

// Get a single group by ID
const getGroupById = async (groupId) => {
  const response = await api.get(`/api/groups/${groupId}`);
  return response.data;
};

// Add member to group
const addMemberToGroup = async (groupId, memberData) => {
  const response = await api.post(`/api/groups/${groupId}/members`, memberData);
  return response.data;
};

const groupService = {
  getGroups,
  createGroup,
  getGroupById,
  addMemberToGroup,
};

export default groupService;
