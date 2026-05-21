import api from './api';

const createExpense = async (expenseData) => {
  const response = await api.post('/api/expenses', expenseData);
  return response.data;
};
const getGroupExpenses = async (groupId) => {
  const response = await api.get(`/api/expenses/${groupId}`);
  return response.data;
};
const deleteExpense = async (expenseId) => {
  const response = await api.delete(`/api/expenses/${expenseId}`);
  return response.data;
};
const updateExpense = async (expenseId, expenseData) => {
  const response = await api.put(
    `/api/expenses/${expenseId}`,
    expenseData
  );

  return response.data;
};
const expenseService = {
  createExpense,
  getGroupExpenses,
  deleteExpense,
  updateExpense,
};
export default expenseService;