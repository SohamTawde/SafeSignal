-- SafeSignal Server-Side Pattern Engine Migration
-- Automatically aggregates safety signals into safety_patterns on the server upon INSERT

CREATE OR REPLACE FUNCTION public.evaluate_signal_pattern_trigger()
RETURNS trigger AS $$
DECLARE
    signal_count INT;
    unique_reporters INT;
    cat_list JSONB;
    oldest_ts TIMESTAMPTZ;
    newest_ts TIMESTAMPTZ;
    time_spread_hours NUMERIC;
    time_spread_score NUMERIC;
    reporter_diversity_score NUMERIC;
    category_diversity_score NUMERIC;
    burst_penalty_score NUMERIC;
    computed_trust_score NUMERIC;
    pattern_priority TEXT;
    target_pattern_id UUID;
    zone_activity TEXT;
BEGIN
    -- Query recent signals for this grid_zone within last 24 hours
    SELECT 
        COUNT(*),
        COUNT(DISTINCT COALESCE(anonymous_reporter_hash, id::text)),
        jsonb_agg(DISTINCT category),
        MIN(reported_at),
        MAX(reported_at)
    INTO 
        signal_count, 
        unique_reporters, 
        cat_list, 
        oldest_ts, 
        newest_ts
    FROM public.safety_signals
    WHERE grid_zone = NEW.grid_zone
      AND reported_at >= (NOW() - INTERVAL '24 hours');

    IF signal_count IS NULL OR signal_count < 1 THEN
        RETURN NEW;
    END IF;

    -- Reporter diversity (0-100)
    reporter_diversity_score := LEAST(100, ROUND((unique_reporters::numeric / signal_count::numeric) * 100));

    -- Time spread (0-100)
    time_spread_hours := EXTRACT(EPOCH FROM (newest_ts - oldest_ts)) / 3600.0;
    time_spread_score := LEAST(100, GREATEST(0, ROUND((time_spread_hours / 24.0) * 100)));

    -- Category diversity (0-100)
    category_diversity_score := LEAST(100, ROUND((jsonb_array_length(cat_list)::numeric / 4.0) * 100));

    -- Burst penalty: if >= 4 signals within 60 seconds
    IF signal_count >= 4 AND EXTRACT(EPOCH FROM (newest_ts - oldest_ts)) < 60 THEN
        burst_penalty_score := 100;
    ELSIF signal_count >= 4 AND EXTRACT(EPOCH FROM (newest_ts - oldest_ts)) < 300 THEN
        burst_penalty_score := 50;
    ELSE
        burst_penalty_score := 0;
    END IF;

    -- Base Trust calculation (35% reporter, 30% time, 20% category, -15% burst)
    IF signal_count = 1 THEN
        computed_trust_score := 15;
    ELSE
        computed_trust_score := GREATEST(0, ROUND(
            (reporter_diversity_score * 0.35) + 
            (time_spread_score * 0.30) + 
            (category_diversity_score * 0.20) - 
            (burst_penalty_score * 0.15)
        ));
    END IF;

    -- Determine Priority
    IF computed_trust_score > 80 AND signal_count >= 3 THEN
        pattern_priority := 'critical';
        zone_activity := 'high_priority';
    ELSIF computed_trust_score > 60 THEN
        pattern_priority := 'high';
        zone_activity := 'high_priority';
    ELSIF computed_trust_score > 40 THEN
        pattern_priority := 'medium';
        zone_activity := 'emerging';
    ELSE
        pattern_priority := 'low';
        zone_activity := 'under_review';
    END IF;

    -- Check if active pattern exists
    SELECT id INTO target_pattern_id
    FROM public.safety_patterns
    WHERE grid_zone = NEW.grid_zone
      AND status IN ('emerging', 'under_review')
    LIMIT 1;

    IF target_pattern_id IS NOT NULL THEN
        UPDATE public.safety_patterns
        SET 
            end_time = newest_ts,
            report_count = signal_count,
            categories = cat_list,
            trust_score = computed_trust_score,
            reporter_diversity = reporter_diversity_score,
            time_spread = time_spread_score,
            category_diversity = category_diversity_score,
            burst_penalty = burst_penalty_score,
            priority = pattern_priority,
            updated_at = NOW()
        WHERE id = target_pattern_id;
    ELSE
        INSERT INTO public.safety_patterns (
            grid_zone, start_time, end_time, report_count, categories,
            trust_score, reporter_diversity, time_spread, category_diversity,
            burst_penalty, priority, status, updated_at
        ) VALUES (
            NEW.grid_zone, oldest_ts, newest_ts, signal_count, cat_list,
            computed_trust_score, reporter_diversity_score, time_spread_score, category_diversity_score,
            burst_penalty_score, pattern_priority, 'emerging', NOW()
        );
    END IF;

    -- Update safety_zones activity_level
    UPDATE public.safety_zones
    SET activity_level = zone_activity, updated_at = NOW()
    WHERE grid_zone = NEW.grid_zone;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to safety_signals
DROP TRIGGER IF EXISTS on_signal_inserted_eval_pattern ON public.safety_signals;
CREATE TRIGGER on_signal_inserted_eval_pattern
    AFTER INSERT ON public.safety_signals
    FOR EACH ROW
    EXECUTE PROCEDURE public.evaluate_signal_pattern_trigger();
