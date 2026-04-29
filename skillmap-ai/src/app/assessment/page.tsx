'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  HelpCircle, 
  Trophy, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phase = searchParams.get('phase') || '1';
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      text: "What is the primary advantage of a Vector Database in RAG architectures?",
      options: ["Standard CRUD operations", "Semantic similarity search", "Lower storage cost", "ACID compliance"],
      correct: 1
    },
    {
      id: 2,
      text: "Which component is responsible for converting text into high-dimensional vectors?",
      options: ["The Parser", "The Orchestrator", "The Embedding Model", "The Tokenizer"],
      correct: 2
    },
    // Mocking 10 questions...
  ];

  const handleNext = () => {
    if (selectedOption === questions[currentIdx].correct) {
      setScore(prev => prev + 1);
    }
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200">
          <Trophy size={48} className="text-white" />
        </div>
        <h2 className="text-4xl font-black text-(--text-primary) mb-2">Phase {phase} Complete!</h2>
        <p className="text-xl text-(--text-secondary) mb-8">You scored {score}/{questions.length} • Mastered 92% Core Logic</p>
        
        <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 max-w-xl w-full space-y-6 mb-12">
          <h4 className="font-bold flex items-center justify-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            GRADUATION STEP
          </h4>
          <p className="text-indigo-900 font-medium">You&apos;ve cleared the foundation. Your market value just increased by estimated 12%.</p>
          <div className="space-y-4">
            <p className="text-sm font-bold text-indigo-400 uppercase">What do you want to learn next?</p>
            <div className="grid grid-cols-2 gap-3">
              {['Multi-Agent Swarms', 'Deep RAG Optimization', 'Voice AI Agents', 'Custom LLM Training'].map(opt => (
                <button key={opt} className="p-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push('/pathway')}
          className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-xl"
        >
          Return to Roadmap <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <Zap size={12} />
            Skill Assessment • Phase {phase}
          </div>
          <h1 className="text-3xl font-black text-(--text-primary)">Topic Verification</h1>
        </div>
        <div className="text-sm font-bold text-(--text-muted)">
          Question {currentIdx + 1} of {questions.length}
        </div>
      </header>

      <div className="progress-bar h-2">
        <div 
          className="progress-bar-fill bg-indigo-600 h-full transition-all duration-500" 
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-(--text-primary) leading-snug">
          {currentQuestion.text}
        </h2>

        <div className="grid gap-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`p-6 rounded-2xl border-2 text-left transition-all font-medium ${
                selectedOption === idx 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md translate-x-2' 
                  : 'border-(--border-light) bg-white text-(--text-secondary) hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  selectedOption === idx ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-6 flex justify-between items-center">
          <button className="text-(--text-muted) font-bold text-sm flex items-center gap-2 hover:text-(--text-primary)">
            <HelpCircle size={18} /> Need a hint?
          </button>
          <button
            disabled={selectedOption === null}
            onClick={handleNext}
            className={`px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              selectedOption !== null 
                ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' 
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {currentIdx === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
