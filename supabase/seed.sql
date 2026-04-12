-- Default 8 tasks for Sailesh (the founder / first user)
-- Replace $USER_ID with the actual auth.uid() after signup

INSERT INTO tasks (user_id, name, type, target_value, target_unit, points, is_core, sort_order)
VALUES
  ('$USER_ID', 'Wake up 5:00–5:30 AM',                      'boolean',   1,   'boolean', 1.0, true, 1),
  ('$USER_ID', 'Morning cardio 30 min',                      'duration',  30,  'mins',    1.0, true, 2),
  ('$USER_ID', 'Study book 30 min',                          'duration',  30,  'mins',    1.0, true, 3),
  ('$USER_ID', 'University on time',                         'boolean',   1,   'boolean', 1.0, true, 4),
  ('$USER_ID', 'Gym session',                                'boolean',   1,   'boolean', 1.0, true, 5),
  ('$USER_ID', 'Study 2 hrs',                                'duration',  120, 'mins',    1.0, true, 6),
  ('$USER_ID', 'Self control (food / social media / NoFap)', 'scale_0_3', 3,   'points',  3.0, true, 7),
  ('$USER_ID', 'Sleep by 11 PM',                             'boolean',   1,   'boolean', 1.0, true, 8);

-- Also create the streak record for the user
INSERT INTO streaks (user_id, current_streak, longest_streak)
VALUES ('$USER_ID', 0, 0)
ON CONFLICT (user_id) DO NOTHING;
