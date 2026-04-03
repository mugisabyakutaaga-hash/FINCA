import React from 'react';
import { Shield, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { Policy } from '../types';

interface MyPoliciesProps {
  policies: Policy[];
}

export default function MyPolicies({ policies }: MyPoliciesProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Policies</h2>
        <p className="text-slate-500 text-sm">Manage your active and pending insurance coverage.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {policies.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Shield size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Active Policies</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
              You don't have any insurance policies yet. Browse our products to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            {policies.map((policy) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col group hover:border-blue-400 transition-all"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{policy.productId}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Policy ID: {policy.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <StatusBadge status={policy.status} />
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(policy.startDate?.seconds * 1000 || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(policy.endDate?.seconds * 1000 || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Premium Paid</p>
                      <p className="text-lg font-black text-blue-600">{formatCurrency(policy.premiumPaid)}</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: "bg-green-50 text-green-700 border-green-100",
    expired: "bg-red-50 text-red-700 border-red-100",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
  };

  const icons = {
    active: <CheckCircle size={12} />,
    expired: <AlertCircle size={12} />,
    pending: <Clock size={12} />,
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof icons]}
      {status}
    </div>
  );
}
