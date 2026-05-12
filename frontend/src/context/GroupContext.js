import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import groupService from '../services/groupService';

export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch groups when user is available
  useEffect(() => {
    if (user && user.token) {
      fetchGroups();
    } else {
      setGroups([]);
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupService.getGroups(user.token);
      setGroups(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    try {
      setLoading(true);
      setError(null);
      const newGroup = await groupService.createGroup(groupData, user.token);
      setGroups([...groups, newGroup]);
      return newGroup;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
      console.error('Error creating group:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGroupById = async (groupId) => {
    try {
      setLoading(true);
      setError(null);
      const group = await groupService.getGroupById(groupId, user.token);
      return group;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch group');
      console.error('Error fetching group:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMemberToGroup = async (groupId, memberData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedGroup = await groupService.addMemberToGroup(groupId, memberData, user.token);
      // Update the group in the local state
      setGroups(groups.map(g => g._id === groupId ? updatedGroup : g));
      return updatedGroup;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
      console.error('Error adding member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    getGroupById,
    addMemberToGroup,
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};
