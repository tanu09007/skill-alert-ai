'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name || !email) return;
    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .upsert({ full_name: name, email, last_onboarding_step: 0 }, { onConflict: 'email' });
      localStorage.setItem('nexes_user_email', email);
    } catch {
      // continue regardless
    } finally {
      router.push(`/onboarding?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        {/* Brand */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            Nexes
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
            SkillAlert AI Intelligence
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            marginTop: '1rem', padding: '0.3rem 0.8rem',
            background: 'rgba(37,99,235,0.08)', borderRadius: '9999px',
            fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600,
          }}>
            <Sparkles size={12} /> AI-powered career roadmaps
          </div>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: '2rem' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Start your personalized journey
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem',
                border: '1px solid var(--border-color)', borderRadius: '0.5rem',
                fontSize: '0.9rem', color: 'var(--text-primary)',
                background: 'var(--bg-main)', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              style={{
                width: '100%', padding: '0.75rem 1rem',
                border: '1px solid var(--border-color)', borderRadius: '0.5rem',
                fontSize: '0.9rem', color: 'var(--text-primary)',
                background: 'var(--bg-main)', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleStart}
            disabled={loading || !name || !email}
            style={{
              width: '100%', justifyContent: 'center',
              opacity: loading || !name || !email ? 0.5 : 1,
              cursor: loading || !name || !email ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Setting up...' : 'Begin Onboarding'}
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Trust signals */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '1.5rem',
          marginTop: '1.5rem', flexWrap: 'wrap',
        }}>
          {['GitHub Trending', 'Arxiv Research', 'LinkedIn Intel'].map(s => (
            <span key={s} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
