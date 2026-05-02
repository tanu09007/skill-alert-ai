import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_param = searchParams.get('user_id');

  if (!id_param) {
    return NextResponse.json({ error: 'User ID or Email is required' }, { status: 400 });
  }

  // 1. Get Profile — try UUID first, then email (two separate queries to avoid type mismatch)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_param);

  let profile: any = null;

  if (isUUID) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id_param)
      .maybeSingle();
    profile = data;
  }

  // If not found by UUID or it was an email, try email lookup
  if (!profile) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', id_param)
      .maybeSingle();
    profile = data;
  }

  if (!profile) {
    console.warn('Profile not found for:', id_param, '— returning empty dashboard state.');
    return NextResponse.json({
      warning: 'Profile not found. Showing empty state.',
      streak: 0,
      topics_done: 0,
      topics_total: 20,
      avg_score: '0.0',
      completion_pct: 0,
      current_week: 1,
      total_weeks: 8,
      roadmap_name: 'No Roadmap Active',
      calendar_data: [],
      skill_mastery: [],
      velocity_data: [],
      recent_activity: [],
      weak_topics: []
    });
  }

  const userId = profile.id;

  try {
    const [
      roadmap,
      skillPlan,
      allSessions,
      completedSessions,
      assessments,
      assignments,
      progressLogs,
      placementData
    ] = await Promise.all([
      // 1. Latest roadmap
      supabase.from('roadmaps')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // 2. Chosen skills
      supabase.from('skill_plans')
        .select('chosen_skills')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // 3. All learning sessions
      supabase.from('learning_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('actual_date', { ascending: true }),

      // 4. Completed sessions only
      supabase.from('learning_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('completed_at', { ascending: false }),

      // 5. All assessments
      supabase.from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      // 6. All assignments
      supabase.from('assignments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      // 7. Progress logs (one row per day)
      supabase.from('progress_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(90),

      // 8. Placement score
      supabase.from('placement_readiness')
        .select('score, tier')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    // STREAK calculation
    function calculateStreak(logs: any[]) {
      if (!logs || logs.length === 0) return 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let checkDate = new Date(today);
      
      const activeDates = new Set(
        logs.map(log => new Date(log.date).toDateString())
      );
      
      if (!activeDates.has(today.toDateString())) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (!activeDates.has(checkDate.toDateString())) {
          return 0;
        }
      }
      
      while (activeDates.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      return streak;
    }

    const topicsDone = completedSessions.data?.length ?? 0;
    const topicsTotal = allSessions.data?.length ?? 0;

    const scores = assessments.data?.filter(a => a.score !== null).map(a => a.score) ?? [];
    const avgScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

    const completionPct = topicsTotal > 0 ? Math.round((topicsDone / topicsTotal) * 100) : 0;

    const roadmapStart = roadmap.data?.start_date ? new Date(roadmap.data.start_date) : new Date();
    const daysSinceStart = Math.floor((new Date().getTime() - roadmapStart.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(daysSinceStart / 7) + 1;
    const totalWeeks = roadmap.data?.weeks_total ?? 8;

    const skillName = skillPlan.data?.chosen_skills?.join(' + ') ?? 'Your Skill';
    const roadmapName = skillName + ' Roadmap';

    // 90-DAY ACTIVITY CALENDAR
    const calendarData = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toDateString();
      
      const log = progressLogs.data?.find(
        l => new Date(l.date).toDateString() === dateStr
      );
      
      calendarData.push({
        date: date.toISOString().split('T')[0],
        formatted: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        activity_level: log 
          ? (log.topics_covered?.length >= 3 ? 4
            : log.topics_covered?.length === 2 ? 3
            : log.topics_covered?.length === 1 ? 2
            : 1)
          : 0,
        topics_covered: log?.topics_covered ?? [],
        score: log?.score_avg ?? null
      });
    }

    // SKILL MASTERY
    const skillMastery = [];
    const skills = skillPlan.data?.chosen_skills ?? [];
    for (const skill of skills) {
      const skillAssessments = assessments.data?.filter(
        a => a.topic?.toLowerCase().includes(skill.toLowerCase())
      ) ?? [];
      
      const masteryScore = skillAssessments.length > 0
        ? Math.round(skillAssessments.reduce((a, b) => a + (b.score ?? 0), 0) / skillAssessments.length * 10)
        : 0;
      
      skillMastery.push({
        skill: skill,
        mastery: masteryScore,
        sessions_completed: skillAssessments.length
      });
    }

    // LEARNING VELOCITY
    const velocityData = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toDateString();
      
      const log = progressLogs.data?.find(
        l => new Date(l.date).toDateString() === dateStr
      );
      
      velocityData.push({
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        topics: log?.topics_covered?.length ?? 0,
        score: log?.score_avg ?? 0
      });
    }

    // RECENT ACTIVITY
    const recentActivity: any[] = [];
    completedSessions.data?.slice(0, 3).forEach(s => {
      recentActivity.push({
        type: 'learning',
        label: 'Completed: ' + s.topic,
        time: s.completed_at,
        detail: s.subtopic ?? ''
      });
    });

    assessments.data?.slice(0, 2).forEach(a => {
      recentActivity.push({
        type: 'assessment',
        label: 'Assessment: ' + a.topic,
        time: a.created_at,
        detail: 'Score: ' + (a.score ?? 0) + '/10'
      });
    });

    assignments.data?.filter(a => a.submitted).slice(0, 2).forEach(a => {
      recentActivity.push({
        type: 'assignment',
        label: 'Submitted: ' + a.title,
        time: a.updated_at,
        detail: a.type
      });
    });

    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // WEAK TOPICS
    const weakTopicsSet = new Set<string>();
    progressLogs.data?.forEach(log => {
      log.weak_topics?.forEach((t: string) => weakTopicsSet.add(t));
    });

    assessments.data?.filter(a => a.score !== null && a.score < 6).forEach(a => weakTopicsSet.add(a.topic));

    const weakTopics = Array.from(weakTopicsSet).slice(0, 5).map(topic => {
      const relatedLog = progressLogs.data?.find(l => l.weak_topics?.includes(topic));
      const relatedAssessment = assessments.data?.find(a => a.topic === topic);
      return {
        topic,
        score: relatedAssessment?.score ?? null,
        date: relatedLog?.date ?? relatedAssessment?.created_at,
        needs_review: true
      };
    });

    return NextResponse.json({
      skill_name: skillName,
      roadmap_name: roadmapName,
      current_week: currentWeek,
      total_weeks: totalWeeks,
      streak: calculateStreak(progressLogs.data ?? []),
      topics_done: topicsDone,
      topics_total: topicsTotal,
      avg_score: avgScore,
      completion_pct: completionPct,
      placement_score: placementData.data?.score ?? 0,
      calendar_data: calendarData,
      skill_mastery: skillMastery,
      velocity_data: velocityData,
      recent_activity: recentActivity,
      weak_topics: weakTopics
    });

  } catch (error: any) {
    console.error('Progress summary error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
