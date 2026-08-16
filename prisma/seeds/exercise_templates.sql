-- Insert sample exercise templates into exercises_templates (let id autoincrement)
INSERT INTO exercises_templates (name, tags) VALUES
  ('Barbell Bench Press', '["push","chest"]'::jsonb),
  ('Pull Up', '["pull","back"]'::jsonb),
  ('Deadlift', '["pull","posterior_chain"]'::jsonb)
ON CONFLICT DO NOTHING;
