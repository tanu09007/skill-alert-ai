import { supabase } from './supabase';

export async function getVideosToRewatch(user_id: string, weak_concepts: string[]) {
  if (!weak_concepts || weak_concepts.length === 0) return [];
  
  try {
    const { data: sessions, error } = await supabase
      .from('learning_sessions')
      .select('id, video_url, topic, subtopic')
      .eq('user_id', user_id)
      .in('topic', weak_concepts);

    if (error) throw error;

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id);
      
      // Mark those sessions as needs_review: true
      await supabase
        .from('learning_sessions')
        .update({ needs_review: true })
        .in('id', sessionIds);
    }
    return sessions || [];
  } catch (err) {
    console.error("Error in getVideosToRewatch:", err);
    return [];
  }
}

export async function unlockRetake(user_id: string, assessment_id: string) {
  try {
    const { data: assessments, error: asError } = await supabase
      .from('assessments')
      .select('topic')
      .eq('id', assessment_id)
      .single();

    if (asError || !assessments) throw asError;

    // Check if there are any sessions for this user/topic that STILL need review
    const { data: needsReviewSessions, error } = await supabase
      .from('learning_sessions')
      .select('id')
      .eq('user_id', user_id)
      .eq('topic', assessments.topic)
      .eq('needs_review', true);

    if (error) throw error;

    if (!needsReviewSessions || needsReviewSessions.length === 0) {
      // All done, unlock retake
      await supabase
        .from('assessments')
        .update({ retake_unlocked: true })
        .eq('id', assessment_id);
      
      return { unlocked: true, remaining_videos: [] };
    } else {
      // Still need to review
      return { unlocked: false, remaining_videos: needsReviewSessions };
    }
  } catch (err) {
    console.error("Error in unlockRetake:", err);
    return { unlocked: false, remaining_videos: [] };
  }
}
