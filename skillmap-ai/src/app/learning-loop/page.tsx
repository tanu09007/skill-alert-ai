'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  Sparkles, 
  Zap, 
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LearningLoop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'Vector Databases';

  const [videoId, setVideoId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('video'); // video, flipcards, quiz
  const [flipped, setFlipped] = useState<boolean>(false);
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [synthesisInput, setSynthesisInput] = useState<string>('');
  const [synthesisResult, setSynthesisResult] = useState<any>(null);
  const [explanationStyle, setExplanationStyle] = useState<string>('ELI5');

  useEffect(() => {
    const fetchVideo = async () => {
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!apiKey) return;

      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(topic + " course tutorial")}&type=video&key=${apiKey}`
        );
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setVideoId(data.items[0].id.videoId);
        }
      } catch (err) {
        console.error("YouTube error:", err);
      }
    };
    fetchVideo();
  }, [topic]);

  const flipcards = [
    { q: `What is ${topic}?`, a: `A core concept in modern architecture that allows for semantic reasoning and high-dimensional data processing.` },
    { q: "Why is it relevant now?", a: "Market signals show a 40% spike in demand for this specific mastery over the last quarter." },
    { q: "What's the first step?", a: "Implementing a basic prototype and validating the intelligence output against a baseline dataset." }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 blur-[120px]" />
      </div>

      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="group flex items-center gap-2 text-white/40 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Exit Deep Focus</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-xs font-bold">Session XP: +450</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-8 pb-24 space-y-12">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{topic}</h1>
          <div className="flex justify-center gap-4">
            {['video', 'flipcards', 'synthesis', 'quiz'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <button 
              onClick={() => router.push(`/assessment?topic=${encodeURIComponent(topic)}`)}
              className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 flex items-center gap-1"
            >
              I already know this <ChevronRight size={12} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="aspect-video w-full bg-neutral-900 rounded-[2.5rem] border border-white/10 overflow-hidden relative"
            >
              {videoId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'flipcards' && (
            <motion.div
              key="flipcards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-12"
            >
              <div
                className="relative w-full max-w-xl aspect-4/3 cursor-pointer perspective-1000"
                onClick={() => setFlipped(!flipped)}
              >
                <motion.div
                  className="w-full h-full relative preserve-3d transition-transform duration-700"
                  animate={{ rotateY: flipped ? 180 : 0 }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 bg-neutral-900 border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl">
                    <p className="text-[10px] uppercase tracking-widest text-white/20 font-black mb-8">Concept Phase</p>
                    <h3 className="text-3xl font-bold leading-tight">{flipcards[currentCard].q}</h3>
                    <p className="mt-8 text-white/20 text-xs font-medium uppercase tracking-widest">Tap to reveal Intelligence</p>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 bg-white text-black rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl rotate-y-180">
                    <p className="text-[10px] uppercase tracking-widest text-black/40 font-black mb-8">Intelligence Summary</p>
                    <h3 className="text-2xl font-semibold leading-relaxed">{flipcards[currentCard].a}</h3>
                    <p className="mt-8 text-black/40 text-xs font-medium uppercase tracking-widest">Tap to return</p>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center gap-8">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFlipped(false);
                    setCurrentCard((prev) => (prev - 1 + flipcards.length) % flipcards.length);
                  }}
                  className="w-14 h-14 rounded-2xl border border-white/10 text-white/40 hover:text-white"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <div className="text-sm font-bold tracking-widest text-white/20">
                  {currentCard + 1} / {flipcards.length}
                </div>
                <Button
                  onClick={() => {
                    setFlipped(false);
                    setCurrentCard((prev) => (prev + 1) % flipcards.length);
                  }}
                  className="w-14 h-14 rounded-2xl bg-white text-black hover:bg-neutral-200"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'synthesis' && (
            <motion.div
              key="synthesis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              {!synthesisResult ? (
                <div className="bg-neutral-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                   <div className="space-y-4">
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Sparkles className="text-indigo-500" />
                        In your own words, what did you understand about {topic}?
                      </h3>
                      <p className="text-white/40 text-sm">Don&apos;t worry about being technical. Just explain it as you see it.</p>
                   </div>
                   
                   <div className="relative">
                     <textarea 
                        value={synthesisInput}
                        onChange={(e) => setSynthesisInput(e.target.value)}
                        placeholder="Type or use voice to explain..."
                        className="w-full h-48 bg-black/50 border border-white/10 rounded-2xl p-6 text-lg focus:border-indigo-500 outline-none transition-all resize-none"
                     />
                     <div className="absolute bottom-4 right-4 flex gap-2">
                        <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-white/40">
                          🎙️
                        </button>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Select Explanation Style</p>
                     <div className="flex gap-2">
                        {['ELI5', 'Technical', 'Real Examples'].map(s => (
                          <button 
                            key={s}
                            onClick={() => setExplanationStyle(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${explanationStyle === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/40'}`}
                          >
                            {s}
                          </button>
                        ))}
                     </div>
                   </div>

                   <Button 
                    disabled={!synthesisInput}
                    onClick={() => setSynthesisResult({})}
                    className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-2xl text-xl font-bold"
                   >
                    Analyse My Synthesis
                   </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 space-y-4">
                      <h4 className="text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle2 size={18} /> WHAT YOU GOT RIGHT
                      </h4>
                      <p className="text-sm text-emerald-100/70 leading-relaxed">
                        You correctly identified that {topic} is non-linear and relies on high-dimensional vectors. Your intuition about the &apos;search speed&apos; trade-off is spot on.
                      </p>
                    </div>
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8 space-y-4">
                      <h4 className="text-rose-400 font-bold flex items-center gap-2">
                        <AlertCircle size={18} /> THE GAP
                      </h4>
                      <p className="text-sm text-rose-100/70 leading-relaxed">
                        You missed the &apos;clustering&apos; effect. While speed is key, how the vectors are grouped determines the actual intelligence of the retrieval.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white text-black rounded-3xl p-10 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-sm uppercase tracking-widest text-black/40">Explained YOUR way ({explanationStyle})</h4>
                      <div className="text-indigo-600 font-bold text-xs">AI Personalized</div>
                    </div>
                    <p className="text-xl font-medium leading-relaxed">
                      Imagine your data is like a massive library. {topic} isn&apos;t just about finding the book, it&apos;s about the librarian knowing that if you like &apos;cats&apos;, you might also like &apos;tigers&apos; because they belong in the same section of the library.
                    </p>
                    <div className="pt-4 flex gap-4">
                       <Button 
                        onClick={() => setSynthesisResult(null)}
                        variant="outline" 
                        className="border-black/10 rounded-xl font-bold"
                       >
                         Try Again
                       </Button>
                       <Button 
                        onClick={() => setActiveTab('quiz')}
                        className="bg-black text-white hover:bg-neutral-800 rounded-xl font-bold flex-1"
                       >
                         Validate with Quiz
                       </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              {!quizStarted ? (
                <div className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-12 text-center space-y-8 backdrop-blur-3xl">
                  <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl mx-auto flex items-center justify-center">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold">Baseline Assessment</h3>
                    <p className="text-white/40 font-light">
                      5 Questions to verify your fundamental grasp before proceeding to the Synthesis Phase.
                    </p>
                  </div>
                  <Button
                    onClick={() => setQuizStarted(true)}
                    className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-2xl text-xl font-bold"
                  >
                    Start Baseline
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">Question 1 of 5</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-1 w-8 rounded-full ${i === 1 ? 'bg-white' : 'bg-white/10'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                    <h3 className="text-2xl font-bold">What is the primary trade-off in HNSW search?</h3>
                    <div className="space-y-4">
                      {[
                        "Memory vs Search Speed",
                        "Latency vs Accuracy",
                        "Cost vs Reliability",
                        "Write Speed vs Read Speed"
                      ].map((opt, i) => (
                        <button
                          key={i}
                          className="w-full p-6 text-left bg-white/5 border border-white/5 rounded-2xl hover:border-white/20 hover:bg-white/10 transition-all font-medium flex items-center justify-between group"
                        >
                          {opt}
                          <div className="w-6 h-6 border-2 border-white/10 rounded-full group-hover:border-white/30 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Next Objective</p>
              <p className="text-sm font-medium">Synthesis Phase: Groq Analysis</p>
            </div>
          </div>

          <Button
            onClick={() => router.push(`/assessment?topic=${encodeURIComponent(topic)}`)}
            className="h-16 px-10 bg-white text-black hover:bg-neutral-200 rounded-2xl text-lg font-bold group"
          >
            Advance to Assessment <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </footer>
      </main>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
