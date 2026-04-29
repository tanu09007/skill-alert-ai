'use client';

import { useEffect, useState } from 'react';
import { User, Award, BookOpen, Target, Settings } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'User',
    role: 'AI Agent Architect',
    joined: 'April 2026',
     completed: 0,
     certificates: 0,
     skills: ['Python', 'React', 'TypeScript', 'Node.js']
   });

  useEffect(() => {
    const savedName = localStorage.getItem('nexes_user_name');
    const savedEmail = localStorage.getItem('nexes_user_email');
    
    if (savedName) {
      setProfile(prev => ({ ...prev, name: savedName }));
    } else if (savedEmail) {
      setProfile(prev => ({
        ...prev,
        name: savedEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Nexes Learner'
      }));
    }
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm">
        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
          <User size={64} className="text-indigo-600" />
        </div>
        <div className="space-y-4 text-center md:text-left flex-1">
          <div>
            <h1 className="text-4xl font-black text-(--text-primary) capitalize">{profile.name}</h1>
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">{profile.role}</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-(--text-muted)">
            <span className="flex items-center gap-1"><Calendar size={14} /> Joined {profile.joined}</span>
            <span className="flex items-center gap-1"><Award size={14} /> {profile.certificates} Certifications</span>
          </div>
          <div className="pt-4 flex gap-3">
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
              Edit Profile
            </button>
            <button className="p-2 border border-(--border-light) rounded-xl text-(--text-muted) hover:bg-neutral-50 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-500" />
            CURRENT ENROLLMENT
          </h3>
          <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <h4 className="text-lg font-bold text-indigo-900">{profile.role}</h4>
            <p className="text-sm text-indigo-600/70 mb-4">Market Demand: Critical</p>
            <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-[15%]" />
            </div>
            <p className="text-[10px] font-bold text-indigo-400 mt-2 uppercase tracking-tighter">15% Course Completed</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <Target size={18} className="text-indigo-500" />
            LEARNING GOALS
          </h3>
          <ul className="space-y-3">
            {['Master Vector DBs', 'Deploy 3 Multi-Agent Systems', 'Get Certified in LLM Ops'].map(goal => (
              <li key={goal} className="flex items-center gap-3 text-sm text-(--text-secondary) font-medium">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm space-y-6">
        <h3 className="font-bold flex items-center gap-2">
          <Award size={18} className="text-indigo-500" />
          SKILLSET ANALYSIS
        </h3>
        <p className="text-sm text-(--text-muted) mb-4">These are the core competencies the AI has identified from your background and onboarding.</p>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map(skill => (
            <span key={skill} className="px-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold text-(--text-primary)">
              {skill}
            </span>
          ))}
          <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
            + Add Skill
          </button>
        </div>
      </div>
    </div>
  );
}

function Calendar({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
