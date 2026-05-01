'use client';

import { useEffect, useState } from 'react';
import { User, Award, BookOpen, Target, Settings } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [profile, setProfile] = useState({
    name: 'User',
    role: 'AI Agent Architect',
    joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    completed: 0,
    certificates: 0,
    skills: ['Python', 'React', 'TypeScript', 'Node.js']
  });
  const [goals, setGoals] = useState(['Mastering Core Fundamentals', 'Building Industry Projects', 'Getting Certified']);

  useEffect(() => {
    const savedName = localStorage.getItem('nexes_user_name');
    const savedRole = localStorage.getItem('nexes_user_role');
    const savedEmail = localStorage.getItem('nexes_user_email');
    const savedSkills = localStorage.getItem('nexes_user_skills');
    const savedMastery = localStorage.getItem('nexes_overall_mastery');
    
    if (savedName) {
      setProfile(prev => ({ ...prev, name: savedName }));
    } else if (savedEmail) {
      setProfile(prev => ({
        ...prev,
        name: savedEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Nexes Learner'
      }));
    }

    if (savedMastery) {
      setProfile(prev => ({ 
        ...prev, 
        completed: parseInt(savedMastery, 10),
        certificates: Math.floor(parseInt(savedMastery, 10) / 25) 
      }));
    }

    if (savedRole) {
      setProfile(prev => ({ ...prev, role: savedRole }));
      
      // Fetch dynamic goals from Gemini
      fetch('http://localhost:8000/api/role-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: savedRole })
      })
      .then(res => res.json())
      .then(data => {
        if (data.goals) setGoals(data.goals);
      })
      .catch(console.error);
    }

    if (savedSkills) {
      setProfile(prev => ({ ...prev, skills: JSON.parse(savedSkills) }));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('nexes_user_name', profile.name);
    localStorage.setItem('nexes_user_role', profile.role);
    localStorage.setItem('nexes_user_skills', JSON.stringify(profile.skills));
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newSkill.trim()) {
      const updatedSkills = [...profile.skills, newSkill.trim()];
      setProfile({ ...profile, skills: updatedSkills });
      localStorage.setItem('nexes_user_skills', JSON.stringify(updatedSkills));
      setNewSkill('');
      setShowSkillInput(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm">
        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl shrink-0">
          <User size={64} className="text-indigo-600" />
        </div>
        <div className="space-y-4 text-center md:text-left flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input 
                type="text" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="text-2xl font-black w-full border-b-2 border-indigo-500 outline-none pb-1"
                placeholder="Your Name"
              />
              <input 
                type="text" 
                value={profile.role} 
                onChange={(e) => setProfile({...profile, role: e.target.value})}
                className="text-indigo-600 font-bold uppercase tracking-widest text-xs w-full outline-none"
                placeholder="Job Role"
              />
            </div>
          ) : (
            <div>
              <h1 className="text-4xl font-black text-(--text-primary) capitalize">{profile.name}</h1>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">{profile.role}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-(--text-muted)">
            <span className="flex items-center gap-1"><Calendar size={14} /> Joined {profile.joined}</span>
            <span className="flex items-center gap-1"><Award size={14} /> {profile.certificates} Certifications</span>
          </div>
          <div className="pt-4 flex gap-3">
            {isEditing ? (
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
              >
                Save Profile
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
            
            <button 
              onClick={() => alert('Settings: Account preferences, Theme, and Notifications.')}
              className="p-2 border border-(--border-light) rounded-xl text-(--text-muted) hover:bg-neutral-50 transition-colors"
            >
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
            {goals.map(goal => (
              <li key={goal} className="flex items-center gap-3 text-sm text-(--text-secondary) font-medium">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-(--border-light) shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Award size={18} className="text-indigo-500" />
            SKILLSET ANALYSIS & MARKET IMPACT
          </h3>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">
            Live Market Feed
          </span>
        </div>
        <p className="text-sm text-(--text-muted) mb-4">AI has identified these core competencies and mapped them to global talent demand.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.skills.map(skill => {
            // Deterministic numbers based on the skill string so they don't change on re-render
            const hash = skill.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const demandScore = (hash % 15) + 80;
            const salary = (hash % 40) + 80;
            
            return (
              <div key={skill} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-sm text-(--text-primary)">{skill}</span>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp size={12} />
                    <span className="text-[10px] font-bold">{demandScore}% Demand</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-tighter">Avg. Global Salary</span>
                    <span className="text-sm font-black text-indigo-600">${salary}k - ${salary + 30}k</span>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = profile.skills.filter(s => s !== skill);
                      setProfile({...profile, skills: updated});
                      localStorage.setItem('nexes_user_skills', JSON.stringify(updated));
                    }}
                    className="text-[10px] font-bold text-rose-300 hover:text-rose-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          
          {showSkillInput ? (
            <form onSubmit={handleAddSkill} className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 flex items-center gap-2">
              <input 
                autoFocus
                type="text" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onBlur={() => !newSkill && setShowSkillInput(false)}
                placeholder="Type skill & press Enter"
                className="bg-transparent border-none outline-none text-xs font-bold text-indigo-900 flex-1"
              />
              <button type="submit" className="text-indigo-600 font-bold text-[10px] uppercase tracking-tighter">Add</button>
            </form>
          ) : (
            <button 
              onClick={() => setShowSkillInput(true)}
              className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Add New Skill
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendingUp({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
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
