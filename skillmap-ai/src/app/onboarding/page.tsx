'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Send } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

type Step = 'name' | 'status' | 'education_type' | 'college_tier' | 'college_details' | 'job_details' | 'resume' | 'study_goal' | 'role_select' | 'done';

interface Profile {
  name: string;
  status: 'Student' | 'Job' | '';
  educationType: 'School' | 'College' | '';
  collegeLevel: 'UG' | 'PG' | '';
  subjects: string;
  cgpa: string;
  semester: string;
  institution: string;
  jobRole: string;
  studyGoal: string;
  selectedRole: string;
}

const ROLES = [
  { 
    title: 'AI Agent Architect', 
    demand: 'Critical', 
    growth: '400%', 
    salary: '$180k+', 
    type: 'EMERGING',
    reason: 'Fits your Logic & Flow skills' 
  },
  { 
    title: 'LLM Ops Engineer', 
    demand: 'Very High', 
    growth: '250%', 
    salary: '$165k+', 
    type: 'EMERGING',
    reason: 'Leverages your Devops background'
  },
  { 
    title: 'RAG Developer', 
    demand: 'High', 
    growth: '180%', 
    salary: '$150k+', 
    type: 'EMERGING',
    reason: 'Matches your DB experience'
  },
  { 
    title: 'Prompt Engineer', 
    demand: 'Moderate', 
    growth: '80%', 
    salary: '$120k+', 
    type: 'STABLE',
    reason: 'Building on Writing skills'
  },
  { 
    title: 'AI Product Manager', 
    demand: 'High', 
    growth: '120%', 
    salary: '$170k+', 
    type: 'STABLE',
    reason: 'Uses your Management background'
  },
];

