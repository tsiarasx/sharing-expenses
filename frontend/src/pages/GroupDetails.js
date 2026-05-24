import React, { useState, useEffect, useContext, useCallback } from "react";  
import { useParams, Link, useNavigate } from "react-router-dom";  
import {  
  Users,  
  Receipt,  
  Wallet,  
  TrendingUp,  
  TrendingDown,  
  ArrowRight,  
  CheckCircle,  
  Clock,  
  Euro,  
  UserCircle,  
  Loader2,  
  ChevronLeft,  
} from "lucide-react";  
import { AuthContext } from "../context/AuthContext";  
import expenseService from '../services/expenseService';  
import debtService from '../services/debtService';  
import { sendInvitation } from '../services/invitationService';  
import NotificationBell from './NotificationBell';  
  
const formatEuro = (amount) =>  
  new Intl.NumberFormat("de-DE", {  
    style: "currency",  
    currency: "EUR",  
  }).format(Math.abs(amount));  
  
const safeGetId = (obj) => {  
  if (!obj) return "";  
  if (typeof obj === "string") return obj; 
  if (obj.userId) return obj.userId.toString(); 
  if (obj._id) return obj._id.toString();  
  if (obj.id) return obj.id.toString();  
  return obj.toString();  
};  
  
const transformGroupData = (data, realDebts) => {  
  const groupDetails = data.groupDetails || {};  
  const members = groupDetails.members || [];  
  const debts = realDebts || [];  
  const totalGroupExpenses = data.totalGroupExpenses ?? 0;  
  
  const balanceMap = {};  
  members.forEach((m) => {  
    const id = safeGetId(m);  
    if (id) balanceMap[id] = 0;  
  });  
  
  debts.forEach((debt) => {  
    const debtorKey = safeGetId(debt.from);  
    const creditorKey = safeGetId(debt.to);  
    if (debtorKey && debtorKey in balanceMap) balanceMap[debtorKey] -= debt.amount;  
    if (creditorKey && creditorKey in balanceMap) balanceMap[creditorKey] += debt.amount;  
  });  
  
  const totalBalance = Object.values(balanceMap).reduce((sum, v) => sum + v, 0);  
  
  return {  
    id: groupDetails.groupId || groupDetails._id || "unknown",  
    name: groupDetails.name || "Unnamed Group",  
    totalExpenses: totalGroupExpenses,  
    totalBalance,  
    members: members.map((m) => {  
      const id = safeGetId(m);  
      return {  
        id,  
        name: m.name || "Unknown Member",  
        email: m.email || "",  
        status: m.status || 'accepted',
        balance: balanceMap[id] ?? 0,  
      };  
    }),  
    debts: debts.map((d) => ({  
      id: d._id || d.id || crypto.randomUUID(),  
      debtorId: safeGetId(d.from),  
      debtorName: d.from?.name || "Unknown",  
      creditorId: safeGetId(d.to),  
      creditorName: d.to?.name || "Unknown",  
      amount: d.amount ?? 0,  
      settled: d.settled ?? false,  
    })),  
  };  
};  

/* --- Stat cards: Rich, Pale Desaturated Palette --- */
const statCardThemes = [
  {
    // 1. Blue
    wrapper: "bg-[#D6E6F2] rounded-[24px] shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow duration-200",
    iconWrap: "w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm",
    iconCls: "text-[#4A6D9C]",
    labelCls: "text-sm font-medium text-[#4A6D9C]",
    valueCls: "text-2xl font-extrabold text-slate-800 mt-1 tracking-tight",
  },
  {
    // 2. Purple
    wrapper: "bg-[#E2DCE9] rounded-[24px] shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow duration-200",
    iconWrap: "w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm",
    iconCls: "text-[#5C4E8A]",
    labelCls: "text-sm font-medium text-[#5C4E8A]",
    valueCls: "text-2xl font-extrabold text-slate-800 mt-1 tracking-tight",
  },
  {
    // 3. Green
    wrapper: "bg-[#D1E2D3] rounded-[24px] shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow duration-200",
    iconWrap: "w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm",
    iconCls: "text-[#3D7057]",
    labelCls: "text-sm font-medium text-[#3D7057]",
    valueCls: "text-2xl font-extrabold text-slate-800 mt-1 tracking-tight",
  },
  {
    // 4. Yellow/Beige
    wrapper: "bg-[#F3E8D5] rounded-[24px] shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow duration-200",
    iconWrap: "w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm",
    iconCls: "text-[#8C7558]",
    labelCls: "text-sm font-medium text-[#8C7558]",
    valueCls: "text-2xl font-extrabold text-slate-800 mt-1 tracking-tight",
  }
];

