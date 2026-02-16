-- Seed experiment for H1: Pilot demand for Precision Labor Intelligence
INSERT INTO experiments (name, hypothesis, metric_name, baseline_value, target_value, current_value, status, started_at)
VALUES (
    'H1: Pilot demand for Precision Labor Intelligence',
    'Specialty crop growers will sign up for a free 2026 pilot program for Precision Labor Intelligence because labor cost reduction is their #1 unmet pain. Validation: ≥3% signup rate with ≥200 visitors within 30 days. Invalidation: <1.5% after 30 days with ≥200 visitors.',
    'pilot_signup_rate',
    0.0,
    3.0,
    0.0,
    'active',
    NOW()
)
ON CONFLICT DO NOTHING;
