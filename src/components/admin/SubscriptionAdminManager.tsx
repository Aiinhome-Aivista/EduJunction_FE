import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  Sliders,
  Clock,
  Key,
  Globe,
  Loader2,
  X,
  ChevronRight,
  ShieldCheck,
  Check,
  Activity,
  Layers,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';

export interface PlanItem {
  id: number;
  planName: string;
  planCode: string;
  planType: string;
  priceInr: number;
  durationMinutes: number;
  totalMarks: number;
  boardCode?: string | null;
  className?: string | null;
  subjectName?: string | null;
  description?: string;
  features?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionItem {
  id: number;
  userId: number;
  parentName: string;
  parentEmail: string;
  studentId?: number | null;
  studentName: string;
  board: string;
  classGrade: string;
  subject: string;
  amountPaid: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: string;
  createdAt?: string;
}

export const SubscriptionAdminManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');

  // Plan Management States
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [savingPlan, setSavingPlan] = useState<boolean>(false);
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<boolean>(false);

  // Plan Form States
  const [formPlanName, setFormPlanName] = useState('');
  const [formPlanCode, setFormPlanCode] = useState('');
  const [formPriceInr, setFormPriceInr] = useState<number>(300);
  const [formDurationMinutes, setFormDurationMinutes] = useState<number>(150);
  const [formTotalMarks, setFormTotalMarks] = useState<number>(80);
  const [formBoardCode, setFormBoardCode] = useState<string>('ALL');
  const [formClassName, setFormClassName] = useState<string>('ALL');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Transaction History States
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBoard, setFilterBoard] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [boardOptions, setBoardOptions] = useState<string[]>(['CBSE', 'ICSE', 'ISC', 'WBBSE']);
  const [metrics, setMetrics] = useState<{
    totalOrders: number;
    activePapers: number;
    pendingPapers: number;
    realizedRevenue: number;
    pendingRevenue: number;
  }>({
    totalOrders: 0,
    activePapers: 0,
    pendingPapers: 0,
    realizedRevenue: 0,
    pendingRevenue: 0,
  });

  // Alerts
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertBanner({ type, message });
    setTimeout(() => {
      setAlertBanner(null);
    }, 5000);
  };

  // Load Plans
  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const res: any = await ApiServices.getAdminSubscriptionPlans();
      const planList = res?.plans || res?.data?.plans || (Array.isArray(res) ? res : []);
      setPlans(planList);
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || err.message || 'Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  // Load Transaction History
  const loadHistory = async (page: number = 1) => {
    setLoadingHistory(true);
    try {
      const res: any = await ApiServices.getAdminSubscriptionHistory({
        search: searchQuery || undefined,
        board: filterBoard !== 'ALL' ? filterBoard : undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        page,
        limit: 20
      });
      const txList = res?.transactions || res?.data?.transactions || (Array.isArray(res) ? res : []);
      const total = res?.total ?? res?.data?.total ?? txList.length;
      const curPage = res?.page ?? res?.data?.page ?? page;
      setTransactions(txList);
      setTotalCount(total);
      setCurrentPage(curPage);

      if (res?.metrics) {
        setMetrics(res.metrics);
      }
      if (res?.boards && Array.isArray(res.boards) && res.boards.length > 0) {
        setBoardOptions(res.boards);
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || err.message || 'Failed to load payment transactions');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory(1);
    }
  }, [activeTab, filterBoard, filterStatus]);

  // Open Plan Modal
  const handleOpenAddPlan = () => {
    setEditingPlan(null);
    setFormPlanName('Full Model Question Paper 2027 (Single Exam Pass)');
    setFormPlanCode(`MODEL_TEST_${Date.now().toString().slice(-4)}`);
    setFormPriceInr(300);
    setFormDurationMinutes(150);
    setFormTotalMarks(80);
    setFormBoardCode('ALL');
    setFormClassName('ALL');
    setFormDescription('Access to 1 Full-Length 2027 Board Standard Model Question Paper (2.5 Hours / 150 Mins).');
    setFormIsActive(true);
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: PlanItem) => {
    setEditingPlan(plan);
    setFormPlanName(plan.planName);
    setFormPlanCode(plan.planCode);
    setFormPriceInr(plan.priceInr);
    setFormDurationMinutes(plan.durationMinutes || 150);
    setFormTotalMarks(plan.totalMarks || 80);
    setFormBoardCode(plan.boardCode || 'ALL');
    setFormClassName(plan.className || 'ALL');
    setFormDescription(plan.description || '');
    setFormIsActive(plan.isActive);
    setIsPlanModalOpen(true);
  };

  // Save Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlanName.trim()) {
      showAlert('error', 'Plan Name is required');
      return;
    }

    setSavingPlan(true);
    try {
      const payload: any = {
        planName: formPlanName.trim(),
        planCode: formPlanCode.trim(),
        priceInr: Number(formPriceInr),
        durationMinutes: Number(formDurationMinutes),
        totalMarks: Number(formTotalMarks),
        boardCode: formBoardCode === 'ALL' ? null : formBoardCode,
        className: formClassName === 'ALL' ? null : formClassName,
        description: formDescription.trim(),
        isActive: formIsActive
      };

      if (editingPlan) {
        await ApiServices.updateAdminSubscriptionPlan(editingPlan.id, payload);
        showAlert('success', 'Plan updated successfully');
      } else {
        await ApiServices.createAdminSubscriptionPlan(payload);
        showAlert('success', 'New plan created successfully');
      }
      setIsPlanModalOpen(false);
      await loadPlans();
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || err.message || 'Failed to save plan');
    } finally {
      setSavingPlan(false);
    }
  };

  // Delete Plan
  const handleDeletePlan = async () => {
    if (!deletePlanId) return;
    setDeletingPlan(true);
    try {
      await ApiServices.deleteAdminSubscriptionPlan(deletePlanId);
      showAlert('success', 'Plan deleted successfully');
      setDeletePlanId(null);
      await loadPlans();
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || err.message || 'Failed to delete plan');
    } finally {
      setDeletingPlan(false);
    }
  };

  // Calculate stats for History
  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border animate-fadeIn ${alertBanner.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          {alertBanner.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <p className="text-sm font-semibold flex-1">{alertBanner.message}</p>
          <button
            onClick={() => setAlertBanner(null)}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  Subscriptions & Payments Manager
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  ₹300 Model Test Paper
                </span>
              </div>
              <p className="text-sm text-stone-500 mt-1">
                Manage 2027 Model Test Paper pricing, exam durations, and inspect user payment audit ledgers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Navigation */}
            <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
              <button
                onClick={() => setActiveTab('plans')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'plans'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
                  }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Pricing Plans ({plans.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'history'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
                  }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Payment History</span>
              </button>
            </div>

            {activeTab === 'plans' ? (
              <button
                onClick={handleOpenAddPlan}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Plan</span>
              </button>
            ) : (
              <button
                onClick={() => loadHistory(currentPage)}
                disabled={loadingHistory}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin text-amber-600' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: PRICING & PLANS MANAGEMENT                          */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'plans' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
              <p className="text-sm font-semibold text-stone-600">Loading subscription plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400 space-y-3">
              <CreditCard className="w-10 h-10 text-stone-300" />
              <p className="text-base font-bold text-stone-700">No Pricing Plans Configured</p>
              <button
                onClick={handleOpenAddPlan}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Create First Plan
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Plan Name & Code</th>
                    <th className="py-3.5 px-4">Type & Scope</th>
                    <th className="py-3.5 px-4">Price (INR)</th>
                    <th className="py-3.5 px-4">Exam Duration</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-stone-900">{plan.planName}</div>
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">{plan.planCode}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {plan.planType}
                        </span>
                        <div className="text-[11px] text-stone-500 mt-1">
                          {plan.boardCode || 'CBSE, ICSE, ISC'} • {plan.className || 'Classes 10 & 12'}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-base font-black text-amber-600">₹{plan.priceInr}</span>
                        <span className="text-[10px] text-stone-400 block">per exam paper</span>
                      </td>

                      <td className="py-4 px-4 text-stone-600">
                        <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{plan.durationMinutes} Mins (2.5 Hrs)</span>
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          Total Marks: {plan.totalMarks || 80}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {plan.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-500 border border-stone-200">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPlan(plan)}
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center"
                            title="Edit Plan"
                          >
                            <Edit2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletePlanId(plan.id)}
                            className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: PAYMENT TRANSACTION HISTORY                         */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Orders */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-black flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">Total Order Attempts</p>
                <h3 className="text-lg font-black text-stone-900 leading-tight">
                  {metrics.totalOrders || totalCount} Attempts
                </h3>
                <p className="text-[10px] font-semibold text-stone-400 mt-0.5">
                  All Initiated Purchases
                </p>
              </div>
            </div>

            {/* Card 2: Active / Paid Papers */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-bold flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">Sold Model Test Papers</p>
                <h3 className="text-lg font-black text-emerald-700 leading-tight">
                  {metrics.activePapers} Papers Sold
                </h3>
                <p className="text-[10px] font-semibold text-amber-600 mt-0.5">
                  {metrics.pendingPapers} Orders Pending
                </p>
              </div>
            </div>

            {/* Card 3: Realized Revenue */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 border border-green-200/60 flex items-center justify-center font-black flex-shrink-0 text-base">
                ₹
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">Total Revenue</p>
                <h3 className="text-lg font-black text-stone-900 leading-tight">
                  ₹{metrics.realizedRevenue.toLocaleString()}
                </h3>
                <p className="text-[10px] font-semibold text-stone-400 mt-0.5 truncate" title={`₹${metrics.pendingRevenue.toLocaleString()} Incomplete/Pending`}>
                  ₹{metrics.pendingRevenue.toLocaleString()} Pending
                </p>
              </div>
            </div>

            {/* Card 4: Payment Gateway */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-bold flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">Payment Gateway</p>
                <h3 className="text-lg font-black text-stone-900 leading-tight">Razorpay Verified</h3>
                <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                  Live & Auto-Settled
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student, parent, email, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadHistory(1)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={filterBoard}
                onChange={(e) => setFilterBoard(e.target.value)}
                className="px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none bg-white font-bold text-stone-700 cursor-pointer"
              >
                <option value="ALL">All Boards</option>
                {boardOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none bg-white font-bold text-stone-700 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">ACTIVE (Paid / Unlocked)</option>
                <option value="PENDING">PENDING (Payment Incomplete)</option>
              </select>

              <button
                onClick={() => loadHistory(1)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-2xs"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
                <p className="text-sm font-semibold text-stone-600">Loading payment ledger...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-20 text-center text-stone-400 space-y-2">
                <FileText className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-base font-bold text-stone-700">No payment transactions found</p>
                <p className="text-xs text-stone-500">Transactions will appear here when parents/students purchase model test papers.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Date & Order ID</th>
                      <th className="py-3.5 px-4">Parent & Student</th>
                      <th className="py-3.5 px-4">Board / Class / Subject</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Razorpay Payment ID</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-stone-900">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono mt-0.5 truncate max-w-xs">
                            {tx.razorpayOrderId || `ORD-${tx.id}`}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-stone-900">{tx.studentName}</div>
                          <div className="text-[11px] text-stone-500">{tx.parentName} ({tx.parentEmail})</div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {tx.board}
                          </span>
                          <span className="ml-1.5 font-semibold text-stone-800">
                            {tx.classGrade} — {tx.subject}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-extrabold text-stone-900">₹{tx.amountPaid}</span>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] text-stone-500">
                          {tx.razorpayPaymentId ? (
                            <span className="text-stone-700 font-semibold">{tx.razorpayPaymentId}</span>
                          ) : (
                            <span className="text-stone-400 italic text-[10px]">Pending Payment</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right">
                          {tx.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVE
                            </span>
                          ) : tx.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              PENDING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                              {tx.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add / Edit Plan Modal ─────────────────── */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <span>{editingPlan ? 'Edit Pricing Plan' : 'Create New Model Test Plan'}</span>
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Plan Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formPlanName}
                  onChange={(e) => setFormPlanName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Price in INR (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formPriceInr}
                    onChange={(e) => setFormPriceInr(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bold text-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="300"
                    value={formDurationMinutes}
                    onChange={(e) => setFormDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={formTotalMarks}
                    onChange={(e) => setFormTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Target Board
                  </label>
                  <select
                    value={formBoardCode}
                    onChange={(e) => setFormBoardCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white font-bold"
                  >
                    <option value="ALL">All Boards (CBSE, ICSE, ISC)</option>
                    <option value="CBSE">CBSE (Classes 5–12)</option>
                    <option value="ICSE">ICSE (Classes 5–10)</option>
                    <option value="ISC">ISC (Classes 11–12)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formPlanIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="formPlanIsActive" className="text-xs font-bold text-stone-800 cursor-pointer">
                  Active (Visible on public pricing and model test checkout)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  {savingPlan && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingPlan ? 'Update Plan' : 'Save Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Plan Confirmation Modal ───────── */}
      {deletePlanId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Delete Pricing Plan?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to delete this plan? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletePlanId(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlan}
                disabled={deletingPlan}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                {deletingPlan && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionAdminManager;