/* StatCard accepts a themeIndex to pick its pastel palette */
const StatCard = ({ icon: Icon, label, value, themeIndex = 0 }) => {
  
  const fallbackTheme = {
    wrapper: "bg-white rounded-[24px] shadow-sm p-6 flex items-center gap-5 border border-gray-100",
    iconWrap: "w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center",
    iconCls: "text-slate-500",
    labelCls: "text-sm font-medium text-slate-500",
    valueCls: "text-2xl font-extrabold text-slate-800 mt-1 tracking-tight"
  };

  /* Safe check for the theme and Icon */
  const t = (typeof statCardThemes !== 'undefined' && statCardThemes[themeIndex]) 
    ? statCardThemes[themeIndex] 
    : fallbackTheme;

  return (
    <div className={t.wrapper}>
      <div className={t.iconWrap}>
        {Icon && <Icon size={22} className={t.iconCls} />}
      </div>
      <div>
        <p className={t.labelCls}>{label}</p>
        <p className={t.valueCls}>{value}</p>
      </div>
    </div>
  );
};

const MemberCard = ({ member }) => {  
  const isInvited = member.status === 'invited';
  const isZero = Math.abs(member.balance) < 0.01;  
  const isPositive = member.balance > 0.01;  
  
  return (  
    <div className="bg-[#EAEFF5] rounded-[24px] shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200 border border-[#d6e0ec] text-slate-700">  
      <div className="flex items-center gap-3">  
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-[#d6e0ec]">  
          <span className="text-slate-500 font-bold text-sm">  
            {member.name.split(" ").map((n) => n[0]).join("")}  
          </span>  
        </div>  
        <div className="min-w-0">  
          <p className="font-extrabold text-slate-700 text-sm truncate">{member.name}</p>  
          <p className="text-xs text-slate-500 font-semibold truncate">{member.email}</p>  
        </div>  
      </div>  
      {isInvited ? (
        <div className="flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#FEF5DC] text-[#B08A20] shadow-sm">
          <Clock size={13} />
          Invited
        </div>
      ) : isZero ? (  
        <div className="flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white text-slate-600 shadow-sm border border-[#d6e0ec]">  
          <CheckCircle size={13} />  
          Settled up  
        </div>  
      ) : (  
        <div  
          className={`flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${  
            isPositive
              ? "bg-[#E4F2E8] text-[#3D8A55]" 
              : "bg-[#E2DCE9] text-[#5C4E8A]" 
          }`}  
        >  
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}  
          {isPositive ? "Gets back" : "Owes"} {formatEuro(member.balance)}  
        </div>  
      )}  
    </div>  
  );  
};
  
