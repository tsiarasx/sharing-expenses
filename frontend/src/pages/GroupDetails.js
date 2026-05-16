import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import expenseService from '../services/expenseService';
import { AuthContext } from '../context/AuthContext';

const GroupDetails = () => {
const { id } = useParams();
const navigate = useNavigate();
const { user } = useContext(AuthContext);

const [members, setMembers] = useState([]);
const [groupName, setGroupName] = useState('');

const [showExpenseForm, setShowExpenseForm] = useState(false);
const [description, setDescription] = useState('');
const [amount, setAmount] = useState('');
const [date, setDate] = useState('');
const [expenses, setExpenses] = useState([]);
const [paidBy, setPaidBy] = useState('');
const [splitMethod, setSplitMethod] = useState('Equal Split');
const [editingIndex, setEditingIndex] = useState(null);
const [editingId, setEditingId] = useState(null);
const [selectedExpense, setSelectedExpense] = useState(null);
const [customSplits, setCustomSplits] = useState({});
const [percentageSplits, setPercentageSplits] = useState({});

  useEffect(() => {
  const fetchExpenses = async () => {
    try {
      const groupResponse = await fetch(`http://localhost:5000/api/groups/${id}`, {
  headers: {
    Authorization: `Bearer ${user.token}`,
    },
  });

const groupData = await groupResponse.json();

setGroupName(groupData.name);
const formattedMembers = groupData.members.map((member) => ({
  id: member.user._id,
  name: member.user.name,
}));

setMembers(formattedMembers);

if (formattedMembers.length > 0) {
  setPaidBy(formattedMembers[0].id);
}
const data = await expenseService.getGroupExpenses(id);

const formattedExpenses = data.map((expense) => ({
  _id: expense._id,
  description: expense.description,
  amount: expense.totalAmount,
  paidBy: expense.payer?._id || expense.payer,
  paidByName: expense.payer?.name || 'Unknown',
  splitMethod: expense.splitMethod || 'Equal Split',
  date: expense.date || new Date(expense.createdAt).toLocaleDateString(),
  amountPerMember: expense.amountPerMember || null,
  customSplits: expense.customSplits || null,
  percentageSplits: expense.percentageSplits || null,
}));

setExpenses(formattedExpenses);
    } catch (error) {
      console.error(error);
    }
  };

  fetchExpenses();
}, [id, user.token]);
  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col pt-8">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-bold text-blue-800">SplitWise</h1>
          <p className="text-xs text-gray-600 mt-1">Manage shared expenses</p>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <Link to="/?tab=overview" className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="font-medium text-sm">Overview</span>
          </Link>

          <Link to="/?tab=groups" className="flex items-center gap-3 px-4 py-3 text-blue-700 bg-blue-50 rounded-lg transition-colors relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="font-medium text-sm">Groups</span>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-700 rounded-r-full"></div>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/?tab=groups')}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-blue-800">
              {groupName || 'Group Details'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <Link to="/profile" className="block w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-300 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
        </header>

        {/* Content Body */}
       
    <main className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
      <p className="text-sm text-gray-500">
        Add and manage shared group expenses.
      </p>
    </div>

    <button
  onClick={() => setShowExpenseForm(true)}
  className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
>
  Add Expense
</button>
  </div>
  {showExpenseForm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {editingIndex !== null ? 'Edit Expense' : 'Add Expense'}
      </h3>

      <div className="space-y-4 mb-6">

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Description
    </label>

    <input
  type="text"
  placeholder="Dinner, Trip, Hotel..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Amount
    </label>

    <input
  type="number"
  placeholder="0.00"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Date
    </label>

    <input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
  </div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Paid By
  </label>

  <select
  value={paidBy}
  onChange={(e) => setPaidBy(e.target.value)}
  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  {members.map((member) => (
  <option key={member.id} value={member.id}>
    {member.name}
  </option>
))}
</select>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Split Method
  </label>

  <select
  value={splitMethod}
  onChange={(e) => setSplitMethod(e.target.value)}
  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
    <option>Equal Split</option>
    <option>Exact Amounts</option>
    <option>Percentages</option>
  </select>
</div>
</div>

{splitMethod === 'Equal Split' && amount && (
  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
    <p className="text-sm font-medium text-blue-800 mb-2">
      Equal Split Preview
    </p>

    <p className="text-sm text-blue-700">
      Each member owes: €{(Number(amount) / members.length).toFixed(2)}
    </p>

    <p className="text-xs text-blue-600 mt-1">
      Split between {members.length} members
    </p>
  </div>
)}

{splitMethod === 'Exact Amounts' && (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <p className="text-sm font-medium text-gray-800 mb-3">
      Exact Amounts
    </p>

    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between gap-3">
  <span className="text-sm text-gray-700">{member.name}</span>

          <input
            type="number"
            placeholder="0.00"
            value={customSplits[member.name] || ''}
            onChange={(e) =>
              setCustomSplits({
                ...customSplits,
                [member.name]: e.target.value,
              })
            }
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>

    <div className="mt-4 border-t border-gray-200 pt-3">
      <div className="space-y-1 mb-3">
        {members.map((member) => (
        <p key={member.id} className="text-sm text-gray-600">
        {member.name} owes: €
        {(
          (Number(amount || 0) * Number(percentageSplits[member] || 0)) /
          100
          ).toFixed(2)}
        </p>
  ))}
</div>
      <p className="text-sm text-gray-600">
        Total assigned: €
        {Object.values(customSplits)
          .reduce((sum, value) => sum + Number(value || 0), 0)
          .toFixed(2)}
      </p>

      <p className="text-sm text-gray-600">
        Expense total: €{Number(amount || 0).toFixed(2)}
      </p>

      {amount &&
        Object.values(customSplits).reduce(
          (sum, value) => sum + Number(value || 0),
          0
        ) !== Number(amount) && (
          <p className="text-sm text-red-600 mt-2">
            The exact amounts must add up to the total expense.
          </p>
        )}
    </div>
  </div>
)}

{splitMethod === 'Percentages' && (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <p className="text-sm font-medium text-gray-800 mb-3">
      Percentages
    </p>

    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between gap-3"
        >
          <span className="text-sm text-gray-700">
            {member.name}
          </span>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="0"
              value={percentageSplits[member.name] || ''}
              onChange={(e) =>
                setPercentageSplits({
                  ...percentageSplits,
                  [member.name]: e.target.value,
                })
              }
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-4 border-t border-gray-200 pt-3">
       <div className="space-y-1 mb-3">
    {members.map((member) => (
      <p key={member.id} className="text-sm text-gray-600">
        {member.name} owes: €
        {(
          (Number(amount || 0) * Number(percentageSplits[member.name] || 0)) /
          100
        ).toFixed(2)}
      </p>
    ))}
  </div>

  <p className="text-sm text-gray-600">
    Total percentage:
        {' '}
        {Object.values(percentageSplits)
          .reduce((sum, value) => sum + Number(value || 0), 0)}
        %
      </p>

      {Object.values(percentageSplits).reduce(
        (sum, value) => sum + Number(value || 0),
        0
      ) !== 100 && (
        <p className="text-sm text-red-600 mt-2">
          Percentages must equal 100%.
        </p>
      )}
    </div>
  </div>
)}



      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowExpenseForm(false)}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>

        <button
 onClick={async () => {
  if (!description || !amount || !date) {
  alert('Please fill all fields.');
  return;
}

if (Number(amount) <= 0) {
  alert('Amount must be greater than 0.');
  return;
}
if (splitMethod === 'Exact Amounts') {
  const totalAssigned = Object.values(customSplits).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  if (totalAssigned !== Number(amount)) {
    alert('Exact amounts must equal the total expense.');
    return;
  }
}
if (splitMethod === 'Percentages') {
  const totalPercentage = Object.values(percentageSplits).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  if (totalPercentage !== 100) {
    alert('Percentages must equal 100%.');
    return;
  }
}
const expenseData = {
  groupId: id,
  description,
  totalAmount: Number(amount),
  date,
  payer: user._id,
  splitMethod,
  amountPerMember:
    splitMethod === 'Equal Split'
      ? Number((Number(amount) / members.length).toFixed(2))
      : null,
  customSplits:
    splitMethod === 'Exact Amounts'
      ? customSplits
      : null,
  percentageSplits:
    splitMethod === 'Percentages'
      ? percentageSplits
      : null,
  splits: [
    {
      user: user._id,
      amountOwed: Number(amount),
    },
  ],
};
if (editingIndex !== null && editingId) {
  await expenseService.updateExpense(editingId, expenseData);
} else {
  await expenseService.createExpense(expenseData);
}
  const newExpense = {
    description,
    amount,
    date,
    paidBy,
    splitMethod,
    amountPerMember: splitMethod === 'Equal Split'
    ? (Number(amount) / members.length).toFixed(2)
    : null,
  };

  if (editingIndex !== null) {
  const updatedExpenses = [...expenses];
  updatedExpenses[editingIndex] = newExpense;
  setExpenses(updatedExpenses);
  setEditingIndex(null);
  setEditingId(null);
} else {
  setExpenses([...expenses, newExpense]);
}
  setEditingIndex(null);
  setDescription('');
  setAmount('');
  setDate('');
  setPaidBy(members[0]);
  setSplitMethod('Equal Split');

  setShowExpenseForm(false);
}}
  className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800"
>
  {editingIndex !== null ? 'Update Expense' : 'Save Expense'}
</button>
      </div>
    </div>
  </div>
)}
  {selectedExpense && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Expense Details
      </h3>

      <div className="space-y-3 text-sm text-gray-700">
        <p><strong>Description:</strong> {selectedExpense.description}</p>
        <p><strong>Amount:</strong> €{selectedExpense.amount}</p>
        <p><strong>Date:</strong> {selectedExpense.date}</p>
        <p><strong>Paid by:</strong> {selectedExpense.paidByName}</p>
        <p><strong>Split:</strong> {selectedExpense.splitMethod}</p>
        {selectedExpense.splitMethod === 'Equal Split' && (
  <div>
    <strong>Amounts per member:</strong>

    {members.map((member) => {
      const perMemberAmount =
        selectedExpense.amountPerMember ||
        Number(selectedExpense.amount) / members.length;

      return (
        <p key={member.id}>
          {member.name}: €{Number(perMemberAmount).toFixed(2)}
        </p>
      );
    })}
  </div>
)}

        {selectedExpense.amountPerMember && (
          <p>
            <strong>Each member owes:</strong> €{selectedExpense.amountPerMember}
          </p>
        )}
       
      {selectedExpense.splitMethod === 'Equal Split' && selectedExpense.amountPerMember && (
  <div>
    <strong>Amounts per member:</strong>
    {members.map((member) => (
      <p key={member.id}>
        {member.name}: €{selectedExpense.amountPerMember}
      </p>
    ))}
  </div>
)}

{selectedExpense.splitMethod === 'Exact Amounts' && selectedExpense.customSplits && (
  <div>
    <strong>Amounts per member:</strong>
    {Object.entries(selectedExpense.customSplits).map(([member, value]) => (
      <p key={member.id}>
        {member.name}: €{Number(value || 0).toFixed(2)}
      </p>
    ))}
  </div>
)}

{selectedExpense.splitMethod === 'Percentages' && selectedExpense.percentageSplits && (
  <div>
    <strong>Amounts per member:</strong>
    {Object.entries(selectedExpense.percentageSplits).map(([member, value]) => (
      <p key={member.id}>
        {member.name}: €{((Number(selectedExpense.amount) * Number(value || 0)) / 100).toFixed(2)}
      </p>
    ))}
  </div>
)}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={() => setSelectedExpense(null)}
          className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
  <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
    <div className="flex items-center justify-between mb-6">
  <div>
    <h3 className="text-lg font-semibold text-gray-900">
      Total Expenses
    </h3>

    <p className="text-sm text-gray-500">
      {expenses.length} expense(s)
    </p>
  </div>

  <div className="text-2xl font-bold text-blue-700">
    €
    {expenses
      .reduce((total, expense) => total + Number(expense.amount), 0)
      .toFixed(2)}
  </div>
</div>

  {expenses.length === 0 ? (
    <p className="text-gray-500 text-sm">
      No expenses added yet.
    </p>
  ) : (
    <div className="space-y-4">
      {expenses.map((expense, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <h4 className="font-semibold text-gray-900">
              {expense.description}
            </h4>

            <p className="text-sm text-gray-500">
              Paid by {expense.paidByName}
            </p>

          <p className="text-sm text-gray-500">
          Split: {expense.splitMethod}
          </p>
          {expense.amountPerMember && (
             <p className="text-sm text-gray-500">
                Each member owes: €{expense.amountPerMember}
                </p>
          )}

          <p className="text-sm text-gray-400">
            {expense.date}
          </p>
          </div>

          <div className="flex items-center gap-4">

          <div className="text-lg font-bold text-blue-700">
             €{expense.amount}
          </div>

  <button
  onClick={() => {
    setEditingIndex(index);
    setEditingId(expense._id);
    setDescription(expense.description);
    setAmount(expense.amount);
    setDate(expense.date);
    setPaidBy(expense.paidBy);
    setSplitMethod(expense.splitMethod);
    setShowExpenseForm(true);
  }}
  className="text-sm text-blue-700 hover:underline"
>
  Edit
</button>
<button
  onClick={async () => {
    try {
      await expenseService.deleteExpense(expense._id);

      const updatedExpenses = expenses.filter(
        (_, expenseIndex) => expenseIndex !== index
      );

      setExpenses(updatedExpenses);
    } catch (error) {
      console.error(error);
      alert('Failed to delete expense.');
    }
  }}
  className="text-sm text-red-600 hover:underline"
>
  Delete
</button>
<button
  onClick={() => {
  console.log(expense);
  setSelectedExpense(expense);
}}
  className="text-sm text-gray-700 hover:underline"
>
  Preview
</button>

</div>
        </div>
      ))}
    </div>
  )}

</div>

</main>
      </div>
    </div>
  );
};

export default GroupDetails;
