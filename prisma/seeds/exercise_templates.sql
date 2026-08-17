-- Insert sample exercises into exercises (let id autoincrement)
INSERT INTO exercises (name, tags) VALUES
  ('Barbell Bench Press', '["push","chest"]'::jsonb),
  ('Pull Up', '["pull","back"]'::jsonb),
  ('Deadlift', '["pull","posterior_chain"]'::jsonb)
ON CONFLICT DO NOTHING;
