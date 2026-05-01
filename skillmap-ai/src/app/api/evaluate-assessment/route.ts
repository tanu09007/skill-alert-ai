import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getScoringLogic } from '@/lib/assessment';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Alex, an AI mentor reviewing a student's assessment.
Analyze their answers and return a detailed evaluation.

For each wrong answer return:
- question text
- what the student answered
- correct answer
- explanation of why student was wrong (specific, not generic)
- where exactly their thinking broke down
- the correct mental model they should build
- a Socratic followup question to test if they now understand

For the overall session return:
- score (number)
- passed (boolean — true only if score >= 4)
- strong_concepts[] (topics they got right)
- weak_concepts[] (topics they got wrong — save these)
- next_action: 
    if passed → 'advance_to_next_subtopic'
    if score 3 → 'review_and_retry'
    if score 2 → 'rewatch_video_section'
    if score 1 → 'rewatch_full_video'
- encouragement_message: string (warm, specific to their score)

Return ONLY valid JSON. Structure it as follows:
{
  "evaluations": [
    {
      "question": "string",
      "student_answer": "string",
      "correct_answer": "string",
      "explanation": "string",
      "where_thinking_broke_down": "string",
      "correct_mental_model": "string",
      "socratic_followup_question": "string"
    }
  ],
  "score": number,
  "passed": boolean,
  "strong_concepts": ["string"],
  "weak_concepts": ["string"],
  "next_action": "string",
  "encouragement_message": "string"
}`;

export async function POST(req: Request) {
  try {
    const { user_id, session_id, topic, subtopic, phase, questions, student_answers, is_final_test } = await req.json();

    let calculatedScore = 0;
    const wrongAnswers = [];
    const correctAnswers = [];

    // Pre-calculate score
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.correct_option === student_answers[i]) {
        calculatedScore++;
        correctAnswers.push(q);
      } else {
        wrongAnswers.push({
          question: q.question,
          student_selected_text: q.options[student_answers[i]] || 'No Answer',
          correct_text: q.options[q.correct_option] || 'No correct option'
        });
      }
    }

    const contextText = `
Topic: ${topic}
Subtopic: ${subtopic}
Is Final Test: ${is_final_test}
Calculated Score: ${calculatedScore} out of ${questions.length}

Wrong Answers provided by student:
${JSON.stringify(wrongAnswers, null, 2)}

Correct Answers provided by student (for context to derive strong concepts):
${correctAnswers.map(c => c.question).join('\n')}
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
    let evaluationsResponse;
    try {
      evaluationsResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("Groq Evaluation Parse Error:", responseText);
      return NextResponse.json({ error: "Failed to parse evaluation" }, { status: 500 });
    }

    // Force score to be the calculated one
    evaluationsResponse.score = calculatedScore;
    const { nextAction } = getScoringLogic(calculatedScore, is_final_test ? 20 : 5);
    evaluationsResponse.next_action = nextAction;
    
    // Pass condition for regular is score >= 4, for final is score >= 15
    evaluationsResponse.passed = is_final_test ? (calculatedScore >= 15) : (calculatedScore >= 4);

    if (user_id) {
      // Save score + weak_concepts to assessments table
      try {
        await supabase.from('assessments').insert({
          user_id,
          session_id,
          topic,
          subtopic,
          score: calculatedScore,
          passed: evaluationsResponse.passed,
          is_final_test: is_final_test || false,
          weak_concepts: evaluationsResponse.weak_concepts,
          strong_concepts: evaluationsResponse.strong_concepts,
          next_action: evaluationsResponse.next_action
        });

        // Save weak_concepts to progress_logs.weak_topics
        await supabase.from('progress_logs').insert({
          user_id,
          topic,
          weak_topics: evaluationsResponse.weak_concepts
        });

        if (calculatedScore <= 3 && !is_final_test) {
          // Update learning_sessions with needs_review: true for that subtopic
          await supabase.from('learning_sessions')
            .update({ needs_review: true })
            .eq('user_id', user_id)
            .eq('subtopic', subtopic);
        }

      } catch (err) {
        console.error("Failed to save evaluation to Supabase", err);
      }
    }

    return NextResponse.json(evaluationsResponse);
  } catch (error) {
    console.error("Error in evaluate-assessment API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
