'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, ArrowRight, PlayCircle, RefreshCw } from 'lucide-react';

type Question = {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  question: string;
  options: string[];
  correct_option: number;
  correct_answer: string;
  explanation: string;
  misconception: string;
  where_thinking_breaks: string;
  followup_hint: string;
  simpler_explanation: string;
};

type AssessmentState = 'loading' | 'testing' | 'feedback' | 'checking_understanding' | 'summary';

export default function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'React Basics';
  const subtopic = searchParams.get('subtopic') || 'Hooks';
  const isFinalTest = searchParams.get('final') === 'true';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  
  const [state, setState] = useState<AssessmentState>('loading');
  const [score, setScore] = useState(0);

  // Check Understanding State
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [freshExplanation, setFreshExplanation] = useState<string | null>(null);
  const [suggestRewatch, setSuggestRewatch] = useState(false);
  const [prefOptions, setPrefOptions] = useState<string[]>([]);
  const [askPreference, setAskPreference] = useState(false);
  const [checkingLoading, setCheckingLoading] = useState(false);

  // Summary State
  const [evalResult, setEvalResult] = useState<any>(null);

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    setState('loading');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const endpoint = isFinalTest ? '/api/final-phase-test' : '/api/generate-assessment';
      
      const payload = isFinalTest 
        ? { user_id: user?.id, phase: 1, topics_covered: [topic, subtopic], preferred_language: 'JavaScript' }
        : { user_id: user?.id, topic, subtopic, phase: 1, preferred_language: 'JavaScript', weak_topics: [] };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setQuestions(data.questions);
      setState('testing');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === questions[currentIdx].correct_option;
    if (isCorrect) setScore(s => s + 1);
    
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    
    // Reset understanding state
    setAttemptNumber(1);
    setFreshExplanation(null);
    setSuggestRewatch(false);
    setAskPreference(false);
    
    setState('feedback');
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(c => c + 1);
      setSelectedOption(null);
      setState('testing');
    } else {
      // Finish Assessment
      setState('loading');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const res = await fetch('/api/evaluate-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user?.id,
            session_id: 'sess_' + Date.now(),
            topic,
            subtopic,
            phase: 1,
            questions,
            student_answers: answers,
            is_final_test: isFinalTest
          })
        });
        const data = await res.json();
        setEvalResult(data);
        setState('summary');
      } catch (err) {
        console.error(err);
        setState('summary');
      }
    }
  };

  const handleStillDontUnderstand = async (preference?: string) => {
    setCheckingLoading(true);
    if (!preference) {
      // First click
      setState('checking_understanding');
    }
    
    try {
      const q = questions[currentIdx];
      const res = await fetch('/api/check-understanding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          explanation_given: freshExplanation || q.explanation,
          student_response: preference || "I still don't get it",
          attempt_number: attemptNumber
        })
      });
      const data = await res.json();
      
      if (data.ask_preference && !preference) {
        setAskPreference(true);
        setPrefOptions(data.preference_options);
      } else if (data.fresh_explanation) {
        setFreshExplanation(data.fresh_explanation);
        setAskPreference(false);
        setSuggestRewatch(data.suggest_video_rewatch);
        setAttemptNumber(n => n + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingLoading(false);
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  if (state === 'testing') {
    const q = questions[currentIdx];
    const diffColor = q.difficulty === 'easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
    
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center text-slate-900">
        <div className="max-w-3xl w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="text-sm font-bold text-slate-500 tracking-widest uppercase">Question {currentIdx + 1} of {questions.length}</div>
            <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${diffColor}`}>{q.difficulty}</div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full mb-10 overflow-hidden">
            <div className="bg-blue-600 h-full transition-all" style={{ width: (((currentIdx) / questions.length) * 100) + '%' }}></div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-snug">{q.question}</h2>

          <div className="space-y-3 mb-10">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedOption(i)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${selectedOption === i ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${selectedOption === i ? 'border-blue-600 text-blue-600' : 'border-slate-300 text-slate-400'}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-slate-700 font-medium pt-0.5">{opt}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all"
            >
              Submit Answer <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'feedback' || state === 'checking_understanding') {
    const q = questions[currentIdx];
    const isCorrect = selectedOption === q.correct_option;

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center text-slate-900">
        <div className="max-w-3xl w-full">
          {isCorrect ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-200 text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <div className="inline-block bg-green-100 text-green-700 font-bold px-4 py-1 rounded-full mb-6 text-sm">+1 Score</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Correct!</h2>
              <p className="text-slate-600 mb-8">{q.explanation}</p>
              <button onClick={handleNext} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 mx-auto">
                Next Question <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6 text-red-600">
                <XCircle className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Incorrect</h2>
              </div>
              
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">You answered:</div>
                <div className="text-red-600 font-medium mb-4 line-through">{q.options[selectedOption!]}</div>
                <div className="text-sm text-slate-500 mb-1">Correct answer:</div>
                <div className="text-green-600 font-bold">{q.correct_answer || q.options[q.correct_option]}</div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="animate-in fade-in delay-150 fill-mode-both">
                  <div className="font-bold text-slate-700 mb-1">Your thinking:</div>
                  <p className="text-slate-600">{q.where_thinking_breaks}</p>
                </div>
                
                <div className="animate-in fade-in delay-300 fill-mode-both">
                  <div className="font-bold text-amber-700 mb-1">The Misconception:</div>
                  <p className="text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">{q.misconception}</p>
                </div>

                <div className="animate-in fade-in delay-500 fill-mode-both">
                  <div className="font-bold text-slate-700 mb-1">Explanation:</div>
                  <p className="text-slate-600">{freshExplanation || q.explanation}</p>
                </div>

                <div className="animate-in fade-in delay-700 fill-mode-both">
                  <div className="font-bold text-blue-700 mb-1">Follow-up:</div>
                  <p className="text-blue-600 italic">{q.followup_hint}</p>
                </div>
              </div>

              {state === 'checking_understanding' && askPreference ? (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="font-bold text-blue-900 mb-4">How would you like me to explain this?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {prefOptions.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleStillDontUnderstand(opt)}
                        disabled={checkingLoading}
                        className="p-3 text-sm bg-white border border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-sm text-blue-800 font-medium transition-all text-left"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : suggestRewatch ? (
                 <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <p className="text-amber-800 font-medium mb-4">I think we should revisit the video for this section. Sometimes watching it again after trying the question makes it click.</p>
                    <button onClick={() => router.push('/learning-loop')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg inline-flex items-center gap-2">
                      <PlayCircle size={18} /> Take Me Back
                    </button>
                 </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-100">
                  <button onClick={handleNext} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                    I understand now <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => handleStillDontUnderstand()} 
                    disabled={checkingLoading}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
                  >
                    {checkingLoading ? 'Thinking...' : 'I still do not understand'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'summary' && evalResult) {
    if (isFinalTest) {
      return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center text-slate-900">
          <div className="max-w-4xl w-full space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
               <div className="w-32 h-32 mx-auto rounded-full border-8 border-slate-100 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: 'inset(' + (100 - (evalResult.score/20)*100) + '% 0 0 0)' }}></div>
                  <span className="text-4xl font-black text-slate-800">{evalResult.score}</span>
                  <span className="text-lg text-slate-400 ml-1">/20</span>
               </div>
               <h1 className="text-3xl font-bold mb-2">
                 {evalResult.passed ? 'Phase Complete! 🎉' : 'Needs Review'}
               </h1>
               <p className="text-slate-600 max-w-lg mx-auto">{evalResult.encouragement_message}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                 <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2"><CheckCircle2 size={18}/> Key Takeaways</h3>
                 <ul className="space-y-2 text-sm text-emerald-700">
                    {(evalResult.key_takeaways || ['You grasped the core concepts well', 'Good logic application']).map((t: string, i: number) => <li key={i}>• {t}</li>)}
                 </ul>
               </div>
               <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                 <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2"><XCircle size={18}/> Common Mistakes to Avoid</h3>
                 <ul className="space-y-2 text-sm text-amber-700">
                    {(evalResult.common_mistakes || ['Review edge cases', 'Watch out for syntax errors']).map((t: string, i: number) => <li key={i}>• {t}</li>)}
                 </ul>
               </div>
            </div>

            <div className="flex justify-center mt-8">
              {evalResult.passed ? (
                <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2">
                  Start Next Phase <ArrowRight size={20} />
                </button>
              ) : (
                <button onClick={() => router.push('/learning-loop')} className="bg-slate-800 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-slate-900 transition-all flex items-center gap-2">
                  <PlayCircle size={20} /> Go to Weak Topics
                </button>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // Regular Assessment Summary
      return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center text-slate-900">
          <div className="max-w-2xl w-full">
            <div className={`p-10 rounded-3xl shadow-sm border text-center ${evalResult.score === 5 ? 'bg-green-50 border-green-200' : evalResult.passed ? 'bg-white border-blue-200' : 'bg-red-50 border-red-200'}`}>
              <div className="text-6xl font-black mb-4">
                <span className={evalResult.passed ? 'text-green-600' : 'text-red-600'}>{evalResult.score}</span>
                <span className="text-slate-300 text-4xl">/5</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-slate-800">
                {evalResult.score === 5 ? "Perfect score! You've mastered this." : 
                 evalResult.passed ? "Great job! You passed." : 
                 evalResult.score === 3 ? "Almost there!" : "You need more practice."}
              </h2>
              <p className="text-slate-600 mb-8">{evalResult.encouragement_message}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {evalResult.passed ? (
                  <button onClick={() => router.push('/learning-loop')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                    Continue to Next Topic
                  </button>
                ) : (
                  <>
                    <button onClick={() => window.location.reload()} className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">
                      <RefreshCw size={18} /> Retry Assessment
                    </button>
                    <button onClick={() => router.push('/learning-loop')} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2">
                      <PlayCircle size={18} /> Rewatch Video
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
}
