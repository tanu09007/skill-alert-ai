import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];

    const prompt = `You are a world-class curriculum designer and industry expert. A student has selected a skill to learn. Your job is to deeply understand that skill and build the most accurate, practical, and structured learning roadmap for it.

STEP 1 — UNDERSTAND THE SKILL DEEPLY:
Read the skill name the student selected.
Ask yourself:
- What is this skill exactly?
- What are the real industry-standard stages of learning it?
- What do companies actually test for this skill?
- What are the beginner → intermediate → advanced milestones?
- What tools, technologies, concepts are part of this skill?
- What certifications exist for this skill if any?
- What are the common mistakes learners make?

STEP 2 — BUILD PHASES THAT MAKE SENSE FOR THAT SKILL:
Every skill has a natural learning progression.
You must discover it and follow it exactly.

Examples of how to think (do not copy these — always think fresh for whatever skill is given):
If skill has foundational theory → start with theory
If skill is practical/hands-on → start with setup and doing, not reading
If skill has an industry certification → make last phase exam prep
If skill is a programming language → go syntax → OOP → projects
If skill is a cloud platform → go basics → core services → architecture → DevOps
If skill is a framework → go prerequisites → core concepts → advanced features → real project
If skill is a soft skill or methodology → go understanding → applying → mastering → teaching

Build exactly 4 phases for any skill.
Phase names must be specific to that skill.
Phase names must describe what the student will actually learn and be able to do after that phase.
Phase names must NOT be generic like 'Introduction', 'Advanced', 'Mastery' — be specific.

STEP 3 — BUILD WEEKS INSIDE EACH PHASE:
Each week covers one logical chunk of that skill.
Week theme must name the exact subtopics covered that week — specific enough that a student knows exactly what they will learn.

STEP 4 — BUILD DAILY TOPICS:
Each day covers one focused concept.
Daily topic names must be concrete and actionable.
A student reading the topic name must immediately know what they will study that day.
Bad example: 'Introduction to concepts'
Good example: 'Setting up [tool] and writing your first [specific thing]'

STEP 5 — ADJUST EVERYTHING TO THIS STUDENT:
Student profile you must use:
Skill selected: ${chosen_skills?.join(', ') || 'General AI'}
Course: ${course || 'Not specified'}
Semester: ${semester || 'Not specified'}
CGPA: ${cgpa || '7.0'}
Preferred language: ${preferred_language || 'English'}
Hours per day: ${hours_per_day || '2'}
Learning mode: ${learning_mode || 'free'}
Certificate wanted: ${certificate_preference || 'none'}
Already has certificates: ${certificates?.join(', ') || 'None'}
Target roles: ${selected_roles?.join(', ') || 'General Developer'}
Weak topics from before: ${weak_topics?.join(', ') || 'None'}

Adjustment rules:
- If CGPA is above 8.0: skip absolute basics, start from intermediate concepts
- If CGPA is below 6.0: add one extra foundation week at the start of phase 1
- If student already has a certificate related to this skill: skip what they already know, start from the next level
- If hours_per_day is 1-2: spread topics thinner, more days per concept, add buffer days
- If hours_per_day is 3-4: standard progression
- If hours_per_day is 5+: compress, go deeper faster, add stretch topics
- If certificate_preference is free_cert or paid_cert: make the final week of the final phase exam prep with practice tests, revision, and exam strategy
- If weak_topics exists: add revision sessions for those topics in week 1
- If preferred_language is given: all code examples, code topics, and practice must use that language

STEP 6 — CALCULATE REAL DATES:
Today's date is: ${todayFormatted} (${todayISO})
Day 1 of the roadmap starts TODAY.
Every subsequent day increments by 1 calendar day.
Include weekends as study days unless student specified otherwise.
Never show a start date in the past.
Never show 'Day 1' — always show the actual formatted date.
Day 2 must be tomorrow: ${tomorrowISO}
And so on for every subsequent day.

Return ONLY valid JSON in this exact structure:
{
  "skill": string (exactly what student selected),
  "total_weeks": number,
  "total_days": number,
  "start_date": ISO string (today),
  "end_date": ISO string,
  "estimated_completion": string,
  "certificate_prep_week": number or null,
  "phases": [
    {
      "phase": number,
      "phase_name": string (specific to this skill),
      "phase_goal": string (what student can DO after this phase — one sentence, starts with a verb),
      "is_exam_prep": boolean (true if this phase contains certification preparation),
      "weeks": [
        {
          "week": number,
          "week_theme": string (specific subtopics covered this week),
          "days": [
            {
              "day": number,
              "actual_date": ISO date string,
              "formatted_date": string,
              "day_name": string,
              "topic": string (specific concept name),
              "subtopic": string (focused area of topic),
              "type": "theory" | "practice" | "project" | "assessment" | "revision",
              "duration_mins": number,
              "description": string (what student will do this day — 1-2 sentences),
              "is_today": boolean,
              "is_past": boolean,
              "resource_type": "free" | "paid",
              "certificate_aligned": boolean,
              "deliverable": string (what student produces at end of this day — 'notes', 'working code', 'mini project', 'quiz score')
            }
          ]
        }
      ]
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const generateAndValidate = async (currentPrompt: string) => {
      const result = await model.generateContent(currentPrompt);
      const roadmap = JSON.parse(result.response.text());

      // Validation logic
      const roadmapStr = JSON.stringify(roadmap).toLowerCase();
      const selectedSkillWords = (chosen_skills || [])
        .join(' ')
        .toLowerCase()
        .split(' ')
        .filter((w: string) => w.length > 3);

      const skillFound = selectedSkillWords.length === 0 || selectedSkillWords.some((word: string) => 
        roadmapStr.includes(word)
      );

      const firstDay = roadmap.phases?.[0]?.weeks?.[0]?.days?.[0];
      const firstDate = firstDay ? new Date(firstDay.actual_date) : null;
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);

      const dateIsCorrect = firstDate && firstDate >= todayStart;

      const genericNames = [
        'introduction', 'advanced topics', 'mastery',
        'foundational ai', 'ai agent', 'transformer'
      ];
      const phaseNames = roadmap.phases?.map((p: any) => p.phase_name.toLowerCase()) || [];
      const hasGenericNames = phaseNames.some((name: string) => 
        genericNames.some(g => name.includes(g))
      );

      return { roadmap, skillFound, dateIsCorrect, hasGenericNames };
    };

    let validation = await generateAndValidate(prompt);

    if (!validation.skillFound || !validation.dateIsCorrect || validation.hasGenericNames) {
      console.warn("Validation failed, retrying with stricter prompt...", {
        skillFound: validation.skillFound,
        dateIsCorrect: validation.dateIsCorrect,
        hasGenericNames: validation.hasGenericNames
      });
      
      const stricterPrompt = `
        CORRECTION NEEDED.
        Previous response had errors.
        
        The skill is: ${chosen_skills?.join(', ')}
        Today's date is: ${todayFormatted}
        
        You generated content that did not match the skill or had wrong dates or used generic phase names. Try again strictly.
        
        ${prompt}
        
        REMINDER: Generate roadmap ONLY for ${chosen_skills?.join(', ')}
        REMINDER: Day 1 date must be ${todayISO}
        REMINDER: Phase names must be highly specific to ${chosen_skills?.join(', ')}
      `;
      const retryResult = await generateAndValidate(stricterPrompt);
      return NextResponse.json(retryResult.roadmap);
    }

    return NextResponse.json(validation.roadmap);

  } catch (error: any) {
    console.error("Error in generate-roadmap API:", error);
    
    if (error.message?.includes('429')) {
      return NextResponse.json(
        { error: "Daily Roadmap Limit Reached. Please try again tomorrow or use a different Gemini API key." }, 
        { status: 429 }
      );
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
