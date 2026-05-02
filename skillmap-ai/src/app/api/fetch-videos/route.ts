import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function POST(req: Request) {
  try {
    const { 
      topic, subtopic, preferred_language,
      learning_mode, cgpa, semester,
      certificate_preference, certificate_platform
    } = await req.json();

    // Student level logic
    let student_level = 'intermediate';
    const cgpaNum = parseFloat(cgpa);
    if (cgpaNum < 6) student_level = 'beginner';
    else if (cgpaNum > 7.5) student_level = 'advanced';

    // Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('video_cache')
      .select('videos_json, cached_at')
      .eq('topic', topic)
      .eq('subtopic', subtopic)
      .eq('learning_mode', learning_mode)
      .eq('student_level', student_level)
      .eq('language', preferred_language)
      .single();

    if (cachedData && !cacheError) {
      const cachedAt = new Date(cachedData.cached_at);
      const now = new Date();
      const diffDays = (now.getTime() - cachedAt.getTime()) / (1000 * 3600 * 24);
      
      if (diffDays < 7) {
        return NextResponse.json({ videos: cachedData.videos_json });
      }
    }

    // Build YouTube query
    let query = `${topic} ${subtopic} ${preferred_language}`;
    if (learning_mode === 'free') {
      if (student_level === 'beginner') {
        query += " tutorial for beginners freeCodeCamp OR CS50 OR MIT OR Corey Schafer";
      } else if (student_level === 'intermediate') {
        query += " MIT OR Stanford OR Traversy Media OR Fireship";
      } else {
        query += " advanced MIT OR CMU OR conference talk OR system design";
      }
    } else {
      query += " Udemy OR Coursera OR ZeroToMastery OR FrontendMasters preview OR Pluralsight";
    }

    if (certificate_preference !== 'none' && certificate_platform) {
      query += ` OR ${certificate_platform} official course`;
    }

    // Call YouTube API
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=relevance&maxResults=8&key=${YOUTUBE_API_KEY}`
    );
    const ytData = await ytRes.json();

    if (!ytData.items) {
      return NextResponse.json({ videos: [] });
    }

    // Transform and filter
    const videos = ytData.items.map((item: any) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.high.url,
      channel: item.snippet.channelTitle,
      is_free: learning_mode === 'free',
      level_match: student_level,
      why_recommended: `Tailored for your ${student_level} level in ${topic}.`
    })).slice(0, 3);

    // Update cache
    await supabase.from('video_cache').upsert({
      topic,
      subtopic,
      learning_mode,
      student_level,
      language: preferred_language,
      videos_json: videos,
      cached_at: new Date().toISOString()
    }, { onConflict: 'topic,subtopic,learning_mode,student_level,language' });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error in fetch-videos API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
