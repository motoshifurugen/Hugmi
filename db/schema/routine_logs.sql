CREATE TABLE routine_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,            -- 例: '2025-05-04'
  routine_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('checked', 'skipped')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (routine_id) REFERENCES routines(id)
); 