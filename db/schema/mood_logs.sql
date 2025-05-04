CREATE TABLE mood_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  mood TEXT CHECK(mood IN ('happy', 'tired', 'sad', 'anxious')),
  quote_id TEXT,  -- 表示された名言
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quote_id) REFERENCES quotes(id)
); 