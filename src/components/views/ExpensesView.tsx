import React, { useState, useMemo } from 'react';
import {
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Copy,
  AlertTriangle,
  Calendar,
  Wallet,
  PieChart as PieIcon,
  Tag,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useApp } from '../../context/AppContext.tsx';
import {
  FinancialTransaction,
  TransactionType,
  PaymentMethod,
  ExpenseCategory,
} from '../../types/index.ts';
import {
  getTodayDateString,
  formatDateDisplay,
  getWeekDates,
  isDateInCurrentMonth,
  addDays,
} from '../../utils/dateUtils.ts';
import { formatCurrency, parseRupeesToPaise } from '../../utils/formatters.ts';

type DateFilterType = 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'all';

export const ExpensesView: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    expenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    userSettings,
    updateUserSettings,
  } = useApp();

  const today = getTodayDateString();
  const currencySymbol = userSettings?.currencySymbol || '₹';

  // Filters & State
  const [dateFilter, setDateFilter] = useState<DateFilterType>('this_month');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // 'all' | 'expense' | 'income'
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formAmountRupees, setFormAmountRupees] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(expenseCategories[0]?.id || 'cat-food');
  const [formDate, setFormDate] = useState(today);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('upi');
  const [formMerchant, setFormMerchant] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsRecurring, setFormIsRecurring] = useState(false);

  // Budget settings modal state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [monthlyBudgetRupees, setMonthlyBudgetRupees] = useState(
    String((userSettings?.budgetConfig.overallMonthlyPaise || 3500000) / 100)
  );

  // Date range calculation
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Date filter
      if (dateFilter === 'today' && t.date !== today) return false;
      if (dateFilter === 'this_week') {
        const weekDates = getWeekDates(today);
        if (!weekDates.includes(t.date)) return false;
      }
      if (dateFilter === 'this_month') {
        if (!t.date.startsWith(today.slice(0, 7))) return false;
      }
      if (dateFilter === 'last_month') {
        const [y, m] = today.split('-').map(Number);
        const lastMonthY = m === 1 ? y - 1 : y;
        const lastMonthM = m === 1 ? 12 : m - 1;
        const lastMonthPrefix = `${lastMonthY}-${String(lastMonthM).padStart(2, '0')}`;
        if (!t.date.startsWith(lastMonthPrefix)) return false;
      }
      if (dateFilter === 'this_year') {
        if (!t.date.startsWith(today.slice(0, 4))) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;

      // Payment method filter
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;

      // Search query (title, merchant, notes)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchMerchant = t.merchant?.toLowerCase().includes(q);
        const matchNotes = t.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchMerchant && !matchNotes) return false;
      }

      return true;
    });
  }, [transactions, dateFilter, typeFilter, categoryFilter, paymentFilter, searchQuery, today]);

  // Sorted list
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'amount_desc') return b.amountPaise - a.amountPaise;
      if (sortBy === 'amount_asc') return a.amountPaise - b.amountPaise;
      return 0;
    });
  }, [filteredTransactions, sortBy]);

  // Aggregate stats
  const totalExpensePaise = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [filteredTransactions]);

  const totalIncomePaise = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [filteredTransactions]);

  const netCashFlowPaise = totalIncomePaise - totalExpensePaise;

  // Today & This Month Spending regardless of filter
  const todayExpensePaise = useMemo(() => {
    return transactions
      .filter((t) => t.date === today && t.type === 'expense')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [transactions, today]);

  const monthExpensePaise = useMemo(() => {
    const curMonth = today.slice(0, 7);
    return transactions
      .filter((t) => t.date.startsWith(curMonth) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [transactions, today]);

  // Category Breakdown for pie chart
  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amountPaise);
      });

    const colors = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E', '#14B8A6', '#D97706'];

    return Array.from(map.entries())
      .map(([catId, amountPaise], idx) => {
        const cat = expenseCategories.find((c) => c.id === catId);
        return {
          name: cat ? cat.name : 'Other',
          value: amountPaise / 100,
          color: cat?.color || colors[idx % colors.length],
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, expenseCategories]);

  // Overall budget tracking
  const overallMonthlyBudgetPaise = userSettings?.budgetConfig.overallMonthlyPaise || 3500000;
  const budgetUsedPct = Math.round((monthExpensePaise / overallMonthlyBudgetPaise) * 100);
  const isBudgetWarning = budgetUsedPct >= 85;
  const isBudgetExceeded = budgetUsedPct >= 100;

  // Open modal for new
  const handleOpenNew = (type: TransactionType = 'expense') => {
    setIsModalOpen(true);
    setEditingTxId(null);
    setFormType(type);
    setFormAmountRupees('');
    setFormTitle('');
    setFormCategory(expenseCategories[0]?.id || 'cat-food');
    setFormDate(today);
    setFormPaymentMethod('upi');
    setFormMerchant('');
    setFormNotes('');
    setFormIsRecurring(false);
  };

  // Open modal for edit
  const handleEditTx = (tx: FinancialTransaction) => {
    setIsModalOpen(true);
    setEditingTxId(tx.id);
    setFormType(tx.type);
    setFormAmountRupees(String(tx.amountPaise / 100));
    setFormTitle(tx.title);
    setFormCategory(tx.categoryId);
    setFormDate(tx.date);
    setFormPaymentMethod(tx.paymentMethod);
    setFormMerchant(tx.merchant || '');
    setFormNotes(tx.notes || '');
    setFormIsRecurring(!!tx.isRecurring);
  };

  const handleDuplicateTx = async (tx: FinancialTransaction) => {
    await addTransaction({
      type: tx.type,
      amountPaise: tx.amountPaise,
      title: `${tx.title} (Copy)`,
      categoryId: tx.categoryId,
      subCategory: tx.subCategory,
      date: today,
      paymentMethod: tx.paymentMethod,
      merchant: tx.merchant,
      notes: tx.notes,
      tags: tx.tags,
      isRecurring: false,
    });
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const paise = parseRupeesToPaise(formAmountRupees);
    if (paise <= 0 || !formTitle.trim()) return;

    if (editingTxId) {
      await updateTransaction(editingTxId, {
        type: formType,
        amountPaise: paise,
        title: formTitle.trim(),
        categoryId: formCategory,
        date: formDate,
        paymentMethod: formPaymentMethod,
        merchant: formMerchant.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isRecurring: formIsRecurring,
      });
    } else {
      await addTransaction({
        type: formType,
        amountPaise: paise,
        title: formTitle.trim(),
        categoryId: formCategory,
        date: formDate,
        paymentMethod: formPaymentMethod,
        merchant: formMerchant.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isRecurring: formIsRecurring,
      });
    }
    setIsModalOpen(false);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetPaise = parseRupeesToPaise(monthlyBudgetRupees);
    await updateUserSettings({
      budgetConfig: {
        overallMonthlyPaise: budgetPaise,
        currencySymbol,
        currencyCode: 'INR',
      },
    });
    setIsBudgetModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Manual Personal Finance & Spending Insights</span>
            <span aria-hidden="true">·</span>
            <span>Local & Private ({currencySymbol} INR)</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Personal Expense & Income Ledger
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Full transparency into spending patterns, monthly budget compliance, and cash flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Wallet size={13} />
            <span>Budget Settings</span>
          </button>

          <button
            onClick={() => handleOpenNew('expense')}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={13} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Budget Warning Banner if approaching / exceeded */}
      {isBudgetWarning && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            isBudgetExceeded
              ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
              : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
          }`}
        >
          <AlertTriangle size={16} className={`shrink-0 ${isBudgetExceeded ? 'text-rose-400' : 'text-amber-400'}`} />
          <div className="flex-1">
            <span className="font-semibold">
              {isBudgetExceeded ? 'Monthly Budget Exceeded:' : 'Budget Alert:'}
            </span>{' '}
            You have spent {formatCurrency(monthExpensePaise, currencySymbol)} of your{' '}
            {formatCurrency(overallMonthlyBudgetPaise, currencySymbol)} monthly budget ({budgetUsedPct}%).
          </div>
        </div>
      )}

      {/* Date Filter Segmented Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-medium overflow-x-auto">
        {(['today', 'this_week', 'this_month', 'last_month', 'this_year', 'all'] as DateFilterType[]).map((period) => (
          <button
            key={period}
            onClick={() => setDateFilter(period)}
            className={`px-3 py-1.5 rounded-md capitalize whitespace-nowrap transition-colors ${
              dateFilter === period
                ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {period.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Expense in Period */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Total Expenses</span>
            <span className="text-[11px] capitalize">{dateFilter.replace('_', ' ')}</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            {formatCurrency(totalExpensePaise, currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono tabular-nums">
            Today: {formatCurrency(todayExpensePaise, currencySymbol)}
          </div>
        </div>

        {/* Total Income in Period */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Total Income</span>
            <span className="text-[11px] capitalize">{dateFilter.replace('_', ' ')}</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatCurrency(totalIncomePaise, currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Recorded credits & earnings
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Net Cash Flow</span>
            <span className="text-[11px]">Income – Expenses</span>
          </div>
          <div
            className={`text-xl font-bold font-mono tabular-nums ${
              netCashFlowPaise >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netCashFlowPaise, currencySymbol, { showSign: true, isExpense: netCashFlowPaise < 0 })}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {netCashFlowPaise >= 0 ? 'Positive balance' : 'Deficit in period'}
          </div>
        </div>

        {/* Monthly Budget Remaining */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Monthly Budget Used</span>
            <span className="font-mono tabular-nums">{budgetUsedPct}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-100 tabular-nums">
            {formatCurrency(Math.max(0, overallMonthlyBudgetPaise - monthExpensePaise), currencySymbol)}{' '}
            <span className="text-xs font-normal text-neutral-500">left</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isBudgetExceeded ? 'bg-rose-500' : isBudgetWarning ? 'bg-amber-500' : 'bg-neutral-200'
              }`}
              style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Layout: Visual Analytics + Transaction History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spending Breakdown Chart (1 Col) */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <PieIcon size={14} className="text-neutral-400" />
              <span>Category Spending Share</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              {categoryChartData.length} categories
            </span>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No expenses recorded for the selected period.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${currencySymbol}${val}`, 'Spent']}
                      contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', fontSize: '11px', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend list */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {categoryChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-neutral-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-neutral-100 font-medium tabular-nums ml-2 shrink-0">
                      {currencySymbol}{item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Searchable Transaction Ledger Table (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-neutral-100">
              Transaction History ({sortedTransactions.length})
            </h3>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative min-w-[140px]">
                <Search size={13} className="absolute left-2.5 top-2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 placeholder:text-neutral-500"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-300"
              >
                <option value="all">All Types</option>
                <option value="expense">Expenses Only</option>
                <option value="income">Income Only</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-300"
              >
                <option value="all">All Categories</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-300"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {sortedTransactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500 rounded-lg bg-neutral-950 border border-neutral-800/80">
              No transactions match your search or filter parameters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500 font-medium pb-2">
                    <th className="py-2 pl-2">Date</th>
                    <th className="py-2">Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Method</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {sortedTransactions.map((tx) => {
                    const cat = expenseCategories.find((c) => c.id === tx.categoryId);
                    const isExpense = tx.type === 'expense';

                    return (
                      <tr key={tx.id} className="hover:bg-neutral-800/40 font-sans transition-colors">
                        <td className="py-3 pl-2 text-neutral-400 font-mono text-[11px] whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-neutral-200">{tx.title}</div>
                          {tx.merchant && (
                            <div className="text-[11px] text-neutral-500">{tx.merchant}</div>
                          )}
                        </td>
                        <td className="py-3 text-neutral-300 whitespace-nowrap text-[11px]">
                          {cat ? cat.name : 'Uncategorized'}
                        </td>
                        <td className="py-3 text-neutral-400 uppercase text-[10px] whitespace-nowrap">
                          {tx.paymentMethod.replace('_', ' ')}
                        </td>
                        <td
                          className={`py-3 text-right font-mono font-bold whitespace-nowrap tabular-nums ${
                            isExpense ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isExpense ? '- ' : '+ '}
                          {formatCurrency(tx.amountPaise, currencySymbol)}
                        </td>
                        <td className="py-3 pr-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDuplicateTx(tx)}
                              title="Duplicate record"
                              className="p-1 rounded text-neutral-500 hover:text-neutral-200"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => handleEditTx(tx)}
                              title="Edit record"
                              className="p-1 rounded text-neutral-500 hover:text-neutral-200"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              title="Delete record"
                              className="p-1 rounded text-neutral-500 hover:text-rose-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT TRANSACTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-4">
              {editingTxId ? 'Edit Transaction Record' : 'Record Transaction'}
            </h3>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-md border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                    formType === 'expense'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                    formType === 'income'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Amount ({currencySymbol} INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-neutral-400 font-mono">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={formAmountRupees}
                    onChange={(e) => setFormAmountRupees(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-base font-mono font-medium text-neutral-100 placeholder:text-neutral-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Groceries & Bananas"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Payment Method</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="cash">Cash</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Net Banking / Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Merchant / Shop (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Nature Basket, Amazon"
                    value={formMerchant}
                    onChange={(e) => setFormMerchant(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="txRecurring"
                  checked={formIsRecurring}
                  onChange={(e) => setFormIsRecurring(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-950"
                />
                <label htmlFor="txRecurring" className="text-neutral-300">
                  Recurring expense (e.g. Monthly rent, domain renewal, subscription)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  {editingTxId ? 'Save Changes' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MONTHLY BUDGET CONFIGURATION */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-2">
              Configure Monthly Spending Budget
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Set your target monthly expense limit. You will receive quiet warnings when approaching this threshold.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">
                  Overall Monthly Spending Budget ({currencySymbol} INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-neutral-400 font-mono">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={monthlyBudgetRupees}
                    onChange={(e) => setMonthlyBudgetRupees(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-sm font-mono text-neutral-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  Save Budget Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
