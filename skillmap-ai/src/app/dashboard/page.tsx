'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Zap, 
  Target, 
  TrendingUp, 
  Briefcase,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';

  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!email);
  const [role, setRole] = useState('AI Agent Architect');
  const [velocity, setVelocity] = useState(84);
  const [overallMastery, setOverallMastery] = useState<number>(24);
  const [marketSignals, setMarketSignals] = useState<string[]>([]);

  useEffect(() => {
    const savedRole = localStorage.getItem('nexes_user_role') || 'AI Agent Architect';
    setRole(savedRole);

    const fetchData = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        const metadata = profile?.metadata || {};
        
        if (email) {
          const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          setVelocity((hash % 20) + 75);
        }

        const roadmapRes = await fetch('/api/generate-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...metadata, selected_roles: [savedRole] }),
        });
        const roadmapJson = await roadmapRes.json();
        
        if (roadmapJson.phases) {
          // Extract first few topics for the roadmap preview
          const previewSteps = roadmapJson.phases[0].weeks[0].days.slice(0, 4);
          setRoadmap(previewSteps);
        }

      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchData();
    
    // Fetch HN Signals
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(res => res.json())
      .then(ids => Promise.all(ids.slice(0, 10).map((id: number) => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))))
      .then(stories => setMarketSignals(stories.map(s => s.title)))
      .catch(() => setMarketSignals(["AI Infrastructure Demand Spikes", "NVIDIA H200 Shortage", "Vector DB growth in Enterprise"]));
  }, [email]);

  const todayTopic = roadmap[0]?.topic || 'Foundation & Architecture';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Market Ticker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-4 overflow-hidden shadow-sm">
          <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
            Market Signals
          </div>
          <div className="animate-marquee flex gap-8 whitespace-nowrap text-xs font-medium text-slate-500">
            {marketSignals.length > 0 ? marketSignals.map((s, i) => <span key={i}>• {s}</span>) : <span>Analyzing global tech trends...</span>}
            {marketSignals.map((s, i) => <span key={i+'_dup'}>• {s}</span>)}
          </div>
        </div>

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Good morning, Commander 👋</h1>
            <p className="text-slate-500 font-medium">Your {role} pathway is currently at <span className="text-blue-600 font-bold">{velocity}% efficiency</span></p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push(`/pathway?email=${email}&role=${role}`)}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
            >
              Resume Roadmap <ArrowUpRight size={18} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Day Streak', value: '🔥 12', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Mastery Level', value: `${overallMastery}%`, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Intelligence', value: '840', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Next Rank', value: 'Senior', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-6 rounded-4xl border border-white shadow-sm`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Today's Focus Card */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-4xl p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <Zap size={20} fill="currentColor" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">Active Module</span>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight">{todayTopic}</h2>
              <p className="text-slate-500 text-lg mb-8 max-w-xl">You&apos;re currently mastering the architecture fundamentals. Completing this unlocks the <span className="text-slate-900 font-bold">Agents Phase</span>.</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
                  <Clock size={16} /> 45 Minutes
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
                  <Target size={16} /> High Impact
                </div>
              </div>

              <button 
                onClick={() => router.push(`/learning-loop?topic=${encodeURIComponent(todayTopic)}`)}
                className="group px-10 py-5 bg-blue-600 text-white rounded-3xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-3"
              >
                Learn Today <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white rounded-4xl p-8 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">Learning Velocity</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-black">{velocity}%</span>
                <div className="p-2 bg-white/10 rounded-lg text-emerald-400">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${velocity}%` }} />
              </div>
              <p className="text-xs font-medium opacity-60">You are <span className="text-emerald-400">2 days ahead</span> of your original schedule. Keep this momentum!</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-4xl p-8 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Market Pulsar</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{role} Openings</p>
                    <p className="text-xs text-slate-500">1,240 new jobs this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Trending Skills</p>
                    <p className="text-xs text-slate-500">Rust, Vector DBs, LangChain</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Roadmap Preview */}
        <div className="bg-white border border-slate-200 rounded-4xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="text-blue-600" /> Roadmap Milestone
            </h3>
            <button 
              onClick={() => router.push(`/pathway?email=${email}&role=${role}`)}
              className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
            >
              View Full Pathway
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roadmap.length > 0 ? roadmap.map((step, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer">
                <p className="text-[10px] font-black text-slate-400 mb-2">DAY {step.day}</p>
                <h4 className="font-bold text-sm group-hover:text-blue-600 transition-colors">{step.topic}</h4>
                <div className="mt-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{step.type}</span>
                </div>
              </div>
            )) : (
              [1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />)
            )}
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
