import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import debtService from '../services/debtService';
import { sendBulkDebtReminders } from '../services/invitationService';

/**
 * DebtSummary
 * Εμφανίζει:
 *  - Τι χρωστάει ο logged-in user σε άλλους (κόκκινο)
 *  - Τι του χρωστούν άλλοι (πράσινο)
 *  - Κουμπί "Mark as Settled" για κάθε χρέος που ΑΥΤΟΣ οφείλει
 *  - Ιστορικό εξοφλήσεων
 */
const DebtSummary = ({ groupId }) => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(null); // id of transaction being settled
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [debtData, historyData] = await Promise.all([
        debtService.getDebts(groupId),
        debtService.getSettlementHistory(groupId),
      ]);
      setTransactions(debtData.transactions || []);
      setHistory(historyData || []);
    } catch (err) {
      setError('Σφάλμα φόρτωσης χρεών.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleSettle = async (transaction) => {
    const key = `${transaction.from.id}-${transaction.to.id}`;
    try {
      setSettling(key);
      setError('');
      await debtService.recordSettlement(groupId, transaction.to.id, transaction.amount);
      // Ανανέωσε τα χρέη και το ιστορικό
      await fetchDebts();
    } catch (err) {
      setError('Σφάλμα κατά την εξόφληση.');
      console.error(err);
    } finally {
      setSettling(null);
    }
  };

  const handleRemindAllClick = async () => {
    // 1. Μαζεύουμε τα IDs των χρηστών που μας χρωστάνε από το transactions array του Δημήτρη
    // Στο theyOwe, ο οφειλέτης είναι στο t.from.id
    const debtorIds = theyOwe.map(t => t.from.id);

    if (debtorIds.length === 0) return;

    try {
      // 2. Χρησιμοποιούμε το groupId που έρχεται ως prop στο component
      await sendBulkDebtReminders(debtorIds, groupId);
      alert('Reminders were sent successfully to all debtors.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send bulk reminders.');
    }
  };

  // Χωρίζουμε σε «χρωστώ εγώ» και «μου χρωστούν»
  const iOwe = transactions.filter(t => t.from.id === user._id);
  const theyOwe = transactions.filter(t => t.to.id === user._id);
  const otherDebts = transactions.filter(
    t => t.from.id !== user._id && t.to.id !== user._id
  );

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <p className="text-gray-500 text-sm">Φόρτωση υπολογισμού χρεών...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Υπολογισμός Χρεών</h3>
          <p className="text-sm text-gray-500">Αυτόματος υπολογισμός βάσει εξόδων</p>
        </div>
        <button
          onClick={fetchDebts}
          className="text-sm text-blue-700 hover:underline"
        >
          ↻ Ανανέωση
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-gray-600 font-medium">Όλα εξοφλημένα!</p>
          <p className="text-gray-400 text-sm">Δεν υπάρχουν εκκρεμή χρέη στην ομάδα.</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* --- Χρωστώ εγώ --- */}
          {iOwe.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2 uppercase tracking-wide">
                💸 Χρωστώ εγώ
              </h4>
              <div className="space-y-2">
                {iOwe.map((t, idx) => {
                  const key = `${t.from.id}-${t.to.id}`;
                  const isSettling = settling === key;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Οφείλεις σε{' '}
                          <span className="text-red-700 font-semibold">{t.to.name}</span>
                        </p>
                        <p className="text-xs text-gray-500">Πάτα το κουμπί μόλις πληρώσεις</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-red-600">
                          €{t.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleSettle(t)}
                          disabled={isSettling}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {isSettling ? 'Καταχώρηση...' : '✓ Πλήρωσα'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- Μου χρωστούν --- */}
          {theyOwe.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">
                💰 Μου χρωστούν
              </h4>

              {/* ΚΟΥΜΠΙ REMIND ALL */}
              <button
                onClick={handleRemindAllClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                Remind All ({theyOwe.length})
              </button>

              <div className="space-y-2">
                {theyOwe.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-4 py-3"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Ο/Η{' '}
                      <span className="text-green-700 font-semibold">{t.from.name}</span>{' '}
                      σου χρωστάει
                    </p>
                    <span className="text-lg font-bold text-green-600">
                      €{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Υπόλοιπα χρέη ομάδας --- */}
          {otherDebts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                👥 Υπόλοιπα χρέη ομάδας
              </h4>
              <div className="space-y-2">
                {otherDebts.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-3"
                  >
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{t.from.name}</span>
                      {' → '}
                      <span className="font-medium">{t.to.name}</span>
                    </p>
                    <span className="text-base font-bold text-gray-700">
                      €{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Ιστορικό Εξοφλήσεων --- */}
      {history.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {showHistory ? '▲' : '▼'} Ιστορικό εξοφλήσεων ({history.length})
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {history.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-800">{s.payer.name}</span>
                    <span className="text-gray-500"> πλήρωσε στον/στην </span>
                    <span className="font-medium text-gray-800">{s.payee.name}</span>
                    <span className="text-gray-400 ml-2 text-xs">
                      {new Date(s.createdAt).toLocaleDateString('el-GR')}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-700">€{s.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebtSummary;