const DebtRow = ({ debt, onSettle, groupId, currentUserId }) => {  
  const [settling, setSettling] = useState(false);  
  
  const isDebtor = currentUserId && String(debt.debtorId) === String(currentUserId);  
  
  const handleSettle = async () => {  
    setSettling(true);  
    try {  
      await debtService.recordSettlement(groupId, debt.creditorId, debt.amount);  
      await onSettle(debt.id);  
    } catch (err) {  
      console.error("Settle error:", err.message);  
      alert("Failed to settle debt."); 
    } finally {  
      setSettling(false);  
    }  
  };  
  
  if (debt.settled) {  
    return (  
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#EAEFF5] border border-[#d6e0ec] shadow-sm">  
        <CheckCircle size={18} className="text-[#3D8A55] flex-shrink-0" />  
        <span className="text-sm text-slate-600 font-semibold">  
          {debt.debtorName} → {debt.creditorName}&nbsp;|&nbsp;  
          {formatEuro(debt.amount)} — Settled  
        </span>  
      </div>  
    );  
  }  
  
  return (  
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#EAEFF5] border border-[#d6e0ec] shadow-sm hover:shadow-md transition-shadow duration-200 text-slate-700">  
      <div className="flex items-center gap-3 min-w-0">  
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-[#d6e0ec]">  
          <span className="text-slate-500 font-bold text-xs">  
            {debt.debtorName.split(" ").map((n) => n[0]).join("")}  
          </span>  
        </div>  
        <div className="min-w-0">  
          <p className="text-sm font-bold text-slate-700 truncate">  
            <span className="text-[#5C4E8A]">{debt.debtorName}</span>  
            <span className="text-slate-500 mx-1.5 font-semibold">owes</span>  
            <span className="text-[#3D8A55]">{debt.creditorName}</span>  
          </p>  
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-semibold">  
            <Clock size={11} />  
            Pending settlement  
          </p>  
        </div>  
      </div>  
      <div className="flex items-center gap-4 flex-shrink-0">  
        <span className="text-sm font-extrabold text-slate-700 flex items-center gap-1">  
          <Euro size={13} className="text-slate-400" />  
          {formatEuro(debt.amount).replace("€", "")}  
        </span>  
        {isDebtor && (  
          <button  
            onClick={handleSettle}  
            disabled={settling}  
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#CBE4FE] text-slate-900 text-[11px] font-bold uppercase tracking-wide rounded-full hover:bg-[#B3D4F6] active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm border border-[#A6CFFC]"  
          >  
            {settling ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}  
            {settling ? "Settling…" : "Settle Up"}  
          </button>  
        )}  
      </div>  
    </div>  
  );  
};

  
const LoadingSkeleton = () => (  
  <div className="flex-1 overflow-y-auto p-10 animate-pulse">  
    <div className="max-w-5xl mx-auto space-y-8">  
      <div className="h-8 bg-gray-200 rounded-xl w-64" />  
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">  
        {[...Array(4)].map((_, i) => (  
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />  
        ))}  
      </div>  
      <div className="h-64 bg-gray-200 rounded-2xl" />  
      <div className="h-48 bg-gray-200 rounded-2xl" />  
    </div>  
  </div>  
);  
  
const GroupDetails = () => {  
  const { id: groupId } = useParams();  
  const { user } = useContext(AuthContext);  
  const navigate = useNavigate();  
  
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
  const [customSplits, setCustomSplits] = useState({});  
  const [percentageSplits, setPercentageSplits] = useState({});  
  
  const [showInviteModal, setShowInviteModal] = useState(false);  
  const [inviteEmail, setInviteEmail] = useState('');  
  const [inviteMessage, setInviteMessage] = useState('');  
  const [isLoading, setIsLoading] = useState(false);  
  
  const [group, setGroup] = useState(null);  
  const [debts, setDebts] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  

  const fetchExpenses = useCallback(async () => {  
    if (!groupId || !user?.token) return;  
    try {  
      const groupResponse = await fetch(`http://localhost:5000/api/groups/${groupId}`, {  
        headers: { Authorization: `Bearer ${user.token}` },  
      });  
      const groupData = await groupResponse.json();  
      setGroupName(groupData.name);  
      const acceptedMembers = (groupData.members || []).filter(
        (member) => member.status === 'accepted' && member.user
      );

      const formattedMembers = acceptedMembers.map((member) => ({  
        id: member.user._id,  
        name: member.user.name,  
      }));  
      setMembers(formattedMembers);  
      if (formattedMembers.length > 0) {
        setPaidBy((prevPaidBy) => prevPaidBy || formattedMembers[0].id);
      }
  
      const data = await expenseService.getGroupExpenses(groupId);  
      const formattedExpenses = data.map((expense) => ({  
        _id: expense._id,  
        description: expense.description,  
        amount: expense.totalAmount,  
        paidBy: expense.payer?._id || expense.payer,  
        paidByName: expense.payer?.name || 'Unknown',  
        splitMethod: expense.splitMethod || 'Equal Split',  
        date: expense.date || new Date(expense.createdAt).toLocaleDateString(),  
        amountPerMember: expense.amountPerMember || null, 
        splits: expense.splits || [],  
        customSplits: expense.customSplits || null,  
        percentageSplits: expense.percentageSplits || null,  
      }));  
      setExpenses(formattedExpenses);  
    } catch (error) {  
      console.error(error);  
    }  
  }, [groupId, user?.token]); 
   
  const fetchGroup = useCallback(async () => {  
    if (!groupId || !user?.token) return; 
    setLoading(true);  
    setError(null);  
    try {  
      const res = await fetch(`http://localhost:5000/api/groups/${groupId}/dashboard`, {  
        method: "GET",  
        headers: {  
          "Content-Type": "application/json",  
          Authorization: `Bearer ${user.token}`,  
        },  
      });  
      if (!res.ok) {  
        const errBody = await res.json().catch(() => ({}));  
        throw new Error(errBody.message || `Request failed: ${res.status}`);  
      }  
      const json = await res.json();  
      if (!json.success) throw new Error(json.message || "Unexpected response from server");  
       
      let realDebts = []; 
      try { 
        const debtsData = await debtService.getDebts(groupId); 
        realDebts = debtsData.transactions || []; 
      } catch (err) { 
        console.error("Failed to fetch real debts", err); 
        realDebts = json.data.debts || []; 
      } 
 
      const transformed = transformGroupData(json.data, realDebts);  
      setGroup(transformed);  
      setDebts(transformed.debts);  
    } catch (err) {  
      setError(err.message || "Something went wrong.");  
    } finally {  
      setLoading(false);  
    }  
  }, [groupId, user?.token]); 

  const loadGroupData = useCallback(async () => {
    await Promise.all([fetchExpenses(), fetchGroup()]);
  }, [fetchExpenses, fetchGroup]);
 
  useEffect(() => {  
    loadGroupData();

    const handleExpenseUpdated = () => loadGroupData();
    const handleDebtSettled = () => loadGroupData();

    window.addEventListener('expense-updated', handleExpenseUpdated);
    window.addEventListener('debt-settled', handleDebtSettled);

    return () => {
      window.removeEventListener('expense-updated', handleExpenseUpdated);
      window.removeEventListener('debt-settled', handleDebtSettled);
    };
  }, [loadGroupData]);  
  
  const handleInviteAction = async (e) => {  
    if (e && e.preventDefault) e.preventDefault();  
    if (!inviteEmail) return;  
    try {  
      setIsLoading(true);  
      setInviteMessage('');  
      const res = await sendInvitation(groupId, inviteEmail);  
      setInviteMessage({ type: 'success', text: res.message }); 
      setInviteEmail(''); 
      await fetchGroup(); 
      await fetchExpenses();  
      setTimeout(() => {  
        setShowInviteModal(false);  
        setInviteMessage('');  
      }, 2000);  
    } catch (error) {  
      setInviteMessage({  
        type: 'error',  
        text: error.response?.data?.message || 'Failed to send invitation',  
      });  
    } finally {  
      setIsLoading(false);  
    }  
  };  
  
  const handleSettleDebt = async (debtId) => {  
    await fetchGroup();
    window.dispatchEvent(new CustomEvent('debt-settled'));
  };  
  
  const activeDebts = debts.filter((d) => !d.settled);  
  const settledDebts = debts.filter((d) => d.settled);  
  
  const myBalance = group?.members.find(  
    (m) => String(m.id) === String(user?._id)  
  )?.balance ?? 0;  
  
  return (  
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] font-sans">

      {/* Page layout: sidebar + main */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 44px)' }}>

        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col pt-10 pb-6 rounded-r-3xl my-2 ml-2 shadow-sm flex-shrink-0">
          <div className="px-8 mb-10 flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
            </div>
            <h1 className="text-xl font-bold text-slate-700">SplitWise</h1> 
          </div> 

          <nav className="flex-1 space-y-2 px-6"> 
            <Link 
              to="/?tab=overview" 
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm text-gray-400 hover:text-slate-700 hover:bg-gray-50" 
            > 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"> 
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /> 
                <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /> 
              </svg> 
              Dashboard
            </Link> 

            <Link 
              to="/?tab=groups" 
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm bg-slate-600 text-white shadow-md" 
            > 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"> 
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /> 
                <circle cx="9" cy="7" r="4" /> 
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /> 
                <path d="M16 3.13a4 4 0 0 1 0 7.75" /> 
              </svg> 
              Groups
            </Link> 
          </nav> 
        </div>

        {/* Main Content */}  
        <div className="flex-1 flex flex-col overflow-hidden">  
  
          {/* Header */}  
          <header className="h-24 flex items-center justify-between pt-6 pb-2 px-10 flex-shrink-0">  
            <div className="flex items-center gap-3">  
              <button  
                onClick={() => navigate("/?tab=groups")}  
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-slate-700 transition-colors mr-2"  
              >  
                <ChevronLeft size={16} />  
                <span>Groups</span>  
              </button>  
              <span className="text-gray-300 font-light text-xl">/</span>  
              <h2 className="text-2xl font-bold text-slate-700 ml-2 tracking-tight">  
                {loading ? "Loading…" : (group?.name ?? "Group Details")}  
              </h2>  
            </div>  
            <div className="flex items-center gap-4">
              {/* Notification bell styled black to match the profile button */}
              <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border border-gray-300 ring-2 ring-slate-100 text-white shadow-sm">
                <NotificationBell />
              </div>
              <Link to="/profile" className="block w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border border-gray-300 ring-2 ring-slate-100 text-white shadow-sm">  
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">  
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />  
                  <circle cx="12" cy="7" r="4" />  
                </svg>  
              </Link>  
            </div>  
          </header>
  
          {loading ? (  
            <LoadingSkeleton />  
          ) : error ? (  
            <div className="flex-1 flex items-center justify-center p-10">  
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">  
                <p className="text-red-500 font-semibold text-lg mb-2">Could not load group</p>  
                <p className="text-gray-400 text-sm">{error}</p>  
                <button  
                  onClick={() => navigate("/?tab=groups")}  
                  className="mt-4 text-blue-700 text-sm font-medium hover:underline flex items-center gap-1 mx-auto"  
                >  
                  <ChevronLeft size={14} /> Back to Groups  
                </button>  
              </div>  
            </div>  
          ) : (  
            <main className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="max-w-5xl mx-auto space-y-8">  
  
                {/* Page Header */} 
                <div className="flex items-center justify-between"> 
                  <div> 
                    <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1> 
                  </div> 
                  <div className="flex items-center gap-3"> 
                    <button 
                      onClick={() => setShowInviteModal(true)} 
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-lg text-sm font-semibold hover:from-gray-500 hover:to-gray-600 transition-colors shadow-sm" 
                    > 
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> 
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path> 
                        <circle cx="8.5" cy="7" r="4"></circle> 
                        <line x1="20" y1="8" x2="20" y2="14"></line> 
                        <line x1="23" y1="11" x2="17" y2="11"></line> 
                      </svg> 
                      Invite Member 
                    </button> 
                    <button 
                      onClick={() => { 
                        setEditingIndex(null); 
                        setEditingId(null); 
                        setDescription(''); 
                        setAmount(''); 
                        setDate(''); 
                        setPaidBy(members[0]?.id || ''); 
                        setSplitMethod('Equal Split'); 
                        setCustomSplits({}); 
                        setPercentageSplits({}); 
                        setShowExpenseForm(true); 
                      }} 
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm" 
                    > 
                      Add Expense 
                    </button> 
                    <div className="hidden md:flex items-center gap-2 bg-[#D1E2D3] text-[#3D7057] rounded-xl px-4 py-2 shadow-sm text-sm font-semibold"> 
                      <UserCircle size={16} className="text-[#3D7057]" /> 
                      {group.members.length} members 
                    </div> 
                  </div> 
                </div>
  
                {/* Stat Cards — each with its own pastel theme */}  
                <section>  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">  
                    <StatCard icon={Receipt}  label="Total Expenses" value={formatEuro(group.totalExpenses)} themeIndex={0} />
                    <StatCard
                      icon={myBalance > 0 ? TrendingUp : myBalance < 0 ? TrendingDown : Wallet}
                      label="My Balance"
                      value={formatEuro(myBalance)}
                      themeIndex={1}
                    />
                    <StatCard icon={Users}   label="Members"       value={group.members.length}   themeIndex={2} />
                    <StatCard icon={Clock}   label="Pending Debts" value={activeDebts.length}      themeIndex={3} />
                  </div>  
                </section>  
  
                {/* Members Grid */}  
                <section>  
                  <div className="flex items-center gap-2 mb-4">  
                    <Users size={18} className="text-[#7C5FC4]" />  
                    <h2 className="text-lg font-bold text-gray-800">Members</h2>  
                    <span className="ml-auto text-xs text-gray-400 font-medium">{group.members.length} total</span>  
                  </div>  
                  {group.members.length === 0 ? (  
                    <div className="bg-white rounded-2xl shadow-sm p-10 text-center">  
                      <Users size={40} className="text-gray-300 mx-auto mb-3" />  
                      <p className="text-gray-500 font-semibold">No members yet</p>  
                      <p className="text-gray-400 text-sm mt-1">Invite people to join this group.</p>  
                    </div>  
                  ) : (  
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">  
                      {group.members.map((member) => (  
                        <MemberCard key={member.id} member={member} />  
                      ))}  
                    </div>  
                  )}  
                </section>  
  
                {/* Debt Relationships */}  
                <section>  
                  <div className="flex items-center gap-2 mb-4">  
                    <ArrowRight size={18} className="text-[#7C5FC4]" />  
                    <h2 className="text-lg font-bold text-gray-800">Debt Relationships</h2>  
                    {activeDebts.length > 0 && (  
                      <span className="ml-2 px-2 py-0.5 bg-[#E2DCE9] text-[#5C4E8A] text-xs font-semibold rounded-full">  
                        {activeDebts.length} active  
                      </span>  
                    )}  
                    {settledDebts.length > 0 && (  
                      <span className="ml-1 px-2 py-0.5 bg-[#E4F2E8] text-[#3D8A55] text-xs font-semibold rounded-full">  
                        {settledDebts.length} settled  
                      </span>  
                    )}  
                  </div>  
                  {debts.length === 0 ? (  
                    <div className="bg-white rounded-2xl shadow-sm p-10 text-center">  
                      <CheckCircle size={40} className="text-[#3D8A55] mx-auto mb-3" />  
                      <p className="text-gray-600 font-semibold">All settled up!</p>  
                      <p className="text-gray-400 text-sm mt-1">No outstanding debts in this group.</p>  
                    </div>  
                  ) : (  
                    <div className="space-y-3">  
                      {[...activeDebts, ...settledDebts].map((debt) => (  
                        <DebtRow  
                          key={debt.id}  
                          debt={debt}  
                          onSettle={handleSettleDebt}  
                          groupId={groupId}  
                          currentUserId={user?._id}  
                        />  
                      ))}  
                    </div>  
                  )}  
                </section>

                {/* Expense History */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Receipt size={18} className="text-[#7C5FC4]" />
                    <h2 className="text-lg font-bold text-gray-800">Expense History</h2>
                    <span className="ml-auto text-xs text-gray-400 font-medium">{expenses.length} total</span>
                  </div>

                  {expenses.length === 0 ? (
                    <div className="bg-[#EAEFF5] border border-[#d6e0ec] rounded-2xl p-10 text-center text-slate-700 shadow-sm">
                      <Receipt size={40} className="text-slate-400 mx-auto mb-3" />
                      <p className="font-bold text-slate-700">No expenses yet</p>
                      <p className="text-slate-500 text-sm mt-1">Add the first expense for this group.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {expenses.map((expense, index) => (
                        <div
                          key={expense._id || index}
                          className="bg-[#EAEFF5] border border-[#d6e0ec] rounded-2xl p-5 hover:shadow-md transition-shadow duration-200 text-slate-700 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-extrabold text-slate-700 truncate">{expense.description}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] uppercase font-bold tracking-wide">
                                {expense.date && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-white text-slate-600 shadow-sm border border-[#d6e0ec]">
                                    {expense.date}
                                  </span>
                                )}
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#E2DCE9] text-[#5C4E8A] shadow-sm">
                                  Paid by {expense.paidByName}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#FEF5DC] text-[#B08A20] shadow-sm">
                                  {expense.splitMethod || 'Equal Split'}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold bg-slate-600 text-white px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                              {formatEuro(expense.amount)}
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#d6e0ec]">
                            {expense.splits && expense.splits.length > 0 && (
                              <div className="text-xs text-slate-600 bg-white/50 rounded-xl border border-[#d6e0ec] shadow-inner">
                                <p className="font-bold text-slate-700 mb-2 uppercase text-[10px] tracking-wider p-3 pb-0">Splits</p>
                                {expense.splits.map((split, i) => (
                                  <div key={i} className="flex items-center justify-between py-1 border-b border-[#d6e0ec] last:border-b-0 px-3 last:pb-3">
                                    <span className="font-semibold text-slate-600">{split.user?.name || 'Unknown'}</span>
                                    <span className="font-bold text-slate-700">{formatEuro(split.amountOwed)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </div>  
            </main>  
          )}

          {/* Shared footer */}
          <footer className="bg-slate-900 text-white text-center py-3 text-xs font-medium tracking-wide flex-shrink-0">
            © 2026 SplitWise
          </footer>
        </div>
      </div>
  
      {/* MODAL: Expense Form */}  
      {showExpenseForm && (  
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">  
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">  
            <h3 className="text-xl font-bold text-gray-900 mb-4">  
              {editingIndex !== null ? 'Edit Expense' : 'Add Expense'}  
            </h3>  
  
            <div className="space-y-4 mb-6">  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>  
                <input  
                  type="text"  
                  placeholder="Dinner, Trip, Hotel..."  
                  value={description}  
                  onChange={(e) => setDescription(e.target.value)}  
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"  
                />  
              </div>  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>  
                <input  
                  type="number"  
                  placeholder="0.00"  
                  value={amount}  
                  onChange={(e) => setAmount(e.target.value)}  
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"  
                />  
              </div>  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>  
                <input  
                  type="date"  
                  value={date}  
                  onChange={(e) => setDate(e.target.value)}  
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"  
                />  
              </div>  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid By</label>  
                <select  
                  value={paidBy}  
                  onChange={(e) => setPaidBy(e.target.value)}  
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"  
                >  
                  {members.map((member) => (  
                    <option key={member.id} value={member.id}>{member.name}</option>  
                  ))}  
                </select>  
              </div>  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-2">Split Method</label>  
                <select  
                  value={splitMethod}  
                  onChange={(e) => setSplitMethod(e.target.value)}  
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"  
                >  
                  <option>Equal Split</option>  
                  <option>Exact Amounts</option>  
                  <option>Percentages</option>  
                </select>  
              </div>  
            </div>  
  
            {splitMethod === 'Equal Split' && amount && (  
              <div className="bg-[#EDE9F6] border border-[#D8D0F0] rounded-lg p-4 mb-4">  
                <p className="text-sm font-medium text-[#3D2B87] mb-2">Equal Split Preview</p>  
                <p className="text-sm text-[#7C5FC4]">  
                  Each member owes: €{(Number(amount) / (members.length || 1)).toFixed(2)}  
                </p>  
                <p className="text-xs text-[#7C5FC4] mt-1 opacity-70">Split between {members.length} members</p>  
              </div>  
            )}  
  
            {splitMethod === 'Exact Amounts' && (  
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">  
                <p className="text-sm font-medium text-gray-800 mb-3">Exact Amounts</p>  
                <div className="space-y-3">  
                  {members.map((member) => (  
                    <div key={member.id} className="flex items-center justify-between gap-3">  
                      <span className="text-sm text-gray-700">{member.name}</span>  
                      <input  
                        type="number"  
                        placeholder="0.00"  
                        value={customSplits[member.name] || ''}  
                        onChange={(e) => setCustomSplits({ ...customSplits, [member.name]: e.target.value })}  
                        className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"  
                      />  
                    </div>  
                  ))}  
                </div>  
                <div className="mt-4 border-t border-gray-200 pt-3">  
                  <p className="text-sm text-gray-600">  
                    Total assigned: €{Object.values(customSplits).reduce((sum, val) => sum + Number(val || 0), 0).toFixed(2)}  
                  </p>  
                  <p className="text-sm text-gray-600">Expense total: €{Number(amount || 0).toFixed(2)}</p>  
                  {amount && Object.values(customSplits).reduce((sum, val) => sum + Number(val || 0), 0) !== Number(amount) && (  
                    <p className="text-sm text-red-600 mt-2">The exact amounts must add up to the total expense.</p>  
                  )}  
                </div>  
              </div>  
            )}  
  
            {splitMethod === 'Percentages' && (  
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">  
                <p className="text-sm font-medium text-gray-800 mb-3">Percentages</p>  
                <div className="space-y-3">  
                  {members.map((member) => (  
                    <div key={member.id} className="flex items-center justify-between gap-3">  
                      <span className="text-sm text-gray-700">{member.name}</span>  
                      <div className="flex items-center gap-2">  
                        <input  
                          type="number"  
                          placeholder="0"  
                          value={percentageSplits[member.name] || ''}  
                          onChange={(e) => setPercentageSplits({ ...percentageSplits, [member.name]: e.target.value })}  
                          className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"  
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
                        {member.name} owes: €{((Number(amount || 0) * Number(percentageSplits[member.name] || 0)) / 100).toFixed(2)}  
                      </p>  
                    ))}  
                  </div>  
                  <p className="text-sm text-gray-600">  
                    Total percentage: {Object.values(percentageSplits).reduce((sum, val) => sum + Number(val || 0), 0)}%  
                  </p>  
                  {Object.values(percentageSplits).reduce((sum, val) => sum + Number(val || 0), 0) !== 100 && (  
                    <p className="text-sm text-red-600 mt-2">Percentages must equal 100%.</p>  
                  )}  
                </div>  
              </div>  
            )}  
  
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">  
              <button  
                onClick={() => {  
                  setShowExpenseForm(false);  
                  setEditingIndex(null);  
                  setEditingId(null);  
                }}  
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
                    const totalAssigned = Object.values(customSplits).reduce((sum, v) => sum + Number(v || 0), 0);  
                    if (totalAssigned !== Number(amount)) {  
                      alert('Exact amounts must equal the total expense.');  
                      return;  
                    }  
                  }  
                  if (splitMethod === 'Percentages') {  
                    const totalPercentage = Object.values(percentageSplits).reduce((sum, v) => sum + Number(v || 0), 0);  
                    if (totalPercentage !== 100) {  
                      alert('Percentages must equal 100%.');  
                      return;  
                    }  
                  }  
  
                  const expenseData = {  
                    groupId,  
                    description,  
                    totalAmount: Number(amount),  
                    date,  
                    payer: paidBy,  
                    splitMethod,  
                    amountPerMember: splitMethod === 'Equal Split' ? Number((Number(amount) / members.length).toFixed(2)) : null,  
                    customSplits: splitMethod === 'Exact Amounts' ? customSplits : null,  
                    percentageSplits: splitMethod === 'Percentages' ? percentageSplits : null,  
                    splits: members.map((member) => {  
                      let amountOwed = 0;  
                      if (splitMethod === 'Equal Split') {  
                        amountOwed = Number((Number(amount) / members.length).toFixed(2));  
                      } else if (splitMethod === 'Exact Amounts') {  
                        amountOwed = Number(customSplits[member.name] || 0);  
                      } else if (splitMethod === 'Percentages') {  
                        amountOwed = Number(((Number(amount) * Number(percentageSplits[member.name] || 0)) / 100).toFixed(2));  
                      }  
                      return { user: member.id, amountOwed };  
                    }),  
                  };  
  
                  try {
                    if (editingIndex !== null && editingId) {
                      await expenseService.updateExpense(editingId, expenseData);
                    } else {
                      await expenseService.createExpense(expenseData);
                    }

                    await loadGroupData();
                    window.dispatchEvent(new CustomEvent('expense-updated'));

                    setEditingIndex(null);
                    setEditingId(null);
                    setDescription('');
                    setAmount('');
                    setDate('');
                    setPaidBy(members[0]?.id || '');
                    setSplitMethod('Equal Split');
                    setShowExpenseForm(false);
                  } catch (err) {
                    const message = err?.response?.data?.message || 'Failed to save expense.';
                    alert(message);
                  }
                }}  
                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors"  
              >  
                {editingIndex !== null ? 'Update Expense' : 'Save Expense'}  
              </button>  
            </div>  
          </div>  
        </div>  
      )}  
  
      {/* MODAL: Invite Member */}  
      {showInviteModal && (  
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">  
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">  
            <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Member to Group</h3>  
            {inviteMessage && (  
              <div className={`mb-4 p-3 rounded text-sm ${inviteMessage.type === 'success' ? 'bg-[#E4F2E8] text-[#1E5C35]' : 'bg-[#FDE8EF] text-[#D9527A]'}`}>  
                {inviteMessage.text}  
              </div>  
            )}  
            <div className="mb-6">  
              <label className="block text-sm font-medium text-gray-700 mb-2">User Email</label>  
              <input  
                type="email"  
                value={inviteEmail}  
                onChange={(e) => setInviteEmail(e.target.value)}  
                placeholder="friend@example.com"  
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-slate-400 focus:border-slate-400 outline-none"  
                autoFocus  
                required  
              />  
            </div>  
            <div className="flex justify-end gap-3">  
              <button  
                type="button"  
                onClick={() => setShowInviteModal(false)}  
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"  
              >  
                Cancel  
              </button>  
              <button  
                type="button"  
                onClick={handleInviteAction}  
                disabled={isLoading}  
                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"  
              >  
                {isLoading ? 'Sending...' : 'Send Invite'}  
              </button>  
            </div>  
          </div>  
        </div>  
      )}  
  
    </div>  
  );  
};  
  
export default GroupDetails;