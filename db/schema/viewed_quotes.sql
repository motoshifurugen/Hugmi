CREATE TABLE viewed_quotes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quote_id TEXT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quote_id) REFERENCES quotes(id)
); 