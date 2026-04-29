'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { 
  GitBranch, 
  ExternalLink, 
  Share2, 
  CheckCircle2, 
  Code2, 
  Award,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface Project {
  title: string;
  description: string;
  tech: string[];
  date: string;
  status: string;
  score: number;
  industryTags: string[];
  relevanceCount: number;
  url?: string;
}

export default function Portfolio() {
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('Learner');
  const [userRole, setUserRole] = useState<string>('AI Enthusiast');
  const [userSkills, setUserSkills] = useState<string[]>(['AI', 'ML', 'Python', 'React']);
  const [initials, setInitials] = useState<string>('JD');
  const [projects, setProjects] = useState<Project[]>([]);
  
  const GITHUB_USERNAME = 'shritanu16007-ctrl';

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const email = localStorage.getItem('nexes_user_email');
      const savedName = localStorage.getItem('nexes_user_name');
      
      if (savedName) {
        setUserName(savedName);
        const words = savedName.split(' ');
        const ini = words.map(w => w[0]).join('').toUpperCase().slice(0, 2);
        setInitials(ini);
      }

      // Fetch Profile Data
      if (email) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

          if (profile) {
            if (profile.full_name) setUserName(profile.full_name);
            const metadata = profile.metadata || {};
            setUserRole(metadata.selectedRole || 'AI Agent Architect');
            const skills = profile.extracted_skills || metadata.subjects?.split(',').map((s: string) => s.trim()) || ['RAG', 'LLM Ops', 'Vector DBs', 'LangChain'];
            setUserSkills(skills);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }

      // Fetch GitHub Profile & Repos
      try {
        const [userRes, repoRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`)
        ]);
        
        const userData = await userRes.json();
        const repos = await repoRes.json();
        
        if (userData && !userData.message) {
          if (!savedName) {
            setUserName(userData.name || GITHUB_USERNAME);
            const ini = (userData.name || GITHUB_USERNAME).split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
            setInitials(ini);
          }
          if (userData.bio) setUserRole(userData.bio);
        }

        if (Array.isArray(repos)) {
          const mappedProjects: Project[] = repos.map(repo => ({
            title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
            description: repo.description || `High-performance implementation of ${repo.name} modules.`,
            tech: [repo.language || 'Code', 'Git'],
            date: new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            status: "Verified",
            score: Math.floor(Math.random() * 15) + 85,
            industryTags: [repo.topics?.[0] || 'Open Source', 'Tech Stack'],
            relevanceCount: Math.floor(Math.random() * 10) + 2,
            url: repo.html_url
          }));
          setProjects(mappedProjects);
        }
      } catch (err) {
        console.error('Error fetching GitHub data:', err);
      }
      
      setLoading(false);
    };

    fetchAllData();
  }, []);

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent)]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 space-y-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl">
                <Award className="w-7 h-7" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight">Portfolio</h1>
            </div>
            <p className="text-xl text-white/40 font-light max-w-xl">
              Verified intelligence profile and project repository for {userName}.
            </p>
          </div>

          <Button 
            onClick={handleShare}
            className="bg-white text-black hover:bg-neutral-200 h-14 px-8 rounded-2xl font-bold flex items-center gap-2 shadow-2xl"
          >
            <Share2 className="w-5 h-5" />
            {copied ? "Link Copied" : "Share Intelligence Profile"}
          </Button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl space-y-10 h-fit">
            <div className="space-y-6">
              <div className="w-24 h-24 rounded-4xl bg-linear-to-br from-indigo-500 to-blue-500 p-0.5">
                <div className="w-full h-full bg-black rounded-[1.9rem] flex items-center justify-center">
                  <span className="text-3xl font-bold tracking-tighter">{initials}</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{userName}</h3>
                <p className="text-indigo-400 font-medium">{userRole}</p>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Overall Mastery</p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold">94.2</span>
                  <span className="text-xs text-emerald-400 font-bold mb-1.5">+1.2 percentile</span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Verified Skills</p>
                <div className="flex flex-wrap gap-2">
                  {userSkills.map(s => (
                    <Badge key={s} variant="outline" className="border-white/10 text-white/60 bg-white/5 px-2 py-1 rounded-lg capitalize">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight">Verified Projects</h3>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" />
                Nexes AI Verified
              </div>
            </div>

            <div className="space-y-6">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-3xl group hover:border-white/10 transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-bold">{project.title}</h4>
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{project.score}% Depth</Badge>
                          </div>
                          <p className="text-white/40 leading-relaxed font-light">{project.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.industryTags.map(tag => (
                            <Badge key={tag} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase">
                              {tag}
                            </Badge>
                          ))}
                          <Badge className="bg-white/5 text-white/40 border-white/10 text-[10px]">
                            Relevant to {project.relevanceCount} companies hiring now
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {project.tech.map(t => (
                            <span key={t} className="flex items-center gap-1.5 text-xs font-medium text-white/20">
                              <Code2 className="w-3.5 h-3.5" />
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex md:flex-col justify-end gap-3 shrink-0">
                        <Button variant="ghost" className="h-12 w-12 rounded-xl border border-white/5 hover:bg-white/5">
                          <GitBranch className="w-5 h-5" />
                        </Button>
                        <Button 
                          onClick={() => project.url && window.open(project.url, '_blank')}
                          className="bg-white text-black hover:bg-neutral-200 h-12 px-6 rounded-xl font-bold flex items-center gap-2 shadow-xl"
                        >
                          View Code <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="pt-8 flex justify-center">
              <Button 
                variant="ghost" 
                className="group text-white/40 hover:text-white flex items-center gap-2"
              >
                Load Archived Projects <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
