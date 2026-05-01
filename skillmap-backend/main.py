import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from groq import Groq
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from parent and current directory
load_dotenv("../.env")
load_dotenv() # Load local .env if it exists

app = FastAPI(title="SkillMap AI Backend", version="1.0.0")

# Setup CORS to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://placeholder-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "placeholder-anon-key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize LLMs
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "placeholder-gemini-key"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "placeholder-groq-key"))

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")

class OnboardingRequest(BaseModel):
    email: str
    hours_per_day: int
    preference: str # free, paid, certificate

class RoadmapRequest(BaseModel):
    role: str
    current_skills: List[str]

class AssessmentRequest(BaseModel):
    topic: str
    user_response: str
    learner_type: str # Student, Professional, Career Switcher, etc.

class QuizRequest(BaseModel):
    topic: str
    learner_type: str

class MatchRequest(BaseModel):
    email: str
    full_name: str
    school: str
    ug_course: str
    pg_course: Optional[str]
    current_job: Optional[str]
    job_company: Optional[str]
    skills: List[str]

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to SkillMap AI API"}

@app.post("/api/onboarding")
def user_onboarding(data: OnboardingRequest):
    # Setup initial learner profile in DB
    return {"message": "Onboarding complete", "data": data}

@app.post("/api/extract-skills")
async def extract_skills(file: UploadFile = File(...)):
    # Mocking extraction
    return {"skills": ["React", "Python", "TypeScript", "Tailwind CSS"]}

import httpx

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

async def get_github_signals():
    """Fetch real-time trending signals from GitHub for Emerging Roles."""
    if not GITHUB_TOKEN:
        return ["GitHub: LangChain", "GitHub: Auto-GPT"]
    
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "User-Agent": "SkillMap-AI-Agent"
    }
    async with httpx.AsyncClient() as client:
        try:
            # Query for AI/Agentic repos created recently with high interest
            url = "https://api.github.com/search/repositories?q=topic:ai-agents+created:>2024-01-01&sort=stars&order=desc"
            res = await client.get(url, headers=headers)
            
            if res.status_code != 200:
                print(f"GitHub API Error: {res.status_code} - {res.text}")
                return ["GitHub: Agentic-Workflows", "GitHub: RAG-System"]

            data = res.json()
            repos = [item['name'] for item in data.get('items', [])[:3]]
            return [f"GitHub: {r}" for r in repos] if repos else ["GitHub: Agentic-Workflows", "GitHub: RAG-System"]
        except Exception as e:
            print(f"GitHub Exception: {e}")
            return ["GitHub: AI-Agents", "GitHub: RAG-Stack"]

async def get_adzuna_stats(role: str):
    """Fetch real-time hiring stats from Adzuna."""
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        return {"count": 124, "salary": 85000}
    
    url = f"https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id={ADZUNA_APP_ID}&app_key={ADZUNA_APP_KEY}&results_per_page=1&what={role}"
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url)
            data = res.json()
            return {
                "count": data.get("count", 100),
                "salary": data.get("results", [{}])[0].get("salary_min", 75000)
            }
        except:
            return {"count": 124, "salary": 85000}

@app.get("/api/role-discovery")
async def role_discovery(email: str):
    github_signals = await get_github_signals()
    # Adzuna for the base role
    market_stats = await get_adzuna_stats("AI Engineer") 
    
    return {
        "role": "AI Solutions Architect",
        "confidence_score": 92,
        "stage": "EMERGING",
        "hiring_companies": market_stats["count"],
        "avg_salary": market_stats["salary"],
        "message": f"AI Solutions Architect is an EMERGING role. Currently {market_stats['count']} active openings detected.",
        "pivot_path": "From Full Stack Developer to AI Architect",
        "signals": github_signals
    }

