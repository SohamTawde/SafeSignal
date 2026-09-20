import { supabase } from '../lib/supabase';
import { calculateTrustScoreEngine } from './trustScore';

export const evaluateGridZone = async (gridZone, approxLat = 51.505, approxLng = -0.09, recentSignal = null) => {
  if (!gridZone) return;

  // 1. Fetch recent signals in this zone (last 24 hours) if accessible
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  let signals = null;
  try {
    const { data, error } = await supabase
      .from('safety_signals')
      .select('*')
      .eq('grid_zone', gridZone)
      .gte('reported_at', twentyFourHoursAgo);

    if (!error && data && data.length > 0) {
      signals = data;
    }
  } catch (signalError) {
    console.warn("Notice: safety_signals select restricted (expected for anonymous client RLS)");
  }

  // 2. Fetch existing pattern for this zone (public has full read/write on safety_patterns)
  const { data: existingPatterns } = await supabase
    .from('safety_patterns')
    .select('*')
    .eq('grid_zone', gridZone)
    .in('status', ['emerging', 'under_review'])
    .order('updated_at', { ascending: false })
    .limit(1);

  const existingPattern = existingPatterns && existingPatterns.length > 0 ? existingPatterns[0] : null;

  let patternData = null;

  if (signals && signals.length > 0) {
    // When full signals are readable, use complete engine calculations
    const categories = [...new Set(signals.map(s => s.category))];
    const { finalScore: trustScore, breakdown } = calculateTrustScoreEngine(signals);

    let priority = 'low';
    if (trustScore > 80 && signals.length >= 3) priority = 'critical';
    else if (trustScore > 60) priority = 'high';
    else if (trustScore > 40) priority = 'medium';

    const oldestTime = new Date(Math.min(...signals.map(s => new Date(s.reported_at).getTime())));
    const newestTime = new Date(Math.max(...signals.map(s => new Date(s.reported_at).getTime())));

    patternData = {
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
      status: existingPattern ? existingPattern.status : 'emerging',
      updated_at: new Date().toISOString()
    };
  } else if (recentSignal) {
    // Fallback: aggregate based on the recent signal and existing pattern in safety_patterns
    const cat = recentSignal.category || 'other';
    const reportTime = recentSignal.reported_at || new Date().toISOString();

    if (existingPattern) {
      const prevCount = Number(existingPattern.report_count) || 1;
      const prevCategories = Array.isArray(existingPattern.categories) ? existingPattern.categories : [];
      const updatedCategories = Array.from(new Set([...prevCategories, cat]));
      const newCount = prevCount + 1;
      
      const newTrust = Math.min(95, Math.max(35, (Number(existingPattern.trust_score) || 40) + 12));
      let priority = 'low';
      if (newTrust > 80 && newCount >= 3) priority = 'critical';
      else if (newTrust > 60) priority = 'high';
      else if (newTrust > 40) priority = 'medium';

      patternData = {
        grid_zone: gridZone,
        start_time: existingPattern.start_time || reportTime,
        end_time: reportTime,
        report_count: newCount,
        categories: updatedCategories,
        trust_score: newTrust,
        reporter_diversity: Math.min(100, Math.round((newCount / (newCount + 0.5)) * 100)),
        time_spread: Math.min(100, (Number(existingPattern.time_spread) || 20) + 15),
        category_diversity: Math.min(100, updatedCategories.length * 25),
        burst_penalty: 0,
        priority,
        status: existingPattern.status || 'emerging',
        updated_at: new Date().toISOString()
      };
    } else {
      patternData = {
        grid_zone: gridZone,
        start_time: reportTime,
        end_time: reportTime,
        report_count: 1,
        categories: [cat],
        trust_score: 55,
        reporter_diversity: 100,
        time_spread: 10,
        category_diversity: 25,
        burst_penalty: 0,
        priority: 'medium',
        status: 'emerging',
        updated_at: new Date().toISOString()
      };
    }
  }

  if (!patternData) return;

  // 3. Upsert pattern for this zone
  if (existingPattern) {
    await supabase
      .from('safety_patterns')
      .update(patternData)
      .eq('id', existingPattern.id);
  } else {
    await supabase
      .from('safety_patterns')
      .insert([patternData]);
  }

  // 4. Update Safety Zone activity level
  let activityLevel = 'low';
  if (patternData.priority === 'critical' || patternData.priority === 'high') activityLevel = 'high_priority';
  else if (patternData.priority === 'medium') activityLevel = 'emerging';
  else activityLevel = 'under_review';

  // Try to update existing zone first
  const { data: updatedZone } = await supabase
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
