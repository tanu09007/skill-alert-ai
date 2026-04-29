'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface RoadmapStep {
  step: number;
  topic: string;
  duration_days: number;
  relevance_score: number;
  type: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';

  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(!!email);
  const role = 'AI Agent Architect';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        const roadmapRes = await fetch('http://localhost:8000/api/generate-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'AI Agent Architect',
            current_skills: profile?.extracted_skills || ['React', 'Python'],
          }),
        });
        const roadmapJson = await roadmapRes.json();
        setRoadmap(roadmapJson.roadmap || []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchData();
  }, [email]);

  const recentActivity: any[] = [];

  const marketSignals = [
    "HackerNews: OpenAI releases GPT-4o mini, disruption in mid-tier LLMs",
    "Market Alert: NVIDIA H200 demand spikes by 40% in Q3",
    "HackerNews: LangChain adds native support for Multi-Agent supervisor",
    "Tech Trend: Vector Database market to reach $10B by 2026",
  ];

  const deadlines = [
    { label: 'Linked List project', tag: 'Due today', tagColor: '#dc2626', tagBg: 'rgba(220,38,38,0.1)', days: null },
    { label: 'Tree traversal assignment', tag: null, days: 2 },
    { label: 'Python OOP mini project', tag: null, days: 5 },
  ];



  const todayTopic = roadmap[0]?.topic || 'Vector Databases — Deep Dive';

  return (
    <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      {/* HackerNews Ticker */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '0.75rem',
        padding: '0.6rem 1rem',
        marginBottom: '1.5rem',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          background: 'var(--accent-blue)',
          color: 'white',
          fontSize: '0.65rem',
          fontWeight: 800,
          padding: '0.2rem 0.5rem',
          borderRadius: '0.3rem',
          textTransform: 'uppercase',
        }}>
          Live Market Signals
        </div>
        <div style={{
          display: 'inline-block',
          animation: 'marquee 30s linear infinite',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          fontWeight: 500,
        }}>
          {marketSignals.join(' • ')} • {marketSignals.join(' • ')}
        </div>
      </div>

      {/* Smart Intelligence Notification */}
      <div style={{
        background: 'rgba(22, 163, 74, 0.08)',
        border: '1px solid rgba(22, 163, 74, 0.2)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--accent-green)' }}>⚡</div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-green)' }}>
            PACE ALERT: You are <span style={{ textDecoration: 'underline' }}>2 days ahead</span> of your AI Agent Architect roadmap. Keep it up!
          </p>
        </div>
        <button style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)', background: 'none', border: 'none', cursor: 'pointer' }}>
          View Schedule
        </button>
      </div>

      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Good morning 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
          Week 3 of your {role} roadmap · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>



      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { value: '🔥 0', label: 'Day streak', color: '#ea580c' },
          { value: '0%', label: 'Completion', color: 'var(--accent-blue)' },
          { value: '60', label: 'Days to Complete', color: 'var(--accent-blue)' },
          { value: '0.0', label: 'Intelligence Score', color: 'var(--accent-green)' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Today's Focus */}
        <div className="card card-p">
          <p className="section-label">Today&apos;s Focus</p>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {todayTopic}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span className="badge badge-blue">Week 3 · Day 2</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <Clock size={12} /> 45 mins
            </span>
            <span className="badge" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)' }}>
              Theory + Practice
            </span>
          </div>
          <button
            className="btn-outline"
            onClick={() => router.push(`/learning-loop?topic=${encodeURIComponent(todayTopic)}`)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Start Learning <ChevronRight size={14} />
          </button>
        </div>

        {/* Weekly Projects */}
        <div className="card card-p">
          <p className="section-label">Weekly Projects</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Mastery</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)' }}>0%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', background: 'var(--accent-blue)', borderRadius: '4px' }} />
            </div>
            {[
              { label: 'Level 1: Semantic Search Engine', diff: 'EASY', status: 'TO START', tag: 'FinTech Standard' },
              { label: 'Level 2: Multi-Agent Orchestrator', diff: 'MEDIUM', status: 'LOCKED', tag: 'Big Tech Core' },
              { label: 'Level 3: Custom LLM Evaluator', diff: 'ADVANCED', status: 'LOCKED', tag: 'Enterprise AI' },
            ].map((p) => (
              <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.label}</p>
                    <span style={{ fontSize: '0.55rem', fontWeight: 900, padding: '0.1rem 0.3rem', background: 'var(--bg-main)', color: 'var(--text-muted)', borderRadius: '0.2rem' }}>{p.tag}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: p.diff === 'EASY' ? 'var(--accent-green)' : p.diff === 'MEDIUM' ? 'var(--accent-orange)' : 'var(--text-muted)' }}>{p.diff}</span>
                </div>
                <span className="badge" style={{ 
                  background: p.status === 'COMPLETED' ? 'rgba(22,163,74,0.1)' : p.status === 'ONGOING' ? 'rgba(37,99,235,0.1)' : 'rgba(0,0,0,0.05)',
                  color: p.status === 'COMPLETED' ? 'var(--accent-green)' : p.status === 'ONGOING' ? 'var(--accent-blue)' : 'var(--text-muted)'
                }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {/* Daily Speed Meter */}
        <div className="card card-p">
          <p className="section-label">Learning Velocity</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative', paddingTop: '1rem' }}>
            {/* Speed Meter SVG */}
            <svg width="200" height="120" viewBox="0 0 200 120">
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--bg-main)" strokeWidth="12" strokeLinecap="round" />
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--accent-blue)" strokeWidth="12" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.1)} style={{ transition: 'stroke-dashoffset 1s ease' }} />
              <text x="100" y="90" textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--text-primary)">0%</text>
              <text x="100" y="110" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-muted)" style={{ textTransform: 'uppercase' }}>Velocity</text>
            </svg>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              Pace: <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>Starting Up</span>
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card card-p">
          <p className="section-label">Recent Activity</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {recentActivity.length > 0 ? recentActivity.map((a) => (
              <div key={a.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', width: '100%' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: `${a.color}18`, color: a.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: '1px',
                }}>
                  {a.icon}
                </span>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{a.label}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{a.meta}</p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', opacity: 0.3 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No activity yet</p>
                <p style={{ fontSize: '0.7rem' }}>Begin a session to track progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Alex's Tip */}
        <div className="card card-p">
          <p className="section-label">Nexes AI Tip for Today</p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '0.5rem',
              background: 'var(--bg-main)', border: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>
              🤖
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Before building your first AI agent, map out the tool-calling flow on paper first. Your last 2 projects stalled at the orchestration layer — understanding state transitions will unblock you.
            </p>
          </div>

          {/* Quick roadmap preview */}
          {roadmap.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <p className="section-label">Your Roadmap</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {roadmap.slice(0, 3).map((step) => (
                  <div key={step.step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={13} color="var(--accent-green)" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{step.topic}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{step.duration_days}d</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emerging Role Pulse */}
        <div className="card card-p" style={{ 
          background: 'linear-gradient(135deg, #2563eb, #1e40af)', 
          border: 'none', 
          color: 'white' 
        }}>
          <p className="section-label" style={{ color: 'rgba(255,255,255,0.6)' }}>EMERGING ROLE PULSE</p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem' }}>⚡</div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Agentic UX Designer</h3>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>New Market Entry • Critical Demand</p>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.5, opacity: 0.9, marginBottom: '1rem' }}>
            A new niche has opened for designers who can map out non-linear agent behaviors. Companies like OpenAI and Anthropic are hiring for this now.
          </p>
          <button style={{ 
            width: '100%', 
            padding: '0.6rem', 
            background: 'white', 
            color: '#1e40af', 
            borderRadius: '0.5rem', 
            fontSize: '0.75rem', 
            fontWeight: 800,
            border: 'none'
          }}>
            Explore New Roadmap
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Loading roadmap from AI...
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ color: 'var(--text-secondary)', paddingTop: '4rem', textAlign: 'center' }}>
        Loading dashboard...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