@app.post("/api/job-matches")
async def get_job_matches(data: MatchRequest):
    """Analyze user profile and return tailored job matches."""
    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = f"""
    Analyze this professional profile:
    Name: {data.full_name}
    Education: {data.school}, UG: {data.ug_course}, PG: {data.pg_course}
    Experience: {data.current_job} at {data.job_company}
    Skills: {', '.join(data.skills)}
    
    Identify 2-3 'High Match' roles (>80% overlap) and 2-3 'Low Match' roles (40-60% overlap).
    For each role, provide:
    1. Match percentage
    2. Market demand (High/Medium/Low)
    3. Top 3 companies hiring
    4. Top 2 geographic areas with demand
    
    Return ONLY a JSON object:
    {{
      "high_matches": [
        {{ "role": "string", "match": 95, "demand": "High", "companies": ["Comp1", "Comp2"], "areas": ["London", "SF"] }}
      ],
      "low_matches": [
        {{ "role": "string", "match": 55, "demand": "Medium", "companies": ["Comp3", "Comp4"], "areas": ["NYC", "Berlin"] }}
      ]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        import json
        return json.loads(text)
    except Exception as e:
        # Fallback
        return {
            "high_matches": [
                { "role": "AI Engineer", "match": 92, "demand": "Extreme", "companies": ["Anthropic", "Google", "OpenAI"], "areas": ["San Francisco", "Remote"] },
                { "role": "Full Stack AI Developer", "match": 88, "demand": "High", "companies": ["Vercel", "Supabase", "Replicate"], "areas": ["London", "Berlin"] }
            ],
            "low_matches": [
                { "role": "Data Scientist", "match": 45, "demand": "High", "companies": ["Meta", "Amazon"], "areas": ["Seattle", "NYC"] },
                { "role": "Machine Learning Researcher", "match": 38, "demand": "Medium", "companies": ["DeepMind", "FAIR"], "areas": ["Paris", "Cambridge"] }
            ]
        }

class RecommendRoleRequest(BaseModel):
    subjects: str
    education_level: Optional[str] = "College"
    skills: Optional[List[str]] = []

@app.post("/api/recommend-roles")
async def recommend_roles(data: RecommendRoleRequest):
    model = genai.GenerativeModel('gemini-flash-latest')
    prompt = f"""
    Based on a user studying '{data.subjects}' at '{data.education_level}' level, with current skills/experience: {', '.join(data.skills) if data.skills else 'None specified'}.
    Recommend 5 cutting-edge, high-paying tech career roles with HIGH market demand.
    
    CRITICAL: For each role, you MUST provide a personalized reason why it fits them.
    
    For each role, provide:
    1. Title
    2. Demand Level (e.g. Critical, Very High, High)
    3. Growth (e.g. 150%)
    4. Average Salary (e.g. $120k+)
    5. Type (EMERGING or STABLE)
    6. Reason (personalized based on their background)
    
    Return ONLY a JSON list with this structure:
    [
      {{ "title": "Role Name", "demand": "Very High", "growth": "150%", "salary": "$120k+", "type": "EMERGING", "reason": "Short reason why" }}
    ]
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        import json
        roles = json.loads(text)
        
        # Integrate real-time Adzuna stats for each recommended role
        for role in roles[:5]:
            stats = await get_adzuna_stats(role["title"])
            role["hiring_count"] = stats["count"]
            if stats["salary"] > 50000: # If we got a real salary
                role["salary"] = f"${stats['salary'] // 1000}k+"
            # Ensure demand info is consistent
            if stats["count"] > 1000:
                role["demand"] = "Critical"
            elif stats["count"] > 500:
                role["demand"] = "Very High"
        
        return roles[:5]
    except Exception as e:
        print(f"Gemini error in recommend_roles: {e}")
        return [
            { "title": "AI Agent Architect", "demand": "Critical", "growth": "400%", "salary": "$180k+", "type": "EMERGING", "reason": "Universal high-growth field" },
            { "title": "LLM Ops Engineer", "demand": "Very High", "growth": "250%", "salary": "$165k+", "type": "EMERGING", "reason": "High demand infrastructure role" },
            { "title": "RAG Developer", "demand": "High", "growth": "180%", "salary": "$150k+", "type": "EMERGING", "reason": "Standard industry need" },
            { "title": "Prompt Engineer", "demand": "Moderate", "growth": "80%", "salary": "$120k+", "type": "STABLE", "reason": "Good entry to AI" },
            { "title": "AI Product Manager", "demand": "High", "growth": "120%", "salary": "$170k+", "type": "STABLE", "reason": "Fits management interests" }
        ]

