import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a strict but fair examiner for a self-paced learning platform. Generate exactly 5 questions to test the student's understanding of the provided [topic] and [subtopic].

Difficulty distribution is mandatory:
- Question 1: EASY — basic definition or concept recall
- Question 2: EASY — simple application of the concept
- Question 3: MEDIUM — requires combining two concepts
- Question 4: MEDIUM — code trace or output prediction
- Question 5: HARD — edge case, time complexity analysis, or real-world application requiring deep understanding

For each question return:
{
  "id": "string (unique identifier like q1, q2, etc)",
  "difficulty": "easy" | "medium" | "hard",
  "type": "mcq" | "code_trace" | "output_predict" | "conceptual",
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correct_option": 0 | 1 | 2 | 3,
  "correct_answer": "string",
  "explanation": "string (detailed — explain WHY this is correct and WHY each wrong option is wrong)",
  "misconception": "string (the most common wrong mental model students apply to this question)",
  "where_thinking_breaks": "string (exactly where the student's logic goes wrong when they pick wrong answers)",
  "followup_hint": "string (a Socratic question to guide student to the right answer without revealing it)",
  "simpler_explanation": "string (explain the same concept using a real-life analogy — used only if student says they still do not understand)"
}

Return ONLY valid JSON:
{
  "questions": [...],
  "topic": "string",
  "subtopic": "string",
  "pass_score": 4,
  "total": 5
}`;

export async function POST(req: Request) {
  try {
    const { user_id, topic, subtopic, phase, session_id, preferred_language, weak_topics } = await req.json();

    const contextText = `
Topic: ${topic}
Subtopic: ${subtopic}
Preferred Language: ${preferred_language || 'Not specified'}
Weak Topics: ${(weak_topics || []).join(', ') || 'None'}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: contextText }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    let jsonResponse;
    
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("Groq Generate Assessment Parse Error:", responseText);
      return NextResponse.json({ error: "Failed to generate assessment" }, { status: 500 });
    }

    if (user_id) {
      // Save to Supabase (optional, but requested in prompt: "Save generated questions to assessments table.")
      try {
        await supabase.from('assessments').insert({
          user_id,
          session_id: session_id || `sess_${Date.now()}`,
          topic,
          subtopic,
          phase: phase || 1,
          questions: jsonResponse.questions
        });
      } catch (err) {
        console.error("Failed to save assessment to Supabase", err);
      }
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in generate-assessment API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
