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
  let user_id, topic, subtopic, phase, session_id, preferred_language, weak_topics;

  try {
    const body = await req.json();
    user_id = body.user_id;
    topic = body.topic || "Unknown Topic";
    subtopic = body.subtopic || "Unknown Subtopic";
    phase = body.phase;
    session_id = body.session_id;
    preferred_language = body.preferred_language;
    weak_topics = body.weak_topics;

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
    const fallbackResponse = {
      questions: [
        {
          id: "q1",
          difficulty: "easy",
          type: "conceptual",
          question: `What is the primary purpose of ${topic} - ${subtopic}?`,
          options: ["To style user interfaces", "To handle backend databases", "To solve specific problems in this domain efficiently", "To compile code into machine language"],
          correct_option: 2,
          correct_answer: "To solve specific problems in this domain efficiently",
          explanation: `The core purpose of ${subtopic} within ${topic} is to address specific domain problems effectively.`,
          misconception: "Thinking it's a general-purpose tool rather than a domain-specific concept.",
          where_thinking_breaks: "Failing to see the boundaries of what this concept is meant to solve.",
          followup_hint: "Think about what specific problem this concept was invented to solve.",
          simpler_explanation: "It's like a specialized tool in a toolbox, meant for one specific job rather than everything."
        },
        {
          id: "q2",
          difficulty: "easy",
          type: "mcq",
          question: `Which of the following is a key characteristic of ${subtopic}?`,
          options: ["It is always synchronous", "It provides structured solutions", "It only works in Python", "It is deprecated"],
          correct_option: 1,
          correct_answer: "It provides structured solutions",
          explanation: `Concepts in ${topic} generally provide structured, repeatable solutions to problems.`,
          misconception: "Assuming it's outdated or limited to one language.",
          where_thinking_breaks: "Confusing implementation details with the core concept.",
          followup_hint: "Does this concept help organize code or make it more chaotic?",
          simpler_explanation: "It's like a blueprint that helps you build something structured."
        },
        {
          id: "q3",
          difficulty: "medium",
          type: "conceptual",
          question: `How does ${subtopic} interact with the broader ecosystem of ${topic}?`,
          options: ["It operates completely independently", "It forms a foundational layer that other components build upon", "It is only used for UI rendering", "It replaces the need for a database"],
          correct_option: 1,
          correct_answer: "It forms a foundational layer that other components build upon",
          explanation: "In most architectures, this concept acts as a building block for more complex systems.",
          misconception: "Viewing concepts in isolation.",
          where_thinking_breaks: "Not understanding the architectural relationships between different parts of the system.",
          followup_hint: "Does this concept stand alone, or do other things rely on it?",
          simpler_explanation: "It's like the foundation of a house; other parts are built on top of it."
        },
        {
          id: "q4",
          difficulty: "medium",
          type: "mcq",
          question: `What is a common pitfall when implementing ${subtopic}?`,
          options: ["Over-engineering the solution", "Using too many comments", "Naming variables incorrectly", "Writing too many tests"],
          correct_option: 0,
          correct_answer: "Over-engineering the solution",
          explanation: "A very common issue is making the implementation more complex than the problem requires.",
          misconception: "Thinking that more complex code is better code.",
          where_thinking_breaks: "Failing to prioritize simplicity and maintainability.",
          followup_hint: "What happens when you try to solve a simple problem with a very complicated tool?",
          simpler_explanation: "It's like using a sledgehammer to crack a nut."
        },
        {
          id: "q5",
          difficulty: "hard",
          type: "conceptual",
          question: `In a high-scale production environment, how would you optimize ${subtopic}?`,
          options: ["By rewriting it in Assembly", "By ignoring edge cases", "By implementing caching and lazy loading strategies", "By removing all security checks"],
          correct_option: 2,
          correct_answer: "By implementing caching and lazy loading strategies",
          explanation: "Performance at scale usually requires strategic resource management like caching.",
          misconception: "Believing that simply changing languages solves all performance issues.",
          where_thinking_breaks: "Not considering how resources are utilized under heavy load.",
          followup_hint: "How do you avoid doing the same expensive work twice?",
          simpler_explanation: "It's like keeping your most-used tools on your belt instead of walking to the shed every time."
        }
      ],
      topic: topic,
      subtopic: subtopic,
      pass_score: 4,
      total: 5
    };

    let jsonResponse;
    
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("Groq Generate Assessment Parse Error:", responseText);
      jsonResponse = fallbackResponse;
    }

    if (!jsonResponse || !jsonResponse.questions || jsonResponse.questions.length === 0) {
      jsonResponse = fallbackResponse;
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
    // Use fallback on rate limit or other errors
    const fallbackResponse = {
      questions: [
        {
          id: "q1",
          difficulty: "easy",
          type: "conceptual",
          question: `What is a core principle of ${topic}?`,
          options: ["To write code once and run anywhere", "To structure logic efficiently", "To bypass security", "To create raw CSS"],
          correct_option: 1,
          correct_answer: "To structure logic efficiently",
          explanation: `The core purpose of ${topic} is to provide structure and efficiency.`,
          misconception: "Thinking it's just a syntax rather than a paradigm.",
          where_thinking_breaks: "Focusing on syntax instead of the underlying problem it solves.",
          followup_hint: "Why do we use frameworks and structured concepts instead of raw code?",
          simpler_explanation: "It's like using a template to write a letter instead of starting with a blank page every time."
        },
        {
          id: "q2",
          difficulty: "medium",
          type: "mcq",
          question: `How does ${topic} improve scalability?`,
          options: ["By forcing synchronous execution", "By modularizing components", "By using more memory", "By compiling to binary"],
          correct_option: 1,
          correct_answer: "By modularizing components",
          explanation: "Modularization is key to scaling, allowing teams to work independently.",
          misconception: "Thinking scalability is only about hardware.",
          where_thinking_breaks: "Not understanding how code organization affects team and system scale.",
          followup_hint: "How do you build a large system without everything getting tangled?",
          simpler_explanation: "It's like building with Lego blocks; you can add more pieces without breaking the existing ones."
        },
        {
          id: "q3",
          difficulty: "hard",
          type: "conceptual",
          question: `When dealing with complex edge cases in ${topic}, what is the best approach?`,
          options: ["Ignore them until they break", "Write comprehensive unit tests and handle gracefully", "Rewrite the entire module", "Hardcode exceptions"],
          correct_option: 1,
          correct_answer: "Write comprehensive unit tests and handle gracefully",
          explanation: "Robust systems require testing and graceful degradation for edge cases.",
          misconception: "Assuming edge cases are rare and unimportant.",
          where_thinking_breaks: "Failing to anticipate how a system will behave under unexpected conditions.",
          followup_hint: "How do you ensure your code works when the user does something weird?",
          simpler_explanation: "It's like putting a safety net under a tightrope walker."
        }
      ],
      topic: "Fallback Topic",
      subtopic: "Fallback Subtopic",
      pass_score: 2,
      total: 3
    };
    return NextResponse.json(fallbackResponse);
  }
}
