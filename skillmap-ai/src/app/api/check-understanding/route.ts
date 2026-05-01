import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `The student said they do not understand this explanation:
[explanation_given]

Their response was: [student_response]

You have two jobs:
1. Ask them: 'How would you like me to explain this?'
   Options to offer:
   a) With a real-life analogy
   b) Step by step with an example
   c) With a simple diagram description
   d) Compare it with something I already know

2. Based on what they pick, generate a completely fresh explanation using that method. Do not repeat the same words from the first explanation.

If this is attempt_number >= 3, also add:
'I think we should revisit the video for this section. Sometimes watching it again after trying the question makes it click. Want me to take you back?'

Return ONLY valid JSON:
{
  "ask_preference": boolean,
  "preference_options": ["string", "string", "string", "string"],
  "fresh_explanation": "string or null",
  "suggest_video_rewatch": boolean,
  "video_timestamp_hint": "string or null"
}`;

export async function POST(req: Request) {
  try {
    const { user_id, question, explanation_given, student_response, attempt_number } = await req.json();

    const contextText = `
Question Context: ${question}
[explanation_given]: ${explanation_given}
[student_response]: ${student_response || 'None, they just said they do not understand'}
Attempt Number: ${attempt_number}
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
      console.error("Groq Check Understanding Parse Error:", responseText);
      return NextResponse.json({ error: "Failed to generate understanding feedback" }, { status: 500 });
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in check-understanding API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
