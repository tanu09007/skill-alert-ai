import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, course, semester, cgpa, 
      chosen_skills, learning_mode, certificate_preference, 
      preferred_language, hours_per_day, weak_topics, 
      certificates, selected_roles 
    } = body;

    const now = new Date();
    const todayFormatted = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
    const todayISO = now.toISOString().split('T')[0];

    const prompt = `You are a world-class curriculum designer and industry expert. A student has selected a skill to learn. Your job is to deeply understand that skill and build the most accurate, practical, and structured learning roadmap for it.

STEP 1 — UNDERSTAND THE SKILL DEEPLY:
Read the skill name the student selected.
Ask yourself:
- What is this skill exactly?
- What are the real industry-standard stages of learning it?
- What do companies actually test for this skill?
- What are the beginner → intermediate → advanced milestones?
- What tools, technologies, concepts are part of this skill?

STEP 2 — BUILD PHASES:
Build exactly 4 phases specific to this skill. Phase names must describe what the student will actually learn.

STEP 3 — BUILD WEEKS:
Each week covers one logical chunk.

STEP 4 — BUILD DAILY TOPICS:
Daily topics must be concrete and actionable.

STEP 5 — ADJUST TO STUDENT:
Skill: ${chosen_skills?.join(', ')}
Course: ${course}
Semester: ${semester}
Preferred Language: ${preferred_language}
Learning Mode: ${learning_mode}

STEP 6 — CALCULATE DATES:
Today's date is: ${todayFormatted} (${todayISO}). Start Day 1 TODAY.

Return ONLY valid JSON:
{
  "skill": string,
  "total_weeks": number,
  "total_days": number,
  "start_date": string,
  "phases": [
    {
      "phase": number,
      "phase_name": string,
      "phase_goal": string,
      "weeks": [
        {
          "week": number,
          "week_theme": string,
          "days": [
            {
              "day": number,
              "actual_date": string,
              "formatted_date": string,
              "topic": string,
              "subtopic": string,
              "type": "theory" | "practice" | "project",
              "duration_mins": number,
              "description": string,
              "deliverable": string
            }
          ]
        }
      ]
    }
  ]
}`;

    let roadmap;
    let usedGroq = false;

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      roadmap = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (error: any) {
      console.warn("Gemini Failed (Roadmap Fallback to Groq):", error.message);
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a master curriculum designer. Return ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });
      roadmap = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
      usedGroq = true;
    }

    return NextResponse.json({ ...roadmap, ai_used: usedGroq ? 'groq' : 'gemini' });

  } catch (error: any) {
    console.error("CRITICAL: Roadmap API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
