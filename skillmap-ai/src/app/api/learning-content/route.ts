import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }

  // Default fallback content if AI call fails
  const fallback = {
    flipcards: [
      { q: `What is ${topic}?`, a: `A core concept in modern AI/ML architecture that enables intelligent, scalable systems.` },
      { q: `Why is ${topic} important?`, a: `Market data shows high demand for this skill — companies like Google, Meta, and OpenAI actively seek engineers who master it.` },
      { q: `How does ${topic} work?`, a: `It operates through a layered process of input encoding, transformation, and output generation, tuned via training on large datasets.` },
      { q: `What are the key use cases for ${topic}?`, a: `Semantic search, real-time recommendations, autonomous agents, and multi-modal reasoning pipelines.` },
    ],
    quiz: [
      { q: `${topic} is primarily used for:`, options: ['Static data storage', 'Semantic reasoning & retrieval', 'UI rendering', 'CSS animations'], answer: 1 },
      { q: `Which of these is a key characteristic of ${topic}?`, options: ['Synchronous blocking', 'High-dimensional vector space', 'Manual rule-based logic', 'Fixed schema'], answer: 1 },
    ]
  };

  if (!GROQ_API_KEY) {
    return NextResponse.json(fallback);
  }

  try {
    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator. Generate engaging learning content as JSON only — no markdown, no explanation.'
          },
          {
            role: 'user',
            content: `Generate 4 flipcards and 2 quiz questions for the topic: "${topic}".
Return ONLY valid JSON in this exact format:
{
  "flipcards": [
    {"q": "Question here?", "a": "Answer here."}
  ],
  "quiz": [
    {"q": "Question?", "options": ["A","B","C","D"], "answer": 0}
  ]
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    const groqData = await response.json();
    const rawText = groqData.choices?.[0]?.message?.content || '';

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    return NextResponse.json(fallback);
  } catch (err) {
    console.error('Learning content generation error:', err);
    return NextResponse.json(fallback);
  }
}
