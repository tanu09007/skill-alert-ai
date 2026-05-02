'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Calendar,
  ChevronRight,
  AlertCircle,
  Activity,
  Clock,
  CheckCircle2,
  RefreshCw,
  Layout
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from 'recharts';

export default function ProgressPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchProgress = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/progress-summary?user_id=${uid}`);
      const json = await res.json();
      // Only throw on hard errors (4xx/5xx without data), not on empty-state warnings
      if (json.error && !json.streak && !json.topics_done && !json.recent_activity) {
        throw new Error(json.error);
      }
      setData(json);
    } catch (err) {
      console.error('Fetch progress error:', err);
      // Set empty state so loading spinner goes away
      setData({
        streak: 0, topics_done: 0, topics_total: 0,
        avg_score: '0.0', completion_pct: 0,
        current_week: 1, total_weeks: 8,
        roadmap_name: 'No Roadmap Active',
        calendar_data: [], skill_mastery: [],
        velocity_data: [], recent_activity: [], weak_topics: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      // 1. Try to get user from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchProgress(user.id);
        return;
      }

      // 2. Fallback to localStorage email (common for pseudo-sessions)
      const savedEmail = localStorage.getItem('nexes_user_email');
      if (savedEmail) {
        setUserId(savedEmail); // Pass email as userId to the API
        fetchProgress(savedEmail);
      } else {
        // Try to get email from query params
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');
        if (emailParam) {
          setUserId(emailParam);
          fetchProgress(emailParam);
        } else {
          router.push('/dashboard');
        }
      }
    };
    init();
  }, [fetchProgress, router]);

  // Realtime Subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('progress-live')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'progress_logs',
        filter: `user_id=eq.${userId}`
      }, () => fetchProgress(userId))
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'learning_sessions',
        filter: `user_id=eq.${userId}`
      }, () => fetchProgress(userId))
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'assessments', 
        filter: `user_id=eq.${userId}`
      }, () => fetchProgress(userId))
      .subscribe();

    const interval = setInterval(() => fetchProgress(userId), 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userId, fetchProgress]);

  function timeAgo(date: string) {
    if (!date) return 'Recently';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Analyzing Your Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Progress</h1>
          <p className="text-slate-500 font-medium">
            Week {data.current_week} of {data.total_weeks} • {data.roadmap_name}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Live Engine Active</span>
        </div>
      </header>

      {/* Empty state banner when no roadmap found */}
      {data.roadmap_name === 'No Roadmap Active' && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center gap-4">
          <div className="text-3xl">🚀</div>
          <div>
            <p className="font-black text-amber-800 text-sm uppercase tracking-widest">No Learning Data Yet</p>
            <p className="text-amber-700 text-sm mt-1">
              Complete your onboarding and start a learning session — your stats will appear here in real time.
            </p>
          </div>
          <button
            onClick={() => router.push('/onboarding')}
            className="ml-auto px-5 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors whitespace-nowrap"
          >
            Start Onboarding →
          </button>
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Day Streak', value: `🔥 ${data.streak}`, color: '#ea580c' },
          { label: 'Topics Done', value: `${data.topics_done}/${data.topics_total}`, color: '#2563eb' },
          { label: 'Avg Score', value: data.avg_score, color: '#4f46e5' },
          { label: 'Complete', value: `${data.completion_pct}%`, color: '#10b981' },
        ].map((s) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={s.label} 
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 90-Day Activity Heatmap */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-widest text-slate-800">
              <Calendar size={18} className="text-indigo-500" />
              90-DAY ACTIVITY
            </h3>
          </div>
          <div className="grid grid-cols-15 gap-1.5 md:gap-2">
            {data.calendar_data.map((day: any, i: number) => (
              <div 
                key={i}
                className="w-full aspect-square rounded-sm transition-all hover:scale-125 cursor-help"
                title={`${day.formatted}: ${day.topics_covered.length > 0 ? day.topics_covered.join(', ') : 'No activity'}`}
                style={{
                  background: 
                    day.activity_level === 0 ? '#f8fafc' : 
                    day.activity_level === 1 ? '#dcfce7' : 
                    day.activity_level === 2 ? '#86efac' : 
                    day.activity_level === 3 ? '#22c55e' :
                    '#15803d'
                }}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>none</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(level => (
                <div key={level} className="w-3 h-3 rounded-sm" style={{ 
                  background: level === 1 ? '#dcfce7' : level === 2 ? '#86efac' : level === 3 ? '#22c55e' : '#15803d' 
                }} />
              ))}
            </div>
            <span>high</span>
          </div>
        </div>

        {/* Skill Mastery Radar Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden min-w-0">
          <h3 className="font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest text-slate-800">
            <Target size={18} className="text-indigo-500" />
            SKILL MASTERY ANALYSIS
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.skill_mastery}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                />
                <Radar
                  name="Mastery"
                  dataKey="mastery"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-4">
             <span className="text-3xl font-black text-indigo-600">{data.avg_score}</span>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Avg Mastery</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-w-0 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-widest text-slate-800">
              <Activity size={18} className="text-emerald-500" />
              LEARNING VELOCITY
            </h3>
          </div>
          <p className="text-xs font-medium text-slate-500 mb-8">Topics mastered per day over the last 14 days.</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.velocity_data}>
                <XAxis dataKey="date" hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded-lg text-[10px] font-bold">
                          {payload[0].value} Topics
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="topics" radius={[4, 4, 0, 0]}>
                  {data.velocity_data.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.score >= 7 ? '#10b981' : entry.score >= 5 ? '#f59e0b' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="font-black text-sm flex items-center gap-2 mb-8 uppercase tracking-widest text-slate-800">
            <Clock size={18} className="text-indigo-500" />
            RECENT ACTIVITY
          </h3>
          <div className="space-y-6 relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-50" />
            {data.recent_activity.map((activity: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="relative flex items-start gap-6 group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-100 text-indigo-500 shadow-sm shrink-0 z-10">
                  {activity.type === 'learning' ? <Layout size={16} /> : <CheckCircle2 size={16} />}
                </div>
                <div className="flex-1 pb-6 border-b border-slate-50 group-last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{activity.type}</span>
                    <span className="text-[9px] font-bold text-slate-400">{timeAgo(activity.time)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{activity.label}</h4>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{activity.detail}</p>
                </div>
              </motion.div>
            ))}
            {data.recent_activity.length === 0 && (
              <div className="py-12 text-center opacity-30">
                <p className="text-xs font-bold uppercase tracking-widest">No activity logged yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weak Topics to Review */}
      <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
        <h3 className="font-black text-sm mb-8 flex items-center gap-2 uppercase tracking-widest text-white">
          <AlertCircle size={18} className="text-rose-500" />
          INTELLIGENCE GAPS
        </h3>
        <div className="space-y-4">
          {data.weak_topics.length > 0 ? data.weak_topics.map((item: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.score !== null ? `Score ${item.score}` : 'Low Activity'}
                </span>
                <div>
                  <div className="text-base font-bold text-white">{item.topic}</div>
                  <div className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Last Attempt: {timeAgo(item.date)}</div>
                </div>
              </div>
              <button 
                onClick={() => router.push(`/assessment?topic=${encodeURIComponent(item.topic)}`)}
                className="px-8 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all transform active:scale-95 shadow-xl"
              >
                Retrain Concept
              </button>
            </div>
          )) : (
            <div className="py-12 text-center text-white/20">
              <p className="text-sm font-black uppercase tracking-widest">Awaiting more data to identify gaps</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
      `}</style>
    </div>
  );
}
