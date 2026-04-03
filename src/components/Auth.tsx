import React from 'react';
import { Shield, LogIn, Smartphone, Globe, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10"
      >
        <div className="p-8 text-center bg-gradient-to-br from-[#005696] to-indigo-900 text-white">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-xl border border-white/10">
            <Shield size={48} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">FINCA Protector</h1>
          <p className="text-blue-100 text-sm font-medium uppercase tracking-[0.2em]">Digital Concierge</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Impactful Financial Services</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Welcome to the FINCA Uganda Digital Concierge. 
              We provide micro-insurance and financial services designed to grow your community and protect your business legacy.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#005696] text-white rounded-2xl font-bold text-lg hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 active:scale-95 group"
            >
              <Globe size={24} className="group-hover:rotate-12 transition-transform" />
              Sign in with Google
            </button>
            
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Access</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button 
              disabled
              className="w-full flex items-center justify-center gap-3 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold text-lg cursor-not-allowed opacity-60"
            >
              <Smartphone size={24} />
              Sign in with WhatsApp
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Lock size={14} />
            End-to-End Encryption Enabled
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Powered by FINCA Uganda • Impactful Financial Services
          </p>
        </div>
      </motion.div>
    </div>
  );
}
