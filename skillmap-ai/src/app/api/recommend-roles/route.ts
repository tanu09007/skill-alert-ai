import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { user_input } = await req.json();
    
    const prompt = `
      You are a high-alpha career growth strategist. 
      Based on these user skills/background: "${user_input}", 
      recommend 5 high-growth, emerging career roles.
      
      Return ONLY a JSON array of objects with this structure:
      [
        {
          "role": "Role Name",
          "match_score": 95,
          "market_stage": "EMERGING" | "GROWING" | "ESTABLISHED",
          "key_skills": ["Skill 1", "Skill 2"],
          "avg_salary": "$120k - $160k",
          "demand_level": "High" | "Critical" | "Stable"
        }
      ]
      
      Do not include any markdown formatting or extra text.
    `;

    const responseText = await generateContent(prompt);
    
    // Clean potential markdown code blocks
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    let roles;
    try {
      roles = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Role Recommendation Parse Error:", responseText);
      return NextResponse.json({ error: "Failed to parse roles" }, { status: 500 });
    }

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Role recommendation error:', error);
    return NextResponse.json({ error: 'Failed to recommend roles' }, { status: 500 });
  }
}
