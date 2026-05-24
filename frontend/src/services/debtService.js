import api from './api';

const debtService = {
  getDebts: (groupId) => api.get(`/api/debts/${groupId}`).then(r => r.data),

  recordSettlement: (groupId, payeeId, amount, expenseId = null) =>
    api.post(`/api/debts/${groupId}/settle`, { payeeId, amount, expenseId }).then(r => r.data),

  getSettlementHistory: (groupId) =>
    api.get(`/api/debts/${groupId}/history`).then(r => r.data),
};

export default debtService;