const LEVEL_OPTIONS = ['School', 'UG (College)', 'PG (Masters)', 'Working Professional'];

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm your Nexes AI mentor. What's your name?" },
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<Step>('name');
  const [profile, setProfile] = useState<Profile>({
    name: '', status: '', educationType: '', collegeLevel: '',
    subjects: '', cgpa: '', semester: '', institution: '',
    jobRole: '', studyGoal: '', selectedRole: '',
  });
  const [loading, setLoading] = useState(false);

  const addMessage = (msg: Message) => setMessages(prev => [...prev, msg]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    addMessage({ role: 'user', text });

    setTimeout(() => {
      if (step === 'name') {
        setProfile(p => ({ ...p, name: text }));
        addMessage({ role: 'ai', text: `Great to meet you, ${text.split(' ')[0]}! What are you doing now? Are you a Student or currently in a Job?` });
        setStep('status');
      } else if (step === 'status') {
        const status = text.toLowerCase().includes('job') ? 'Job' : 'Student';
        setProfile(p => ({ ...p, status }));
        if (status === 'Student') {
          addMessage({ role: 'ai', text: 'Are you in School or College?' });
          setStep('education_type');
        } else {
          addMessage({ role: 'ai', text: 'What is your current job role and company?' });
          setStep('job_details');
        }
      } else if (step === 'education_type') {
        const edu = text.toLowerCase().includes('college') ? 'College' : 'School';
        setProfile(p => ({ ...p, educationType: edu }));
        if (edu === 'College') {
          addMessage({ role: 'ai', text: 'Is it UG (Undergraduate) or PG (Postgraduate)?' });
          setStep('college_tier');
        } else {
          addMessage({ role: 'ai', text: 'Which school and grade are you in?' });
          setStep('college_details'); // Generic details for school
        }
      } else if (step === 'college_tier') {
        const level = text.toUpperCase().includes('PG') ? 'PG' : 'UG';
        setProfile(p => ({ ...p, collegeLevel: level }));
        addMessage({ role: 'ai', text: 'Please enter your Major Subjects, current CGPA, and your current Semester (e.g. CS, 8.5, 6th Sem).' });
        setStep('college_details');
      } else if (step === 'college_details' || step === 'job_details') {
        setProfile(p => ({ ...p, institution: text }));
        addMessage({ role: 'ai', text: 'Please upload your Resume (PDF or Doc) so I can analyze your latent skills.' });
        setStep('resume');
      } else if (step === 'resume') {
        addMessage({ role: 'ai', text: 'Resume processed! Based on your background, I recommend roles like AI Agent Architect or Data Engineer. But tell me, what do YOU want to study specifically?' });
        setStep('study_goal');
      } else if (step === 'study_goal') {
        setProfile(p => ({ ...p, studyGoal: text }));
        addMessage({ role: 'ai', text: "Got it! To finalize your roadmap, please select your target career role from the options below:" });
        setStep('role_select');
      } else if (step === 'role_select') {
        setProfile(p => ({ ...p, selectedRole: text }));
        addMessage({ role: 'ai', text: `Perfect! I've personalized your roadmap for a ${text} career. Redirecting you to your path now...` });
        setStep('done');
        handleComplete(text);
      }
    }, 600);
  };

  const handleComplete = async (details: string) => {
    setLoading(true);
    const email = localStorage.getItem('nexes_user_email') || `user_${Math.random().toString(36).slice(2)}@nexes.ai`;
    localStorage.setItem('nexes_user_name', profile.name);
    try {
      await supabase.from('profiles').upsert({
        email,
        full_name: profile.name,
        learner_level: profile.status,
        institution: details,
        last_onboarding_step: 3,
        metadata: profile, // Store all the new details in JSONB
      }, { onConflict: 'email' });

      setTimeout(() => {
        router.push(`/pathway?role=${encodeURIComponent(profile.selectedRole)}&email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 50);
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Onboarding</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Tell us about yourself so we can build your personalized roadmap.
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {(['name', 'level', 'details', 'done'] as Step[]).map((s, i) => (
          <div key={s} style={{
            height: '4px', flex: 1, borderRadius: '9999px',
            background: ['name', 'level', 'details', 'done'].indexOf(step) >= i
              ? 'var(--accent-blue)' : 'var(--border-light)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Chat container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Messages */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '380px', maxHeight: '420px', overflowY: 'auto' }}>
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'ai' && (
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Nexes — AI Mentor
                </p>
              )}
              <div className={msg.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}>
                {msg.text}
              </div>
            </div>
          ))}

          {step === 'status' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              {['Student', 'Job'].map(opt => (
                <button key={opt} onClick={() => handleQuickReply(opt)} style={quickReplyStyle}>{opt}</button>
              ))}
            </div>
          )}

          {step === 'education_type' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              {['School', 'College'].map(opt => (
                <button key={opt} onClick={() => handleQuickReply(opt)} style={quickReplyStyle}>{opt}</button>
              ))}
            </div>
          )}

          {step === 'college_tier' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              {['UG', 'PG'].map(opt => (
                <button key={opt} onClick={() => handleQuickReply(opt)} style={quickReplyStyle}>{opt}</button>
              ))}
            </div>
          )}
          {step === 'role_select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recommended for you (High Market Demand)
              </p>
              {ROLES.map(role => (
                <button 
                  key={role.title} 
                  onClick={() => handleQuickReply(role.title)} 
                  style={{
                    ...quickReplyStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    padding: '1.25rem',
                    borderRadius: '1.25rem',
                    textAlign: 'left',
                    border: role.type === 'EMERGING' ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                    background: role.type === 'EMERGING' ? 'rgba(37,99,235,0.03)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{role.title}</div>
                    <div style={{ 
                      fontSize: '0.6rem', 
                      fontWeight: 900, 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '0.4rem',
                      background: role.type === 'EMERGING' ? 'var(--accent-blue)' : 'var(--text-muted)',
                      color: 'white'
                    }}>
                      {role.type}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {role.reason}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Demand: {role.demand} • Growth: {role.growth}</div>
                    <div style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '0.85rem' }}>
                      {role.salary}
                    </div>
                  </div>
                </button>
              ))}
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(234, 88, 12, 0.05)', 
                borderRadius: '1rem',
                border: '1px dashed rgba(234, 88, 12, 0.3)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}>
                <div style={{ fontSize: '1.2rem' }}>⚠️</div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>Legacy Warning</p>
                  <p style={{ fontSize: '0.75rem', color: '#9a3412', lineHeight: 1.4 }}>
                    Standard &quot;Data Scientist&quot; and &quot;Fullstack Developer&quot; roles are becoming saturated. Nexes recommends transitioning to **AI-First** specializations above for 3x market leverage.
                  </p>
                </div>
              </div>
            </div>
          )}
          {step === 'resume' && (
            <div style={{ marginTop: '1rem' }}>
              <input 
                type="file" 
                id="resume-upload" 
                className="hidden" 
                onChange={() => handleQuickReply("Resume Attached")} 
              />
              <label 
                htmlFor="resume-upload"
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'var(--accent-blue)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
              >
                Choose Resume File
              </label>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {loading ? 'Building your roadmap...' : 'Redirecting to dashboard...'}
            </div>
          )}
        </div>

        {/* Input area */}
        {step !== 'done' && (
          <div style={{
            borderTop: '1px solid var(--border-light)',
            padding: '1rem 1.25rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              style={{
                flex: 1,
                border: '1px solid var(--border-light)',
                borderRadius: '0.5rem',
                padding: '0.65rem 1rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                background: 'var(--bg-main)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              className="btn-primary"
              onClick={handleSend}
              disabled={!input.trim()}
              style={{ opacity: !input.trim() ? 0.5 : 1, padding: '0.65rem 1.1rem' }}
            >
              <Send size={15} />
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const quickReplyStyle: React.CSSProperties = {
  padding: '0.4rem 0.9rem',
  border: '1px solid var(--border-color)',
  borderRadius: '9999px',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
};