@app.post("/api/generate-roadmap")
async def generate_roadmap(data: RoadmapRequest):
    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = f"""
    As a Silicon Valley career architect, generate a 4-phase high-efficiency learning roadmap for the role: {data.role}.
    Current skills to build upon: {", ".join(data.current_skills)}.
    
    Each phase should represent a logical progression from fundamentals to production-ready skills.
    For each phase, provide:
    1. A main 'topic'
    2. A list of 4-5 'sub_topics' that the user can click to learn more about.
    3. a 'video_url' which is a YouTube search link for that specific phase topic (e.g., https://www.youtube.com/results?search_query=topic+name).
    4. 'duration_days' (e.g. 5, 7, 10).
    
    Return ONLY a JSON object with this structure:
    {{
      "role": "{data.role}",
      "roadmap": [
        {{ 
          "step": 1, 
          "topic": "string", 
          "sub_topics": ["sub1", "sub2", "sub3", "sub4"],
          "video_url": "string",
          "type": "free", 
          "duration_days": 5, 
          "relevance_score": 98 
        }},
        ... and so on for 4 phases
      ],
      "market_relevance_score": 95,
      "completion_date": "2026-06-15"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        # Extract JSON from potential markdown markers
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        import json
        return json.loads(text)
    except Exception as e:
        print(f"Gemini error: {e}")
        # Fallback to high-quality default if Gemini fails
        return {
            "role": data.role,
            "roadmap": [
                {"step": 1, "topic": "Modern AI Architectures", "sub_topics": ["Transformer Evolution", "Encoder-Decoder models", "Context Windows"], "type": "free", "duration_days": 5, "relevance_score": 98},
                {"step": 2, "topic": "Agentic Workflows", "sub_topics": ["Tool-Calling", "Multi-Agent Orchestration", "Stateful Agents"], "type": "free", "duration_days": 7, "relevance_score": 95},
                {"step": 3, "topic": "Vector DB & RAG", "sub_topics": ["Semantic Search", "Metadata Filtering", "Chunking Strategies"], "type": "free", "duration_days": 10, "relevance_score": 99},
                {"step": 4, "topic": "System Evaluation & Ops", "sub_topics": ["LLM Benchmarking", "Cost Monitoring", "Production Guardrails"], "type": "free", "duration_days": 14, "relevance_score": 97},
            ],
            "market_relevance_score": 95,
            "completion_date": "2026-06-15"
        }

class RoleDetailRequest(BaseModel):
    role: str

@app.post("/api/role-details")
async def get_role_details(data: RoleDetailRequest):
    model = genai.GenerativeModel('gemini-flash-latest')
    prompt = f"""
    Generate 3 specific learning goals and 3 weekly projects for the role: {data.role}.
    Goals should be action-oriented (e.g., 'Master ETL logic'). 
    Projects should have a title and a difficulty (Easy, Medium, Hard).
    
    Return ONLY a JSON object:
    {{
      "goals": ["goal1", "goal2", "goal3"],
      "projects": [
        {{ "title": "Project 1", "level": "Easy" }},
        {{ "title": "Project 2", "level": "Medium" }},
        {{ "title": "Project 3", "level": "Hard" }}
      ],
      "ai_tip": "A specific piece of advice for this career path."
    }}
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        import json
        return json.loads(text)
    except:
        return {
            "goals": ["Master Core Concepts", "Build a Portfolio Project", "Get Industry Certified"],
            "projects": [
                { "title": "Project 1: Foundation", "level": "Easy" },
                { "title": "Project 2: Integration", "level": "Medium" },
                { "title": "Project 3: Production", "level": "Hard" }
            ],
            "ai_tip": f"Focus on building a strong portfolio of {data.role} projects to demonstrate your practical skills."
        }

class ContentRequest(BaseModel):
    topic: str

