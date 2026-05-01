'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import {
  Calendar,
  Target,
  Clock,
  Map,
  Play,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Award
} from 'lucide-react';

interface Day {
  day: number;
  topic: string;
  subtopic: string;
  actual_date: string;
  formatted_date: string;
  is_today: boolean;
  is_past: boolean;
  type: string;
  description: string;
}

interface Phase {
  phase: string;
  topic: string;
  topics: string[];
  days: Day[];
  duration: string;
  status: 'Completed' | 'Ongoing' | 'Upcoming';
  is_exam_prep?: boolean;
}

function PathwayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'AI Agent Architect';
  const email = searchParams.get('email') || '';

  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const [activeDay, setActiveDay] = useState<Day | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [projects, setProjects] = useState([
    { title: 'Project 1: Foundation', level: 'Easy', status: 'Ongoing' },
    { title: 'Project 2: Integration', level: 'Medium', status: 'Upcoming' },
    { title: 'Project 3: Production', level: 'Hard', status: 'Upcoming' },
  ]);

  useEffect(() => {
    const initPathway = async () => {
      setLoading(true);
      try {
        // 1. Get user profile
        let userEmail = email;
        let profileData = null;
        
        if (userEmail) {
          const { data } = await supabase
            .from('profiles')
            .select('metadata')
            .eq('email', userEmail)
            .single();
          profileData = data?.metadata;
          setProfileData(profileData);
        }

        // 2. Generate Roadmap via new Next.js API
        const roadmapRes = await fetch('/api/generate-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...profileData,
            chosen_skills: profileData?.tech_stack ? (Array.isArray(profileData.tech_stack) ? profileData.tech_stack : [profileData.tech_stack]) : [role],
            selected_roles: [role]
          })
        });
        
        if (roadmapRes.ok) {
          const data = await roadmapRes.json();
          setRoadmapData(data);
          // The new structure has phases -> weeks -> days
          // We can keep the state simple by just storing the data
          setRoadmap(data.phases || []);
        }
      } catch (err) {
        console.error("Pathway init error:", err);
      } finally {
        setLoading(false);
      }
    };
    initPathway();
  }, [role, email]);

  const fetchVideos = async (topic: string, subtopic: string) => {
    setVideosLoading(true);
    try {
      const res = await fetch('/api/fetch-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subtopic,
          learning_mode: localStorage.getItem('nexes_learning_mode') || 'free',
          cgpa: profileData?.cgpa || '7.5',
          preferred_language: profileData?.preferred_language || 'English'
        })
      });
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error("Fetch videos error:", err);
    } finally {
      setVideosLoading(false);
    }
  };

  const completionDate = roadmapData?.estimated_completion ? new Date(roadmapData.estimated_completion) : new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="mt-6 text-white/40 font-light tracking-widest uppercase text-xs">Architecting Your Pathway</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header Section */}
        <header className="mb-16">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Personalized Pathway
                </Badge>
                {localStorage.getItem('nexes_learning_mode') === 'paid' && (
                  <Badge className="bg-amber-500 text-black border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Award size={10} /> Paid Mode
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                {roadmapData?.skill ? `${roadmapData.skill} Learning Roadmap` : `Master ${role}`}
              </h1>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-bold"
            >
              Dashboard <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Estimated Finish</p>
                <p className="font-bold">{completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Target size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Roadmap Scope</p>
                <p className="font-bold">{roadmapData?.total_weeks || roadmap.length} Detailed Weeks</p>
              </div>
            </div>
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Award size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Goal</p>
                <p className="font-bold">{localStorage.getItem('nexes_cert_pref') !== 'none' ? 'Certification Ready' : 'Skill Mastery'}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Roadmap List */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Map className="text-indigo-400" size={24} /> Your Dynamic Curriculum
            </h2>

            {roadmap.map((phase: any, idx: number) => (
              <div key={idx} className="relative pl-8 border-l border-white/10 last:border-transparent pb-12">
                <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-black bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]`} />
                
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Phase {phase.phase} — {phase.phase_name}</h2>
                  <p className="text-white/50 text-sm italic">{phase.phase_goal}</p>
                </div>

                <div className="space-y-6">
                  {phase.weeks.map((week: any, wIdx: number) => (
                    <div 
                      key={wIdx}
                      className={`p-6 rounded-3xl border bg-neutral-900/30 border-white/5 hover:border-indigo-500/30 transition-all`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-indigo-300">Week {week.week} — {week.week_theme}</h3>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                            {week.days[0].formatted_date} to {week.days[week.days.length-1].formatted_date}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {week.days.map((day: any, dIdx: number) => (
                          <div 
                            key={dIdx}
                            onClick={() => {
                              setActiveDay(day);
                              fetchVideos(day.topic, day.subtopic);
                            }}
                            className={`flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
                              activeDay?.day === day.day && activeDay?.topic === day.topic 
                                ? 'bg-indigo-500/20 border-indigo-500/50' 
                                : 'bg-white/5 border-transparent hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                  day.is_past ? 'bg-emerald-500/20 text-emerald-400' :
                                  day.is_today ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-white/10 text-white/40'
                                }`}>
                                  D{day.day}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className={`text-sm font-bold ${day.is_today ? 'text-indigo-400' : 'text-white'}`}>
                                      {day.topic} — {day.subtopic}
                                    </p>
                                    {day.is_today && <Badge className="bg-indigo-500 text-white border-none text-[8px] h-4">TODAY</Badge>}
                                  </div>
                                  <p className="text-[10px] text-white/30">{day.formatted_date}</p>
                                </div>
                              </div>
                              {day.is_past ? <CheckCircle2 size={16} className="text-emerald-500" /> : <ArrowRight size={14} className="text-white/20" />}
                            </div>
                            
                            <div className="pl-12">
                              <p className="text-xs text-white/50 leading-relaxed mb-2">{day.description}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black uppercase tracking-tighter bg-white/5 text-white/40 px-2 py-0.5 rounded border border-white/5">
                                  Output: {day.deliverable}
                                </span>
                                <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${
                                  day.type === 'practice' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  day.type === 'project' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {day.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {phase.is_exam_prep && (
                  <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                    <Award className="text-amber-400" size={24} />
                    <div>
                      <p className="text-sm font-bold text-amber-400">Certification Prep Week</p>
                      <p className="text-xs text-white/60">Final review and exam simulations included.</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Sidebar: Active Day Details */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              {activeDay ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-900/50 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Badge className="bg-indigo-600/20 text-indigo-400 border-none px-3 py-1">DAY {activeDay.day}</Badge>
                    <Badge variant="outline" className="text-white/40 border-white/10 uppercase text-[10px]">{activeDay.type}</Badge>
                  </div>

                  <h2 className="text-2xl font-bold mb-4">{activeDay.topic}</h2>
                  <p className="text-white/60 text-sm leading-relaxed mb-8">{activeDay.description}</p>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                      <Play size={12} fill="currentColor" /> Personalized Resources
                    </h3>

                    {videosLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : videos.length > 0 ? (
                      <div className="space-y-4">
                        {videos.map((video, vIdx) => (
                          <a 
                            key={vIdx}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex gap-4 p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-indigo-500/30 transition-all"
                          >
                            <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 relative">
                              <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play size={16} fill="white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold line-clamp-2 mb-1 group-hover:text-indigo-400 transition-colors">{video.title}</p>
                              <p className="text-[10px] text-white/40">{video.channel}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-xs text-white/40 italic">Click a topic to fetch curated videos</p>
                      </div>
                    )}

                    <Button 
                      onClick={() => router.push(`/assessment?day=${activeDay.day}`)}
                      className="w-full py-6 bg-white text-black hover:bg-white/90 rounded-2xl font-bold text-sm shadow-xl shadow-white/5 group"
                    >
                      Complete & Take Quiz <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] text-center p-8">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-white/20">
                    <Target size={32} />
                  </div>
                  <h3 className="font-bold text-white/60 mb-2">Focus on your goal</h3>
                  <p className="text-xs text-white/30 max-w-[200px]">Select any day from your roadmap to reveal study materials and focus tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearningPathway() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PathwayContent />
    </Suspense>
  );
}
