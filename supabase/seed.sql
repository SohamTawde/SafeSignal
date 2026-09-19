-- Clear previous mock data
DELETE FROM reviews;
DELETE FROM safety_patterns;
DELETE FROM safety_signals;
DELETE FROM safety_zones;

-- Insert Mock Safety Zones
INSERT INTO safety_zones (zone_name, grid_zone, center_lat, center_lng, activity_level)
VALUES 
    ('Downtown Station', 'ZONE-A-014', 40.7128, -74.0060, 'emerging'),
    ('University Campus', 'ZONE-B-022', 40.7138, -74.0050, 'low'),
    ('Park Avenue', 'ZONE-C-105', 40.7118, -74.0070, 'under_review'),
    ('Northside Alley', 'ZONE-D-088', 40.7148, -74.0080, 'high_priority');

-- Insert Mock Safety Signals
INSERT INTO safety_signals (grid_zone, category, status, trust_score, reporter_diversity, time_spread, category_diversity, burst_penalty)
VALUES 
    ('ZONE-A-014', 'catcalling', 'aggregated', 65, 30, 20, 15, 0),
    ('ZONE-A-014', 'following', 'aggregated', 65, 30, 20, 15, 0),
    ('ZONE-C-105', 'suspicious_behavior', 'aggregated', 82, 40, 25, 20, 3),
    ('ZONE-D-088', 'verbal_harassment', 'aggregated', 95, 45, 30, 25, 5),
    ('ZONE-D-088', 'threatening_behavior', 'aggregated', 95, 45, 30, 25, 5);

-- Insert Mock Safety Patterns
INSERT INTO safety_patterns (grid_zone, start_time, end_time, report_count, categories, trust_score, priority, status)
VALUES 
    (
        'ZONE-A-014', 
        timezone('utc'::text, now()) - interval '2 days', 
        timezone('utc'::text, now()), 
        2, 
        '["catcalling", "following"]'::jsonb, 
        65, 
        'medium', 
        'emerging'
    ),
    (
        'ZONE-C-105', 
        timezone('utc'::text, now()) - interval '1 days', 
        timezone('utc'::text, now()), 
        4, 
        '["suspicious_behavior", "other"]'::jsonb, 
        82, 
        'high', 
        'under_review'
    ),
    (
        'ZONE-D-088', 
        timezone('utc'::text, now()) - interval '5 hours', 
        timezone('utc'::text, now()), 
        8, 
        '["verbal_harassment", "threatening_behavior"]'::jsonb, 
        95, 
        'critical', 
        'validated'
    );
