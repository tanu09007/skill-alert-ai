import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const techStack = searchParams.get('tech') || 'Software Engineering';

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert tech career advisor tracking live GitHub trends.
      Generate 4 cutting-edge, high-growth technology frameworks, tools, or libraries highly relevant to someone learning: ${techStack}.
      
      Requirements for each tool:
      - name: The name of the tool (e.g., "LangGraph", "Supabase").
      - desc: A short 1-2 sentence description explaining why it's trending or useful.
      - github: The github repo or search query (e.g., "langchain-ai/langgraph").
      - growth: A simulated weekly growth metric string (e.g., "+45%", "+120%").
      - time: A recent time string (e.g., "2 hours ago", "Yesterday").
      - type: Categorize the alert (e.g., "Market Signal", "Tech Alert", "Critical Tool").
      - priority: Either "Critical", "High", "Medium", or "Essential".

      Return EXACTLY a JSON array of 4 objects with the above keys. Do not include markdown formatting or backticks.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up potential markdown formatting from Gemini
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/\`\`\`/g, '').trim();
    }

    const recommendations = JSON.parse(text);

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);
    return NextResponse.json(
      { error: "Failed to fetch live signals" },
      { status: 500 }
    );
  }
}
