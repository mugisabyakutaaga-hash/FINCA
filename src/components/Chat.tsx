import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, User, Bot, Loader2, Wallet as WalletIcon, Shield, Briefcase, Bike, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
  isPending?: boolean;
}

interface ChatProps {
  onSendMessage: (message: string) => Promise<string>;
  onFileUpload: (file: File) => Promise<string>;
}

export default function Chat({ onSendMessage, onFileUpload }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Greetings. I am Mfunzi, your FINCA Smart-Officer. I am here to help you grow your business and protect your community.\n\nPlease select your 'Protector Category':\n1. **Boda Boda / Commercial**\n2. **Personal Lifestyle (Education/Health)**\n3. **Business Asset (Group Savings/SME Loans)**",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await onSendMessage(userMessage);
      setMessages((prev) => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'model', text: "I apologize, but I encountered an error while securing your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessages((prev) => [...prev, { role: 'user', text: `[Uploaded: ${file.name}]` }]);
    setIsLoading(true);

    try {
      const response = await onFileUpload(file);
      setMessages((prev) => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'model', text: "I apologize, but I could not process the document. Please ensure it is a clear photo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Simulate sending voice note
      const voiceNoteMsg = "[Voice Note: Incident Description]";
      setMessages((prev) => [...prev, { role: 'user', text: voiceNoteMsg }]);
      setIsLoading(true);
      onSendMessage(voiceNoteMsg).then(response => {
        setMessages((prev) => [...prev, { role: 'model', text: response }]);
        setIsLoading(false);
      });
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#005696] flex items-center justify-center text-white shadow-lg">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 tracking-tight">Mfunzi</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              FINCA Digital Concierge
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <WalletIcon size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] p-4 rounded-2xl shadow-sm",
                msg.role === 'user' 
                  ? "bg-[#005696] text-white rounded-tr-none" 
                  : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
              )}>
                <div className="flex items-center gap-2 mb-1 opacity-70">
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {msg.role === 'user' ? 'Client' : 'Mfunzi'}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none prose-slate prose-headings:text-inherit prose-p:leading-relaxed">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={18} />
              <span className="text-sm text-slate-500 italic">Securing your request...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-white rounded-lg text-slate-500 transition-colors shadow-sm"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <button
            type="button"
            onClick={toggleRecording}
            className={cn(
              "p-2 rounded-lg transition-all shadow-sm",
              isRecording ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-white text-slate-500"
            )}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Protect your daily bread..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-[#005696] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-[#005696] transition-all shadow-md active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <QuickAction icon={<Bike size={14} />} label="Boda-Shield" onClick={() => setInput("I need Boda-Shield insurance for my bike")} />
          <QuickAction icon={<WalletIcon size={14} />} label="Balance" onClick={() => setInput("Check my FINCA balance")} />
          <QuickAction icon={<Shield size={14} />} label="Loan Limit" onClick={() => setInput("What is my mobile loan limit?")} />
          <QuickAction icon={<Briefcase size={14} />} label="SME Loan" onClick={() => setInput("I need a small enterprise loan for my business")} />
        </div>
      </form>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm whitespace-nowrap active:scale-95"
    >
      {icon}
      {label}
    </button>
  );
}
