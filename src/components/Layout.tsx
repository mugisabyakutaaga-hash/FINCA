import React, { useState } from 'react';
import { MessageSquare, Wallet as WalletIcon, Shield, Briefcase, Settings, LogOut, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, user, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'chat', label: 'FINCA Chat', icon: <MessageSquare size={20} /> },
    { id: 'wallet', label: 'My Wallet', icon: <WalletIcon size={20} /> },
    { id: 'policies', label: 'My Policies', icon: <Shield size={20} /> },
    { id: 'products', label: 'Insurance Products', icon: <Shield size={20} /> },
    { id: 'business', label: 'Business Assets', icon: <Briefcase size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-2xl z-20"
          >
            {/* Logo */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005696] flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Shield size={24} />
                </div>
                <div>
                  <h1 className="font-black text-xl tracking-tighter text-[#005696]">FINCA</h1>
                  <p className="text-[10px] font-bold text-[#F39200] uppercase tracking-[0.2em] -mt-1">Protector</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Main Menu</p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm group",
                    activeTab === item.id 
                      ? "bg-[#005696] text-white shadow-lg shadow-blue-100" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <span className={cn(
                    "transition-transform group-hover:scale-110",
                    activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-[#005696]"
                  )}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#005696] border-2 border-white shadow-sm">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.displayName || 'Guest User'}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{user?.email || 'Not signed in'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#005696] hover:border-blue-200 transition-all shadow-sm">
                    <Settings size={16} />
                  </button>
                  <button 
                    onClick={onLogout}
                    className="flex-1 flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="font-bold text-slate-800 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Secure FINCA Connection
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
