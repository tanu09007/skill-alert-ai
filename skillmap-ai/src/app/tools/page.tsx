'use client';

import { motion } from 'framer-motion';
import { 
  Wrench, 
  TrendingUp, 
  GitBranch, 
  ExternalLink,
  Zap,
  Sparkles,
  ArrowRight,
  Bell,
  Search,
  Code2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const RECOMMENDATIONS = [
  {
    name: 'LangGraph',
    desc: 'Self-correcting, stateful multi-agent orchestration. Recommended based on your Logic & Flow skills.',
    github: 'langchain-ai/langgraph',
    growth: '+45%',
    time: '2 hours ago',
    type: 'New Recommendation',
    priority: 'Critical'
  },
  {
    name: 'Groq Cloud',
    desc: 'LPU Inference Engine. High-demand tech signal detected in GitHub Trending.',
    github: 'groq/inference-sdk',
    growth: '+82%',
    time: '5 hours ago',
    type: 'Market Signal',
    priority: 'High'
  },
  {
    name: 'Tavily Search',
    desc: 'AI-optimized search engine for RAG systems. Essential for your identified career path.',
    github: 'tavily-ai/tavily-python',
    growth: '+67%',
    time: 'Yesterday',
    type: 'Skill Gap Tool',
    priority: 'Essential'
  },
  {
    name: 'Vercel AI SDK',
    desc: 'The most powerful toolkit for building high-performance AI user interfaces.',
    github: 'vercel/ai',
    growth: '+38%',
    time: '2 days ago',
    type: 'Tech Alert',
    priority: 'Medium'
  }
];

export default function ToolsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 min-h-screen pb-24">
      <header className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-black uppercase tracking-widest">
            <Bell size={16} className="animate-bounce" />
            Intelligence Stream
          </div>
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1 rounded-full font-bold">
            Live Updates
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-(--text-primary) tracking-tight">Tech Recommendations</h1>
          <p className="text-(--text-secondary) text-lg max-w-xl font-light leading-relaxed">
            Personalized alerts for high-growth technologies mapped to your skill profile and GitHub demand signals.
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {RECOMMENDATIONS.map((tool, idx) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white border border-(--border-light) p-6 rounded-3xl hover:border-indigo-500 transition-all hover:shadow-xl hover:shadow-indigo-50/50 flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${
              tool.priority === 'Critical' ? 'bg-amber-50 text-amber-600' : 
              tool.priority === 'High' ? 'bg-indigo-50 text-indigo-600' : 'bg-neutral-50 text-(--text-muted)'
            }`}>
              {tool.priority === 'Critical' ? <Zap size={24} className="fill-current" /> : <Search size={24} />}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-black text-(--text-primary)">{tool.name}</h3>
                <Badge className="bg-neutral-50 text-(--text-muted) border-none text-[10px] font-bold">
                  {tool.type}
                </Badge>
                <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider ml-auto md:ml-0">
                  {tool.time}
                </span>
              </div>
              <p className="text-sm text-(--text-secondary) leading-relaxed font-medium max-w-2xl">
                {tool.desc}
              </p>
              <div className="flex items-center gap-4 text-xs font-bold pt-2">
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp size={14} /> {tool.growth} Growth
                </div>
                <div className="flex items-center gap-1 text-(--text-muted)">
                  <GitBranch size={14} /> {tool.github.split('/')[1]}
                </div>
              </div>
            </div>

            <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 hover:bg-indigo-50 hover:text-indigo-600">
              <ArrowRight size={20} />
            </Button>
          </motion.div>
        ))}
      </div>

      <footer className="bg-indigo-600 rounded-[3rem] p-10 text-center space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-black text-white">Refine your Intelligence</h2>
          <p className="text-indigo-100 max-w-md mx-auto font-medium opacity-80">
            Tell Nexes AI about specific frameworks you want to monitor, and we&apos;ll inject them into your stream.
          </p>
          <div className="pt-4">
            <Button className="h-14 px-10 bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-bold shadow-xl">
              Configure Stream Signals
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
