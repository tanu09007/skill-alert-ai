export function getScoringLogic(score: number, total: number = 5) {
  if (total === 5) {
    if (score === 5) return { status: 'PERFECT', nextAction: 'advance_to_next_subtopic' };
    if (score === 4) return { status: 'PASS', nextAction: 'advance_to_next_subtopic' };
    if (score === 3) return { status: 'BORDERLINE FAIL', nextAction: 'review_and_retry' };
    if (score === 2) return { status: 'FAIL', nextAction: 'rewatch_video_section' };
    return { status: 'SERIOUS FAIL', nextAction: 'rewatch_full_video' };
  } else if (total === 20) {
    if (score >= 18) return { status: 'EXCELLENT', nextAction: 'advance_to_next_phase' };
    if (score >= 15) return { status: 'PASS', nextAction: 'advance_to_next_phase' };
    if (score >= 12) return { status: 'BORDERLINE', nextAction: 'rewatch_3_weakest_topics' };
    if (score >= 8) return { status: 'FAIL', nextAction: 'rewatch_all_weak_topics' };
    return { status: 'SERIOUS FAIL', nextAction: 'restart_entire_phase' };
  }
  return { status: 'UNKNOWN', nextAction: 'review' };
}
