-- Experiences: id, title, company, period, description, side
CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('left', 'right'))
);

-- Projects: id, title, description, fullDescription, image, tags (JSON), liveUrl, githubUrl, metrics (JSON)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  fullDescription TEXT NOT NULL,
  image TEXT NOT NULL,
  tags TEXT NOT NULL,
  liveUrl TEXT NOT NULL,
  githubUrl TEXT NOT NULL,
  metrics TEXT NOT NULL
);

-- Settings: resumePath (single row)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  resumePath TEXT NOT NULL DEFAULT '/resume/Resume.pdf'
);

INSERT OR IGNORE INTO settings (id, resumePath) VALUES (1, '/resume/Resume.pdf');

-- About: single row (id=1)
CREATE TABLE IF NOT EXISTS about (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  education TEXT NOT NULL DEFAULT '',
  availability TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '[]',
  image TEXT NOT NULL DEFAULT ''
);
INSERT OR IGNORE INTO about (id, name, email, education, availability, bio, image) VALUES (1, '', '', '', '', '[]', '');

-- Contact: single row (id=1), items = JSON array
CREATE TABLE IF NOT EXISTS contact (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  items TEXT NOT NULL DEFAULT '[]'
);
INSERT OR IGNORE INTO contact (id, items) VALUES (1, '[]');
