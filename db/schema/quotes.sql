CREATE TABLE quotes (
  id TEXT PRIMARY KEY,
  text_ja TEXT NOT NULL,
  text_en TEXT,
  author_name TEXT,
  era TEXT,
  is_published BOOLEAN DEFAULT 1,
  image_path TEXT
); 