'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Calendar,
  ChevronRight,
  AlertCircle,
  Activity,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProgressPage() {
  const router = useRouter();
  // Mock data for the 90-day activity grid
  // Activity grid initialized to simulate recent activity
  const activityDays = Array.from({ length: 90 }, (_, i) => ({
    level: i > 75 ? (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1) : 0,
    date: i
  }));

  const weakTopics = [
    { topic: 'Vector Embedding Optimization', score: 68, level: 'Low Score', lastSeen: '2 days ago' },
    { topic: 'LangChain Agent Tracing', score: 74, level: 'Improvement Needed', lastSeen: '4 days ago' },
  ];

  const [recentActivities, setRecentActivities] = useState<any[]>([
    { title: 'Mastered Topic: Vector DB Fundamentals', date: 'Yesterday', type: 'learning', points: '+120 XP' },
    { title: 'Started Roadmap: AI Agent Architect', date: '3 days ago', type: 'milestone', points: '+10 XP' }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('nexes_recent_activity');
    if (saved) {
      setRecentActivities(JSON.parse(saved));
    }
  }, []);

  // Mock data for velocity sparkline
  const velocityData = [40, 45, 42, 50, 55, 58, 65, 70, 68, 75, 82, 85, 90, 88];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-(--text-primary)">Your Progress</h1>
        <p className="text-(--text-secondary)">Week 1 of 8 • AI Agent Architect Roadmap</p>
      </header>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Day Streak', value: '🔥 12', color: '#ea580c' },
          { label: 'Topics Done', value: '4/22', color: 'var(--accent-blue)' },
          { label: 'Avg Score', value: '84.2', color: 'var(--accent-blue)' },
          { label: 'Complete', value: '18%', color: 'var(--accent-green)' },
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
        <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm relative overflow-hidden">
          <h3 className="font-bold mb-6 flex items-center gap-2 relative z-10">
            <Target size={18} className="text-indigo-500" />
            SKILL MASTERY ANALYSIS
          </h3>
          <div className="aspect-square relative flex items-center justify-center p-4">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-18">
              {/* Background Hexagons */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((p) => (
                <polygon
                  key={p}
                  points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="0.5"
                  style={{ transform: `scale(${p})`, transformOrigin: '50% 50%' }}
                />
              ))}
              {/* Axis Lines */}
              <line x1="50" y1="50" x2="50" y2="5" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="95" y2="72.5" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="5" y2="72.5" stroke="#f1f5f9" strokeWidth="0.5" />
              
              {/* Data Polygon (18% mastery spread) */}
              <polygon
                points="50,20 82,65 25,60"
                fill="rgba(79, 70, 229, 0.15)"
                stroke="rgb(79, 70, 229)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              
              {/* Data Points */}
              <circle cx="50" cy="20" r="1.5" fill="rgb(79, 70, 229)" />
              <circle cx="82" cy="65" r="1.5" fill="rgb(79, 70, 229)" />
              <circle cx="25" cy="60" r="1.5" fill="rgb(79, 70, 229)" />
            </svg>

            {/* Labels */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shadow-sm">LLM OPS</div>
            <div className="absolute bottom-4 right-4 text-[9px] font-black text-neutral-400">VECTOR DB</div>
            <div className="absolute bottom-4 left-4 text-[9px] font-black text-neutral-400">PROMPT ENG</div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-xl font-black text-indigo-600">84.2</span>
              <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">Avg IQ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Velocity Chart */}
        <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              LEARNING VELOCITY
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">
              +15% This Week
            </span>
          </div>
          <p className="text-sm text-(--text-muted) mb-6">Your speed of mastering new concepts over the last 14 days.</p>
          <div className="h-32 w-full flex items-end gap-1">
            {velocityData.map((val, i) => (
              <div key={i} className="flex-1 bg-emerald-50 rounded-t-sm relative group hover:bg-emerald-100 transition-colors" style={{ height: `${val}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {val} XP
                </div>
                {i === velocityData.length - 1 && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 rounded-t-sm" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm">
          <h3 className="font-bold flex items-center gap-2 mb-6">
            <Clock size={18} className="text-indigo-500" />
            RECENT ACTIVITY
          </h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-indigo-100 before:to-transparent">
            {recentActivities.map((activity, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-50 text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle2 size={16} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{activity.type}</span>
                    <span className="text-[10px] font-bold text-emerald-500">{activity.points}</span>
                  </div>
                  <h4 className="text-sm font-bold text-(--text-primary)">{activity.title}</h4>
                  <p className="text-[10px] font-medium text-(--text-muted) mt-2">{activity.date}</p>
                </div>
              </div>
            ))}
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
