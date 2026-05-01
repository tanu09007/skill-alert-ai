import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a senior tech career strategist in 2025. Based on the user's profile, suggest exactly 7 job roles they should target — structured in 3 categories:

CATEGORY 1 — Already in market (2 roles):
Roles that are well established, high demand right now, companies are actively hiring, user can get placed in these within 6 months of focused learning.

CATEGORY 2 — Emerging roles (3 roles):
Roles that are rapidly growing in 2025, not yet saturated, early movers have massive advantage, will be mainstream in 1-2 years. Think AI engineers, prompt engineers, MLOps, edge computing, etc.

CATEGORY 3 — Related stretch roles (2 roles):
Roles slightly outside their current path but highly related to their skills — good for users who want to explore adjacent high-paying careers.

For each role return:
- role_title: exact job title used in job postings
- category: already_in_market | emerging | related_stretch
- why_this_role: one line — why this fits THIS user specifically based on their status, background, experience, and tech stack
- top_skills_needed: exactly 3 skills required for this role
- avg_salary_inr: realistic salary range in India (e.g. 6-12 LPA for fresher, 15-30 LPA for experienced)
- hiring_companies: 3 real companies actively hiring for this role
- time_to_ready: honest estimate of weeks to become hireable (based on user's current level)
- demand_trend: rising | stable | exploding

Return ONLY valid JSON:
{
  "roles": [
    {
      "role_title": string,
      "category": string,
      "why_this_role": string,
      "top_skills_needed": [string, string, string],
      "avg_salary_inr": string,
      "hiring_companies": [string, string, string],
      "time_to_ready": number,
      "demand_trend": string
    }
  ]
}

Order: already_in_market first, then emerging, then related_stretch.
Be specific to the user — not generic advice. A CSE student with Python gets different roles than a professional with 3 years in QA looking to switch to Dev.`;

export async function POST(req: Request) {
  try {
    const profile = await req.json();
    const { name, current_status, degree_or_job, experience_level, tech_stack, hours_per_day, user_id } = profile;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const userProfileText = `
Name: ${name}
Current Status: ${current_status}
Degree or Job Title: ${degree_or_job}
Experience Level / Semester: ${experience_level}
Tech Stack / Preferred Language: ${tech_stack}
Hours per day available: ${hours_per_day}
    `;

    const result = await model.generateContent(userProfileText);
    const responseText = result.response.text();
    let jsonResponse;
    
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse suggest-roles Gemini response", responseText);
      return NextResponse.json({ error: "Failed to generate roles" }, { status: 500 });
    }

    if (user_id) {
      // Save to Supabase
      try {
        await supabase.from('role_suggestions').insert({
          user_id: user_id,
          roles: jsonResponse.roles
        });
      } catch (err) {
        console.error("Failed to save roles to Supabase", err);
      }
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in suggest-roles API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
