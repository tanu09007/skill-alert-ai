'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Target, 
  Clock, 
  Map,
  Play
} from 'lucide-react';

interface Phase {
  phase: string;
  topics: string[];
  duration: string;
  status: 'Completed' | 'Ongoing' | 'Upcoming';
}

function PathwayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'AI Agent Architect';
  const email = searchParams.get('email') || '';

  const [roadmap, setRoadmap] = useState<Phase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);



  const PROJECTS = [
    { title: 'Project 1: Basic Vector Search', level: 'Easy', status: 'Ongoing' },
    { title: 'Project 2: Multi-Agent Chatbot', level: 'Medium', status: 'Upcoming' },
    { title: 'Project 3: Production LLM Ops Pipeline', level: 'Hard', status: 'Upcoming' },
  ];

  useEffect(() => {
    // Simulate complex roadmap generation
    const timer = setTimeout(() => {
      setRoadmap([
        { phase: "Phase 1: Foundations", topics: ["Vector Databases (Pinecone/Milvus)", "Embedding Models", "LLM Context Windows"], duration: "2 Weeks", status: 'Completed' },
        { phase: "Phase 2: Orchestration", topics: ["LangChain/LlamaIndex", "Memory Management", "Agent Tools & Actions"], duration: "3 Weeks", status: 'Ongoing' },
        { phase: "Phase 3: Deployment", topics: ["LLM Ops", "Fine-tuning Foundations", "Cost Optimization"], duration: "2 Weeks", status: 'Upcoming' },
        { phase: "Phase 4: Capstone", topics: ["Multi-Agent Career Coach", "Production Benchmarking"], duration: "1 Week", status: 'Upcoming' }
      ]);
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [role]);

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + (8 * 7)); // 8 weeks out

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="mt-6 text-white/40 font-light tracking-widest uppercase text-xs">Architecting Your Pathway</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-24 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="space-y-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          >
            <Map className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Re-evaluate Discovery</span>
          </button>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Pathway to <span className="text-indigo-400">{role}</span></h1>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">ETA: {completionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">8 Weeks Mastery</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <Target className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium">4 Phases</span>
              </div>
            </div>
          </div>

        </header>

        {/* Weekly Projects Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Play className="w-6 h-6 text-indigo-400" />
            WEEKLY PROJECTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROJECTS.map(p => (
              <div key={p.title} className="bg-neutral-900/40 border border-white/5 p-6 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{p.level}</Badge>
                  <span className={`text-[10px] font-bold uppercase ${p.status === 'Ongoing' ? 'text-indigo-400' : 'text-white/20'}`}>
                    {p.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm">{p.title}</h4>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6 text-emerald-400" />
            LEARNING PHASES
          </h2>
          {roadmap.map((phase, idx) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-12 before:absolute before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-white/10 last:before:hidden"
            >
              <div className="absolute left-0 top-0 w-10 h-10 bg-neutral-900 border border-white/10 rounded-xl flex items-center justify-center font-bold text-xs text-white/40">
                {idx + 1}
              </div>
              
              <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-3xl space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold">{phase.phase}</h3>
                  <div className="flex gap-2">
                    {phase.status === 'Completed' && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20">
                        Completed
                      </Badge>
                    )}
                    {phase.status === 'Ongoing' && (
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/20 animate-pulse">
                        Ongoing
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-white/10 text-white/40">
                      {phase.duration}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.topics.map(topic => (
                    <div key={topic} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                      <span className="text-sm font-medium text-white/80">{topic}</span>
                    </div>
                  ))}
                </div>

                {(phase.status === 'Completed' || phase.status === 'Ongoing') && (
                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/assessment?phase=${idx + 1}`)}
                      className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-xl font-bold"
                    >
                      Take Phase {idx + 1} Assessment
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </section>

        <div className="pt-12 flex justify-center">
          <Button 
            onClick={() => router.push(`/dashboard?role=${encodeURIComponent(role)}&email=${encodeURIComponent(email)}`)}
            className="h-20 px-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-4xl text-2xl font-bold shadow-[0_0_40px_rgba(79,70,229,0.3)] group"
          >
            Initiate First Phase <Play className="ml-4 w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
          </Button>
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
