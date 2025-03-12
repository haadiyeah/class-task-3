-- Insert some sample cities
INSERT INTO searches (city, search_time) VALUES
  ('London', NOW() - INTERVAL '1 HOUR'),
  ('New York', NOW() - INTERVAL '2 HOUR'),
  ('Tokyo', NOW() - INTERVAL '3 HOUR');