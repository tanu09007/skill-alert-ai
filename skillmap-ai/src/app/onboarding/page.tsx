'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Send, Sparkles, Briefcase, TrendingUp, Building2, CheckCircle2, Award, BookOpen, ArrowRight } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

interface CollectedData {
  name: string | null;
  current_status: string | null;
  degree_or_job: string | null;
  experience_level: string | null;
  tech_stack: string | null;
  hours_per_day: number | null;
}

interface RoleSuggestion {
  role_title: string;
  category: 'already_in_market' | 'emerging' | 'related_stretch';
  why_this_role: string;
  top_skills_needed: string[];
  avg_salary_inr: string;
  hiring_companies: string[];
  time_to_ready: number;
  demand_trend: 'rising' | 'stable' | 'exploding';
}

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [collected, setCollected] = useState<CollectedData>({
    name: null,
    current_status: null,
    degree_or_job: null,
    experience_level: null,
    tech_stack: null,
    hours_per_day: null
  });
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roles, setRoles] = useState<RoleSuggestion[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial mount trigger
  useEffect(() => {
    fetchNextMessage([], collected, 0);
  }, []);

  const fetchNextMessage = async (currentMessages: Message[], currentCollected: CollectedData, currentStep: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          collected: currentCollected,
          step: currentStep
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch reply');
      }

      // Defensive fallback in case Gemini forgets to return 'collected'
      const newCollected = data.collected || currentCollected || {};
      
      setMessages((prev) => [...prev, { role: 'ai', content: data.reply || "I'm sorry, could you repeat that?" }]);
      setCollected(newCollected);
      
      // Calculate filled fields safely
      const filledCount = Object.values(newCollected).filter(v => v !== null && v !== '').length;
      setStep(Math.min(filledCount, 6));

      if (data.done || filledCount >= 6) {
        setDone(true);
        setTimeout(() => {
          fetchRoles(data.collected);
        }, 2000);
      }
    } catch (err) {
      console.error("Chat Error", err);
      setMessages((prev) => [...prev, { role: 'ai', content: "Sorry, I lost my connection for a moment. Could you repeat that?" }]);
    } finally {
      setLoading(false);
    }
  };

  const [learningMode, setLearningMode] = useState<'free' | 'paid' | null>(null);
  const [certificatePreference, setCertificatePreference] = useState<'free_cert' | 'paid_cert' | 'none' | null>(null);
  const [certificatePlatform, setCertificatePlatform] = useState<string>('');
  const [screen, setScreen] = useState<'chat' | 'roles' | 'preferences'>('chat');

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);

    await fetchNextMessage(newMessages, collected, step);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const fetchRoles = async (finalCollected: CollectedData) => {
    setScreen('roles');
    setRolesLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch('/api/suggest-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...finalCollected, user_id: user?.id })
      });
      const data = await res.json();
      if (data.roles) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error("Roles fetch error", error);
    } finally {
      setRolesLoading(false);
    }
  };

  const toggleRole = (roleTitle: string) => {
    if (selectedRoles.includes(roleTitle)) {
      setSelectedRoles(prev => prev.filter(r => r !== roleTitle));
    } else {
      setSelectedRoles(prev => [...prev, roleTitle]);
    }
  };

  const goToPreferences = () => {
    setScreen('preferences');
  };

  const buildRoadmap = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email || `user_${Math.random().toString(36).slice(2)}@nexes.ai`;
      
      const studentLevel = (parseFloat(collected.experience_level || '7') > 7.5) ? 'advanced' : (parseFloat(collected.experience_level || '7') < 6) ? 'beginner' : 'intermediate';

      const fullProfile = {
        ...collected,
        target_roles: selectedRoles,
        learning_mode: learningMode,
        certificate_preference: certificatePreference,
        certificate_platform: certificatePlatform,
        student_level: studentLevel,
        email: email
      };

      await supabase.from('profiles').upsert({
        id: user?.id,
        email: email,
        full_name: collected.name || 'User',
        metadata: fullProfile
      }, { onConflict: 'email' });
      
      localStorage.setItem('selected_roles', JSON.stringify(selectedRoles));
      localStorage.setItem('nexes_learning_mode', learningMode!);
      localStorage.setItem('nexes_cert_pref', certificatePreference!);
      
      router.push(`/pathway?email=${encodeURIComponent(email)}&role=${encodeURIComponent(selectedRoles[0] || 'AI Engineer')}`);
    } catch (e) {
      console.error("Save profile error", e);
      localStorage.setItem('selected_roles', JSON.stringify(selectedRoles));
      router.push(`/pathway`);
    }
  };

  // ---------------- Render Preferences Screen ----------------
  if (screen === 'preferences') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">One last thing... how do you want to learn?</h1>
            <p className="text-slate-500 text-lg">We'll tailor your roadmap based on your budget and certification goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Learning Mode Card: FREE */}
            <div 
              onClick={() => setLearningMode('free')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                learningMode === 'free' ? 'border-green-500 bg-green-50/50 ring-4 ring-green-100' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                  <BookOpen size={24} />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-green-500 text-white rounded-full uppercase">100% Free</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Free Learning</h3>
              <p className="text-slate-500 text-sm mb-4">Master skills using elite open-source resources and free platforms.</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">✅ MIT OpenCourseWare</li>
                <li className="flex items-center gap-2">✅ Harvard CS50 / YouTube</li>
                <li className="flex items-center gap-2">✅ Official Documentation</li>
                <li className="flex items-center gap-2">✅ Google Colab (Free GPU)</li>
              </ul>
              <div className="mt-6 p-3 bg-slate-100 rounded-lg text-xs font-medium text-slate-500">
                Best for: Students who want zero-cost mastery
              </div>
            </div>

            {/* Learning Mode Card: PAID */}
            <div 
              onClick={() => setLearningMode('paid')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                learningMode === 'paid' ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Award size={24} />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-blue-500 text-white rounded-full uppercase">Premium</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Paid Learning</h3>
              <p className="text-slate-500 text-sm mb-4">Structured courses with professional certificates and mentorship.</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">🚀 Udemy / Coursera Specialist</li>
                <li className="flex items-center gap-2">🚀 LinkedIn Learning / Pluralsight</li>
                <li className="flex items-center gap-2">🚀 Exam Voucher Discounts</li>
                <li className="flex items-center gap-2">🚀 Industry-Standard Certificates</li>
              </ul>
              <div className="mt-6 p-3 bg-slate-100 rounded-lg text-xs font-medium text-slate-500">
                Best for: Fast-trackers seeking credentials
              </div>
            </div>
          </div>

          {/* Certificate Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={24} /> 
              Are you aiming for a specific certification?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button 
                onClick={() => setCertificatePreference('free_cert')}
                className={`p-4 rounded-xl border-2 transition-all font-medium ${
                  certificatePreference === 'free_cert' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                }`}
              >
                Yes, Free Certs Only
              </button>
              <button 
                onClick={() => setCertificatePreference('paid_cert')}
                className={`p-4 rounded-xl border-2 transition-all font-medium ${
                  certificatePreference === 'paid_cert' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                }`}
              >
                Yes, Industry Paid Certs
              </button>
              <button 
                onClick={() => setCertificatePreference('none')}
                className={`p-4 rounded-xl border-2 transition-all font-medium ${
                  certificatePreference === 'none' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                }`}
              >
                No, Just Knowledge
              </button>
            </div>

            {certificatePreference && certificatePreference !== 'none' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-semibold text-slate-700">Which platform or vendor? (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. AWS, Google Cloud, Meta, freeCodeCamp..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={certificatePlatform}
                  onChange={(e) => setCertificatePlatform(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => setScreen('roles')}
              className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
            >
              ← Back
            </button>
            <button 
              onClick={buildRoadmap}
              disabled={!learningMode || !certificatePreference}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              Generate AI Roadmap <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Render Roles Screen ----------------
  if (screen === 'roles') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900">
        <div className="max-w-4xl w-full pb-32">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Based on your profile, here are your best career paths</h1>
            <p className="text-slate-500 text-lg">Choose roles you want to target — this shapes your entire roadmap</p>
          </div>

          {rolesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-slate-500 font-medium animate-pulse">Analyzing your profile & finding the best roles...</p>
            </div>
          ) : (
            <div className="space-y-12">
              <section>
                <h2 className="text-lg font-bold text-blue-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase size={20} /> Already Hiring Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.filter(r => r.category === 'already_in_market').map(role => (
                    <RoleCard key={role.role_title} role={role} selected={selectedRoles.includes(role.role_title)} onToggle={() => toggleRole(role.role_title)} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={20} /> Emerging in 2025
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.filter(r => r.category === 'emerging').map(role => (
                    <RoleCard key={role.role_title} role={role} selected={selectedRoles.includes(role.role_title)} onToggle={() => toggleRole(role.role_title)} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-amber-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp size={20} /> Worth Exploring
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.filter(r => r.category === 'related_stretch').map(role => (
                    <RoleCard key={role.role_title} role={role} selected={selectedRoles.includes(role.role_title)} onToggle={() => toggleRole(role.role_title)} />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        {!rolesLoading && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="font-medium text-slate-700">
                <span className="text-blue-600 font-bold">{selectedRoles.length}</span> roles selected to shape your roadmap
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={goToPreferences}
                  disabled={selectedRoles.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------- Render Chat Screen ----------------
  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans relative">
      
      {/* Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-10 shadow-sm flex flex-col items-center">
        <div className="font-bold text-slate-800 mb-2">SkillGap Mentor Setup</div>
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-10 sm:w-16 rounded-full transition-colors duration-500 ${
                i < (screen === 'chat' ? step : screen === 'roles' ? 4 : 5) ? 'bg-green-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Done Overlay */}
      {done && screen === 'chat' && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl font-bold text-slate-800">Setting up your plan...</div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pt-24 pb-24 px-4 md:px-0">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
              {msg.role === 'ai' && (
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 shrink-0 text-xl border border-blue-200">
                  🤖
                </div>
              )}
              <div 
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  msg.role === 'ai' 
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none' 
                    : 'bg-blue-600 text-white shadow-sm rounded-tr-none'
                }`}
                style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && !done && (
            <div className="flex justify-start items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 shrink-0 text-xl border border-blue-200">
                🤖
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || done}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || done}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 flex items-center justify-center disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for Role Card
function RoleCard({ role, selected, onToggle }: { role: RoleSuggestion, selected: boolean, onToggle: () => void }) {
  const trendColors = {
    exploding: 'bg-green-100 text-green-700 border-green-200',
    rising: 'bg-blue-100 text-blue-700 border-blue-200',
    stable: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div 
      onClick={onToggle}
      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
        selected ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 text-blue-500">
          <CheckCircle2 size={24} className="fill-blue-100" />
        </div>
      )}
      
      <div className="flex flex-col gap-3">
        <div className="pr-8">
          <h3 className="font-bold text-lg text-slate-900 leading-tight">{role.role_title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border capitalize ${trendColors[role.demand_trend] || trendColors.stable}`}>
              {role.demand_trend}
            </span>
            <span className="text-green-600 font-bold text-sm">{role.avg_salary_inr}</span>
          </div>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {role.why_this_role}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {role.top_skills_needed.map(skill => (
            <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 mt-2">
          <div className="text-xs text-slate-500 font-medium">
            <span className="text-slate-700">Ready in:</span> {role.time_to_ready} weeks
          </div>
          <div className="flex items-center gap-1">
            <Building2 size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500 truncate">
              {role.hiring_companies.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
