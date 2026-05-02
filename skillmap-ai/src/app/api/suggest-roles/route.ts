import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabase } from '@/lib/supabase';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ADZUNA_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_KEY = process.env.ADZUNA_APP_KEY;

const SYSTEM_PROMPT = `You are a high-alpha tech career strategist. Suggest exactly 7 specific job roles for a user.
Categories: 
1. Already in Market (2 roles) - High demand.
2. Emerging (3 roles) - Trending on Hacker News (AI, Agents, Rust).
3. Related Stretch (2 roles) - High upside.

Return ONLY valid JSON:
{
  "roles": [
    {
      "role_title": string,
      "category": "already_in_market" | "emerging" | "related_stretch",
      "why_this_role": string,
      "top_skills_needed": [string, string, string],
      "avg_salary_inr": string, // MUST be in LPA format (e.g. "11-18 LPA", "25-40 LPA"). Do NOT use raw numbers like 1100000.
      "hiring_companies": [string, string, string],
      "time_to_ready": number,
      "demand_trend": "rising" | "stable" | "exploding"
    }
  ]
}`;

export async function POST(req: Request) {
  try {
    const profile = await req.json();
    console.log("DEBUG: Suggesting roles for profile:", profile);

    const { name, current_status, degree_or_job, experience_level, tech_stack, hours_per_day, user_id } = profile;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API Key missing" }, { status: 500 });
    }

    // Default Fallback Roles in case AI fails
    const fallbackRoles = [
      {
        role_title: "AI Fullstack Engineer",
        category: "already_in_market",
        why_this_role: "Combines your tech stack with the massive demand for AI-integrated apps.",
        top_skills_needed: ["Next.js", "OpenAI/Groq API", "PostgreSQL"],
        avg_salary_inr: "12-22 LPA",
        hiring_companies: ["Zomato", "Swiggy", "Tech Mahindra"],
        time_to_ready: 8,
        demand_trend: "exploding"
      },
      {
        role_title: "AI Agents Developer",
        category: "emerging",
        why_this_role: "Trending on Hacker News; companies are hiring for agentic workflows.",
        top_skills_needed: ["Python", "LangChain", "Vector DBs"],
        avg_salary_inr: "18-35 LPA",
        hiring_companies: ["OpenAI", "Anthropic", "Startups"],
        time_to_ready: 12,
        demand_trend: "exploding"
      }
    ];

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Suggest roles for: Name: ${name}, Status: ${current_status}, Skill: ${tech_stack}` }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "{}";
      const jsonResponse = JSON.parse(responseText);

      if (jsonResponse.roles && jsonResponse.roles.length > 0) {
        if (user_id) {
          await supabase.from('role_suggestions').upsert({ user_id, roles: jsonResponse.roles });
        }
        return NextResponse.json(jsonResponse);
      }
    } catch (aiError) {
      console.error("AI Role Suggestion Error:", aiError);
    }

    // If AI fails or returns empty, send high-quality fallback
    return NextResponse.json({ roles: fallbackRoles });

  } catch (error: any) {
    console.error("CRITICAL: suggest-roles API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
