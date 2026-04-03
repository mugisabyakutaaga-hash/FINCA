import React from 'react';
import { Shield, Bike, User, Briefcase, Heart, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { InsuranceProduct } from '../types';

const products: InsuranceProduct[] = [
  {
    id: 'boda-shield',
    name: 'Boda-Shield',
    description: 'Daily/Weekly coverage for commercial riders. Protect your bike and your livelihood.',
    category: 'boda-boda',
    premium: 2000,
    period: 'daily',
    provider: 'FINCA Uganda',
  },
  {
    id: 'education-loan',
    name: 'Education Loan',
    description: 'Educational support made easy. Get loans for school fees and materials with flexible repayment.',
    category: 'personal',
    premium: 50000,
    period: 'monthly',
    provider: 'FINCA Uganda',
  },
  {
    id: 'group-account',
    name: 'Group Account',
    description: 'Effortless savings for your community to grow. High-interest group accounts for community groups.',
    category: 'business',
    premium: 10000,
    period: 'monthly',
    provider: 'FINCA Uganda',
  },
  {
    id: 'business-loan',
    name: 'Business Loan',
    description: 'Grow your business with a FINCA loan today. Tailored for small and medium enterprises.',
    category: 'business',
    premium: 150000,
    period: 'monthly',
    provider: 'FINCA Uganda',
  },
  {
    id: 'savings-account',
    name: 'Savings Account',
    description: 'Impactful financial service. Save for your future with competitive interest rates.',
    category: 'personal',
    premium: 5000,
    period: 'monthly',
    provider: 'FINCA Uganda',
  },
  {
    id: 'health-connect',
    name: 'Health-Connect',
    description: 'Micro-health insurance for individuals and small teams. Access to top clinics.',
    category: 'personal',
    premium: 15000,
    period: 'monthly',
    provider: 'FINCA Uganda',
  },
];

export default function Products() {
  return (
    <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Financial Products</h2>
        <p className="text-slate-500 text-sm">Tailored solutions for your lifestyle and business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {products.map((product) => (
          <div 
            key={product.id}
            className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col group hover:border-[#005696] transition-all hover:shadow-2xl hover:-translate-y-1"
          >
            <div className={cn(
              "p-6 text-white flex items-center justify-between",
              product.category === 'boda-boda' ? "bg-[#F39200]" : 
              product.category === 'personal' ? "bg-[#005696]" : "bg-indigo-700"
            )}>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                {product.category === 'boda-boda' ? <Bike size={24} /> : 
                 product.category === 'personal' ? <User size={24} /> : <Briefcase size={24} />}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{product.period} Premium</p>
                <p className="text-xl font-black tracking-tight">{formatCurrency(product.premium)}</p>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">{product.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{product.description}</p>
              
              <div className="space-y-3 mb-6">
                <FeatureItem text="Instant Processing" />
                <FeatureItem text="FINCA Trusted" />
                <FeatureItem text="Mobile Money Payments" />
              </div>

              <button className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-[#005696] hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                Get Started
                <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
      <CheckCircle2 size={14} className="text-green-500" />
      {text}
    </div>
  );
}
