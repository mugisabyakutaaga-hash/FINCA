import React, { useState, useMemo } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone, History, Plus, Minus, Filter, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import { Transaction } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface WalletProps {
  balance: number;
  transactions: Transaction[];
  onDeposit: (amount: number, method: 'momo' | 'ecobank') => void;
  onWithdraw: (amount: number, method: 'momo' | 'ecobank') => void;
}

export default function Wallet({ balance, transactions, onDeposit, onWithdraw }: WalletProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesType = filterType === 'all' || tx.type === filterType;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const txDate = new Date(tx.timestamp?.seconds * 1000 || Date.now());
        const now = new Date();
        if (dateRange === '7d') {
          matchesDate = txDate >= subDays(now, 7);
        } else if (dateRange === '30d') {
          matchesDate = txDate >= subDays(now, 30);
        }
      }
      
      return matchesType && matchesDate;
    });
  }, [transactions, filterType, dateRange]);

  const chartData = useMemo(() => {
    // Group transactions by date for the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MMM dd'),
        fullDate: startOfDay(date),
        balance: 0
      };
    });

    let currentBalance = balance;
    // This is a simplified visualization of balance over time
    return days.map(day => {
      const dayTxs = transactions.filter(tx => {
        const txDate = new Date(tx.timestamp?.seconds * 1000 || Date.now());
        return txDate >= startOfDay(day.fullDate) && txDate <= endOfDay(day.fullDate);
      });
      
      const dayChange = dayTxs.reduce((acc, tx) => {
        return tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount;
      }, 0);
      
      return {
        name: day.date,
        amount: dayChange
      };
    });
  }, [transactions, balance]);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#005696] to-indigo-900 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <WalletIcon size={160} />
        </div>
        <div className="relative z-10">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mb-2">FINCA Wallet Balance</p>
          <h2 className="text-5xl font-black tracking-tighter mb-8">{formatCurrency(balance)}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onDeposit(10000, 'momo')}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md py-4 rounded-2xl transition-all font-bold text-sm active:scale-95 shadow-lg"
            >
              <Plus size={20} />
              Deposit
            </button>
            <button 
              onClick={() => onWithdraw(5000, 'momo')}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md py-4 rounded-2xl transition-all font-bold text-sm active:scale-95 border border-white/10"
            >
              <Minus size={20} />
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
        {/* Visualization */}
        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Activity Overview</h3>
          <div className="h-48 w-full bg-slate-50 rounded-3xl p-4 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005696" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#005696" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#005696" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Filters */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <History size={16} />
              Transaction History
            </h3>
            <div className="flex gap-2">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-[10px] font-bold bg-slate-100 border-none rounded-full px-3 py-1 text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="premium-payment">Premiums</option>
              </select>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-[10px] font-bold bg-slate-100 border-none rounded-full px-3 py-1 text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium italic">No matching transactions found.</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      tx.type === 'deposit' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {tx.type === 'deposit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {tx.method} • {new Date(tx.timestamp?.seconds * 1000 || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-base font-black",
                      tx.type === 'deposit' ? "text-green-600" : "text-red-600"
                    )}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <div className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-full inline-block uppercase tracking-tighter",
                      tx.status === 'completed' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {tx.status}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
