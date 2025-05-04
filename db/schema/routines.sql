CREATE TABLE routines (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
); 