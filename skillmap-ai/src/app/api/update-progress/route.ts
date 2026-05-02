import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { user_id: id_param, topic, score, type, weak_topics } = await req.json();

    if (!id_param) {
      return NextResponse.json({ error: 'User ID or Email is required' }, { status: 400 });
    }

    // 1. Resolve profile UUID — try UUID first, then email (avoid SQL type mismatch with .or())
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_param);

    let profileId: string | null = null;

    if (isUUID) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', id_param)
        .maybeSingle();
      profileId = data?.id || null;
    }

    if (!profileId) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', id_param)
        .maybeSingle();
      profileId = data?.id || null;
    }

    const userId = profileId || id_param;

    const today = new Date().toISOString().split('T')[0];

    // 2. Fetch current log for today (use maybeSingle to avoid crash on no row)
    const { data: currentLog } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    // 3. Prepare updated data
    const topicsCovered: string[] = currentLog?.topics_covered || [];
    if (topic && !topicsCovered.includes(topic)) {
      topicsCovered.push(topic);
    }

    let newAvgScore = score ?? currentLog?.score_avg ?? 0;
    if (score != null && currentLog?.score_avg != null) {
      newAvgScore = Math.round(((currentLog.score_avg + score) / 2) * 10) / 10;
    }

    const updatedWeakTopics: string[] = currentLog?.weak_topics || [];
    if (weak_topics && Array.isArray(weak_topics)) {
      weak_topics.forEach((t: string) => {
        if (!updatedWeakTopics.includes(t)) updatedWeakTopics.push(t);
      });
    }

    // 4. Upsert into progress_logs
    const { data, error } = await supabase
      .from('progress_logs')
      .upsert({
        user_id: userId,
        date: today,
        topics_covered: topicsCovered,
        score_avg: newAvgScore,
        weak_topics: updatedWeakTopics,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,date' })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update progress error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
