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
