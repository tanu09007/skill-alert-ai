'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Calendar,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProgressPage() {
  const router = useRouter();
  // Mock data for the 90-day activity grid
  // Activity grid initialized to zero
  const activityDays = Array.from({ length: 90 }, (_, i) => ({
    level: 0,
    date: i
  }));

  const weakTopics: any[] = [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-(--text-primary)">Your Progress</h1>
        <p className="text-(--text-secondary)">Week 1 of 8 • AI Agent Architect Roadmap</p>
      </header>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Day Streak', value: '🔥 0', color: '#ea580c' },
          { label: 'Topics Done', value: '0/22', color: 'var(--accent-blue)' },
          { label: 'Avg Score', value: '0.0', color: 'var(--accent-blue)' },
          { label: 'Complete', value: '0%', color: 'var(--accent-green)' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-2xl border border-(--border-light) shadow-sm">
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-(--text-muted)">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 90-Day Activity Heatmap */}
        <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" />
              90-DAY ACTIVITY
            </h3>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(15, 1fr)', 
            gap: '0.5rem' 
          }}>
            {activityDays.map((day, i) => (
              <div 
                key={i}
                className="w-full aspect-square rounded-sm"
                style={{
                  background: 
                    day.level === 0 ? '#f3f4f6' : 
                    day.level === 1 ? '#dcfce7' : 
                    day.level === 2 ? '#4ade80' : 
                    '#166534'
                }}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-(--text-muted) uppercase">
            <span>none</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-[#dcfce7] rounded-sm" />
              <div className="w-3 h-3 bg-[#4ade80] rounded-sm" />
              <div className="w-3 h-3 bg-[#166534] rounded-sm" />
            </div>
            <span>high</span>
          </div>
        </div>

        {/* Skill Mastery (Mock Radar Chart Style) */}
        <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Target size={18} className="text-indigo-500" />
            SKILL MASTERY
          </h3>
          <div className="aspect-square relative flex items-center justify-center">
            {/* Visual placeholder for radar chart */}
            <div className="absolute inset-0 border-10 border-indigo-50/50 rounded-full" />
            <div className="absolute inset-10 border-10 border-indigo-100/50 rounded-full" />
            <div className="absolute inset-20 border-10 border-indigo-200/50 rounded-full" />
            
            <div className="relative text-center">
              <TrendingUp className="w-12 h-12 text-indigo-500 mx-auto mb-2 opacity-20" />
              <p className="text-xs font-bold text-(--text-muted)">Radar Analysis Initializing...</p>
            </div>

            {/* Labels */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-(--text-muted)">LLM OPS</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-(--text-muted)">PROMPT ENG</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-(--text-muted)">VECTOR DB</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-(--text-muted)">ORCHESTRATION</div>
          </div>
        </div>
      </div>

      {/* Weak Topics to Review */}
      <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm">
        <h3 className="font-bold mb-6 flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-500" />
          WEAK TOPICS TO REVIEW
        </h3>
        <div className="space-y-4">
          {weakTopics.length > 0 ? weakTopics.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                  item.level === 'Low Score' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {item.level}
                </span>
                <div>
                  <div className="text-sm font-bold text-(--text-primary)">{item.topic}</div>
                  <div className="text-[10px] font-medium text-(--text-secondary)">Score {item.score} — {item.lastSeen}</div>
                </div>
              </div>
              <button 
                onClick={() => router.push(`/adaptive-update?topic=${encodeURIComponent(item.topic)}`)}
                className="px-6 py-2 bg-white border border-(--border-light) rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors shadow-sm"
              >
                Teach Weaker Session
              </button>
            </div>
          )) : (
            <div className="py-8 text-center opacity-30">
              <p className="text-sm font-bold">No topics requiring review yet.</p>
              <p className="text-xs">Keep learning to populate your intelligence analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
