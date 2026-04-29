'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  TrendingDown, 
  ArrowDown,
  Sparkles,
  Info
} from 'lucide-react';

type UpdateType = 'Minor' | 'Partial' | 'Major';

interface DeltaItem {
  old: string;
  new: string;
  reason: string;
  duration: string;
}

export default function AdaptiveUpdatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get('topic') || 'Data Science Essentials';
  
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<UpdateType>('Minor');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const delta: DeltaItem[] = [
    { old: 'Scikit-Learn Regression', new: 'Transformer-based Predictive Flows', reason: 'Market moving toward agentic forecasting', duration: '2 weeks' },
    { old: 'Local SQL Storage', new: 'Vector DB (Pinecone/Milvus)', reason: 'RAG architecture is now the industry standard', duration: '1 week' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-(--bg-main)">
        <div className="relative">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-(--text-primary)">Analyzing Market Shift...</h2>
          <p className="text-sm text-(--text-secondary)">Comparing your {topic} roadmap with real-time job demand</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-indigo-600 text-sm font-black uppercase tracking-widest">
          <RefreshCw size={14} />
          Adaptive Learning Loop
        </div>
        <h1 className="text-4xl font-black text-(--text-primary)">Roadmap Course-Correction</h1>
        <p className="text-(--text-secondary)">We detected a change in the market for **{topic}**. Here is your adjusted path.</p>
      </header>

      {/* Analysis Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="bg-white p-6 rounded-2xl border border-(--border-light) text-center space-y-2 shadow-sm">
          <div className="flex justify-center gap-1">
            {[1,2,3].map(i => <CheckCircle2 key={i} size={16} className="text-emerald-500" />)}
          </div>
          <p className="text-[10px] font-bold text-(--text-muted) uppercase">Your Progress</p>
          <p className="text-sm font-bold">3 Modules Done</p>
        </div>

        <div className="flex justify-center text-rose-500 animate-bounce">
          <TrendingDown size={24} />
        </div>

        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center space-y-2">
          <div className="flex justify-center">
            <AlertTriangle size={24} className="text-rose-500" />
          </div>
          <p className="text-[10px] font-bold text-rose-400 uppercase">Market Shift</p>
          <p className="text-sm font-bold text-rose-900">Legacy Tool Detected</p>
        </div>

        <div className="bg-indigo-600 p-6 rounded-2xl text-center space-y-2 text-white shadow-xl shadow-indigo-200">
          <div className="text-xl font-black">70%</div>
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">REUSABLE CORE</p>
          <p className="text-xs font-medium">Keep moving forward</p>
        </div>
      </div>

      {/* The Delta View */}
      <div className="bg-white rounded-3xl border border-(--border-light) shadow-sm overflow-hidden">
        <div className="p-6 bg-neutral-50 border-b border-(--border-light) flex justify-between items-center">
          <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" />
            THE DELTA — What&apos;s Changing
          </h3>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full">
            MINOR TWEAK 🟢
          </span>
        </div>
        
        <div className="divide-y divide-(--border-light)">
          {delta.map((item, i) => (
            <div key={i} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-500 bg-rose-50 w-fit px-2 py-0.5 rounded">
                  <TrendingDown size={10} /> REMOVING
                </div>
                <div className="text-lg font-bold text-neutral-400 line-through decoration-2">{item.old}</div>
              </div>
              
              <div className="hidden md:block text-indigo-300">
                <ArrowRight size={24} />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                  <Sparkles size={10} /> ADDING
                </div>
                <div className="text-lg font-bold text-indigo-900">{item.new}</div>
                <p className="text-xs text-(--text-secondary)">{item.reason} · <span className="text-indigo-600 font-bold">+{item.duration}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-lg font-bold text-indigo-900">Apply these changes?</h4>
          <p className="text-sm text-indigo-600">Your roadmap will be updated, but your 70% progress is safe.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.back()}
            className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm border border-indigo-200 hover:bg-white/80 transition-colors"
          >
            Not Now
          </button>
          <button 
            onClick={() => router.push('/pathway')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            Update My Roadmap
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default">
        <div className="flex items-center gap-1 text-[10px] font-bold"><Info size={12} /> ANXIETY LEVEL: VERY LOW</div>
        <div className="flex items-center gap-1 text-[10px] font-bold"><RefreshCw size={12} /> REUSED: 3/5 SKILLS</div>
      </div>
    </div>
  );
}
