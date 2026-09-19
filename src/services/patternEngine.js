import { supabase } from '../lib/supabase';
import { calculateTrustScoreEngine } from './trustScore';

export const evaluateGridZone = async (gridZone, approxLat = 51.505, approxLng = -0.09) => {
  // 1. Fetch recent signals in this zone (last 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: signals, error: signalError } = await supabase
    .from('safety_signals')
    .select('*')
    .eq('grid_zone', gridZone)
    .gte('reported_at', twentyFourHoursAgo);

  if (signalError) {
    console.error("Error fetching signals for evaluation", signalError);
    return;
  }

  // MVP threshold: At least 1 report to form a pattern for immediate demo feedback
  if (!signals || signals.length < 1) return;

  const categories = [...new Set(signals.map(s => s.category))];
  
  // Calculate Trust Score using the new Engine
  const { finalScore: trustScore, breakdown } = calculateTrustScoreEngine(signals);

  // Determine priority
  let priority = 'low';
  if (trustScore > 80 && signals.length >= 3) priority = 'critical';
  else if (trustScore > 60) priority = 'high';
  else if (trustScore > 40) priority = 'medium';

  // 3. Upsert pattern for this zone
  // Check if an emerging/under_review pattern exists for this zone
  const { data: existingPatterns } = await supabase
    .from('safety_patterns')
    .select('*')
    .eq('grid_zone', gridZone)
    .in('status', ['emerging', 'under_review'])
    .limit(1);

  const oldestTime = new Date(Math.min(...signals.map(s => new Date(s.reported_at).getTime())));
  const newestTime = new Date(Math.max(...signals.map(s => new Date(s.reported_at).getTime())));

  const patternData = {
    grid_zone: gridZone,
    start_time: oldestTime.toISOString(),
    end_time: newestTime.toISOString(),
    report_count: signals.length,
    categories,
    trust_score: trustScore,
    reporter_diversity: breakdown.reporterDiversity,
    time_spread: breakdown.timeSpread,
    category_diversity: breakdown.categoryDiversity,
    burst_penalty: breakdown.burstPenalty,
    priority,
    status: existingPatterns?.length ? existingPatterns[0].status : 'emerging',
    updated_at: new Date().toISOString()
  };

  if (existingPatterns && existingPatterns.length > 0) {
    // Update existing pattern
    await supabase
      .from('safety_patterns')
      .update(patternData)
      .eq('id', existingPatterns[0].id);
  } else {
    // Create new pattern
    await supabase
      .from('safety_patterns')
      .insert([patternData]);
  }

  // 4. Update Safety Zone activity level
  let activityLevel = 'low';
  if (priority === 'critical' || priority === 'high') activityLevel = 'high_priority';
  else if (priority === 'medium') activityLevel = 'emerging';
  else activityLevel = 'under_review';

  // Try to update existing zone first
  const { data: updatedZone, error: updateError } = await supabase
    .from('safety_zones')
    .update({ activity_level: activityLevel, updated_at: new Date().toISOString() })
    .eq('grid_zone', gridZone)
    .select();

  // If zone doesn't exist, insert it
  if (!updatedZone || updatedZone.length === 0) {
    await supabase
      .from('safety_zones')
      .insert([{
        zone_name: gridZone,
        grid_zone: gridZone,
        center_lat: approxLat,
        center_lng: approxLng,
        activity_level: activityLevel
      }]);
  }
};
