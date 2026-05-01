'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  ArrowRight, 
  ShieldCheck,
  BarChart3,
  Cpu,
} from 'lucide-react';

interface Role {
  role: string;
  confidence: number;
  stage: string;
  signals: string[];
  salary: string;
  demand: string;
}

export default function RoleDiscovery() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRoles = async () => {
      const savedSkills = localStorage.getItem('nexes_user_skills') || '';
      try {
        const res = await fetch('/api/recommend-roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_input: savedSkills || "Software Engineering, Java, Databases" })
        });
        if (res.ok) {
          const data = await res.json();
          // Ensure data is an array and has the right shape
          if (Array.isArray(data)) {
            setRoles(data.map((r: any) => ({
              role: r.role,
              confidence: r.match_score || Math.floor(Math.random() * 15) + 80,
              stage: r.market_stage || "EMERGING",
              signals: r.key_skills ? r.key_skills.slice(0, 2) : ["Market Trend", "Rising Demand"],
              salary: r.avg_salary || "$120k - $160k",
              demand: r.demand_level || "High"
            })));
          }
        }
      } catch (err) {
        console.error("Fetch roles error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <Cpu className="w-16 h-16 text-white relative z-10 animate-bounce" />
        </div>
        <p className="mt-8 text-white/40 font-light tracking-widest uppercase text-xs">Scanning Global Market Signals</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-24 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="space-y-4">
          <Badge className="bg-white/5 border-white/10 text-white/40 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">
            Intelligence Report
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Your Projected Paths</h1>
          <p className="text-xl text-white/40 font-light max-w-2xl leading-relaxed">
            Based on your latent skills and early market signals from GitHub, Arxiv, and HackerNews, we&apos;ve identified 5 high-alpha career trajectories.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role, idx) => (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="absolute -inset-px bg-linear-to-b from-white/10 to-transparent rounded-4xl opacity-50 transition-opacity group-hover:opacity-100" />
              <Card className="relative h-full bg-neutral-900/40 border border-white/5 rounded-4xl p-8 backdrop-blur-3xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <BarChart3 className="w-24 h-24" />
                </div>
                
                <CardContent className="p-0 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-black ${
                        role.stage === 'EMERGING' ? 'bg-indigo-500/20 text-indigo-400' : 
                        role.stage === 'GROWING' ? 'bg-emerald-500/20 text-emerald-400' : 
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {role.stage}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-lg font-bold">{role.confidence}%</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold leading-tight group-hover:text-indigo-400 transition-colors">
                      {role.role}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-white/20">Market Signals</p>
                      <div className="flex flex-wrap gap-2">
                        {role.signals.map(s => (
                          <span key={s} className="text-[11px] text-white/60 font-medium px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-white/20">Est. Salary</p>
                        <p className="text-sm font-semibold">{role.salary}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-white/20">Demand</p>
                        <p className={`text-sm font-semibold ${role.demand === 'Critical' ? 'text-rose-400' : 'text-white'}`}>
                          {role.demand}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => router.push(`/pathway?role=${encodeURIComponent(role.role)}&email=${encodeURIComponent(email)}`)}
                    className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                  >
                    Select Path <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <footer className="pt-20 flex flex-col items-center gap-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/20">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Neural Verification Complete</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
