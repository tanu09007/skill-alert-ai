import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Generate a final phase test for the student based on their completed phase.

This test has 20 questions total:
- 6 easy questions (one per major topic covered)
- 8 medium questions (application and combination)
- 6 hard questions (edge cases, optimization, real-world)

Passing score: 15 out of 20 (75%)

For each question follow this exact format:
{
  "id": "string",
  "difficulty": "easy" | "medium" | "hard",
  "type": "mcq" | "code_trace" | "output_predict" | "conceptual",
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correct_option": 0 | 1 | 2 | 3,
  "correct_answer": "string",
  "explanation": "string (detailed — explain WHY this is correct and WHY each wrong option is wrong)",
  "misconception": "string",
  "where_thinking_breaks": "string",
  "followup_hint": "string",
  "simpler_explanation": "string"
}

Also generate:
- phase_summary: paragraph summarizing what this phase covered
- key_takeaways: exactly 5 bullet points the student must remember forever from this phase
- common_mistakes: 3 mistakes students make in this phase

Return ONLY valid JSON:
{
  "questions": [...20 questions],
  "phase_summary": "string",
  "key_takeaways": ["string", "string", "string", "string", "string"],
  "common_mistakes": ["string", "string", "string"],
  "pass_score": 15,
  "total": 20
}`;

export async function POST(req: Request) {
  try {
    const { user_id, phase, topics_covered, roadmap_id, preferred_language } = await req.json();

    const contextText = `
Phase Number: Week ${phase}
Topics Covered: ${(topics_covered || []).join(', ')}
Preferred Language: ${preferred_language || 'Not specified'}
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
      console.error("Groq Final Phase Test Parse Error:", responseText);
      return NextResponse.json({ error: "Failed to generate final phase test" }, { status: 500 });
    }

    // We do not save to phase_tests here, we save AFTER they complete it. 
    // Just return the questions to the frontend.

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in final-phase-test API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