@app.post("/api/learning-content")
async def get_learning_content(data: ContentRequest):
    model = genai.GenerativeModel('gemini-flash-latest')
    prompt = f"""
    Generate learning content for the topic: {data.topic}.
    Provide:
    1. 3 Flipcards (question and answer).
    2. 3 Quiz questions (question, 4 options, and correct index).
    
    Return ONLY a JSON object:
    {{
      "flipcards": [
        {{ "q": "string", "a": "string" }}
      ],
      "quiz": [
        {{ "question": "string", "options": ["opt1", "opt2", "opt3", "opt4"], "answer": 0 }}
      ]
    }}
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        import json
        return json.loads(text)
    except:
        return {{
            "flipcards": [
                {{ "q": f"What is {data.topic}?", "a": "A key industry concept." }},
                {{ "q": "Why is it important?", "a": "It drives efficiency in modern systems." }},
                {{ "q": "Best practice?", "a": "Always validate your outputs." }}
            ],
            "quiz": [
                {{ "question": f"Which is true about {data.topic}?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": 0 }}
            ]
        }}

class AssessmentRequest(BaseModel):
    role: str
    phase: str

@app.post("/api/assessment-questions")
async def get_assessment_questions(data: AssessmentRequest):
    model = genai.GenerativeModel('gemini-flash-latest')
    prompt = f"""
    Generate a concise technical assessment for the role: {data.role} during {data.phase}.
    Provide exactly 3 high-quality multiple-choice questions.
    
    Each question MUST include:
    1. A clear 'text' field.
    2. 4 'options'.
    3. 'correct' index (0-3).
    4. An 'explanation' field (CRITICAL): This will be shown to the user if they get it wrong. It should explain the core concept clearly and why the correct answer is right.
    
    Return ONLY a JSON list of 3 objects:
    [
      {{
        "id": 1,
        "text": "string",
        "options": ["opt1", "opt2", "opt3", "opt4"],
        "correct": 0,
        "hint": "string",
        "explanation": "string"
      }}
    ]
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        import json
        return json.loads(text)[:3]
    except:
        return [
            {
                "id": 1,
                "text": f"What is a core requirement for {data.role} in {data.phase}?",
                "options": ["Scalability", "Documentation", "Testing", "All of the above"],
                "correct": 3,
                "hint": "Think holistically."
            }
        ]

@app.post("/api/assessment/analyze")
async def analyze_assessment(data: AssessmentRequest):
    """Use Groq for ultra-fast semantic analysis of the user's understanding."""
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are a knowledge synthesis agent. Analyze the user's explanation of '{data.topic}' for a '{data.learner_type}' level. Identify if they have 'MASTERY' or if a 'GAP_DETECTED'. Provide a concise 'feedback' and a 're_explanation' in an analogy that fits their learner type. Return JSON only."
                },
                {
                    "role": "user",
                    "content": data.user_response,
                }
            ],
            model="llama3-8b-8192",
            response_format={"type": "json_object"}
        )
        import json
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Groq error: {e}")
        return {
            "status": "GAP_DETECTED",
            "feedback": "Analysis engine is warming up. Your explanation seems consistent with core concepts.",
            "re_explanation": "Imagine the concept as a blueprint for a building; you have the foundation, but we need to add the plumbing.",
            "weak_spots": ["Technical Nuance"]
        }

@app.post("/api/assessment/quiz")
def generate_quiz(data: QuizRequest):
    # Mocking 10 question quiz
    return {
        "questions": [
            {"id": 1, "question": "What does RAG stand for?", "options": ["Retrieval Augmented Generation", "Random Access Gate"], "answer": "Retrieval Augmented Generation"},
            # ... more questions
        ]
    }

@app.get("/api/projects/weekly")
async def get_weekly_projects(role: str):
    # Tiered progression for the week
    projects = [
        {
            "tier": "EASY",
            "title": "Basic RAG Explorer",
            "difficulty": "Easy",
            "estimate": "2-3 hours",
            "template": "https://github.com/skillmap/basic-rag-starter",
            "tasks": ["Setup environment", "Load a PDF", "Query with simple prompt"],
            "skills_gained": ["Python", "PDF Parsing", "OpenAI/Gemini Basics"]
        },
        {
            "tier": "MEDIUM",
            "title": "Context-Aware Career Coach",
            "difficulty": "Medium",
            "estimate": "6-8 hours",
            "template": "https://github.com/skillmap/career-coach-v1",
            "tasks": ["Implement Vector DB", "Add Chat History", "System Prompt Engineering"],
            "skills_gained": ["ChromaDB/Pinecone", "LangChain", "Memory Management"]
        },
        {
            "tier": "ADVANCED",
            "title": "Autonomous Skill-Gap Agent",
            "difficulty": "Advanced",
            "estimate": "15-20 hours",
            "template": "https://github.com/skillmap/autonomous-agent-pro",
            "tasks": ["Multi-Agent Orchestration", "Tool Calling Integration", "Evaluation Framework"],
            "skills_gained": ["CrewAI/AutoGPT", "API Integration", "Agentic Evaluation"]
        }
    ]
    return {"weekly_mission": projects}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
