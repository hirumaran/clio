-- Drop tables in reverse dependency order for clean re-runs
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS device_tokens CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS borrow_requests CASCADE;
DROP TABLE IF EXISTS item_images CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Schools
CREATE TABLE schools (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  domain        VARCHAR(255) UNIQUE,
  location      VARCHAR(255),
  slug          VARCHAR(255) UNIQUE,
  address       TEXT,
  logo_url      TEXT,
  contact_email VARCHAR(255),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schools_slug     ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON schools(is_active);

-- Users
CREATE TABLE users (
  id                   SERIAL PRIMARY KEY,
  school_id            INTEGER REFERENCES schools(id) ON DELETE SET NULL,
  email                VARCHAR(255) NOT NULL UNIQUE,
  password_hash        VARCHAR(255) NOT NULL,
  first_name           VARCHAR(100),
  last_name            VARCHAR(100),
  avatar_url           TEXT,
  bio                  TEXT,
  role                 VARCHAR(50) DEFAULT 'user',
  is_active            BOOLEAN DEFAULT TRUE,
  last_login           TIMESTAMP,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  matrix_user_id       TEXT UNIQUE,
  matrix_access_token  TEXT,
  matrix_device_id     TEXT,
  matrix_password_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_matrix_id      ON users(matrix_user_id);
CREATE INDEX IF NOT EXISTS idx_users_school_id       ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_school_active   ON users(school_id, is_active);

-- Categories
CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  icon       VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items (resources to share)
CREATE TABLE items (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id        INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  school_id          INTEGER REFERENCES schools(id) ON DELETE SET NULL,
  added_by           INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title              VARCHAR(255) NOT NULL,
  name               VARCHAR(255),
  description        TEXT,
  condition          VARCHAR(100),
  status             VARCHAR(50) DEFAULT 'available',
  quantity_total     INTEGER DEFAULT 1,
  quantity_available INTEGER DEFAULT 1,
  is_active          BOOLEAN DEFAULT TRUE,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_category_id    ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_school_id      ON items(school_id);
CREATE INDEX IF NOT EXISTS idx_items_school_active  ON items(school_id, is_active);
CREATE INDEX IF NOT EXISTS idx_items_status_active  ON items(status, is_active);
CREATE INDEX IF NOT EXISTS idx_items_added_by       ON items(added_by);

-- Item Images
CREATE TABLE item_images (
  id                   SERIAL PRIMARY KEY,
  item_id              INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  image_url            TEXT NOT NULL,
  cloudinary_public_id VARCHAR(255),
  sort_order           INTEGER DEFAULT 0,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Borrow Requests (state machine — see migration 011)
CREATE TABLE borrow_requests (
  id                  SERIAL PRIMARY KEY,
  item_id             INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  requester_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requester_school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
  owner_school_id     INTEGER REFERENCES schools(id) ON DELETE SET NULL,
  status              VARCHAR(50) DEFAULT 'pending',
  requested_date      DATE,
  return_date         DATE,
  requester_note      TEXT,
  owner_note          TEXT,
  quantity_requested  INTEGER DEFAULT 1,
  matrix_room_id      VARCHAR(255),
  approved_at         TIMESTAMP,
  picked_up_at        TIMESTAMP,
  returned_at         TIMESTAMP,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_item_id              ON borrow_requests(item_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester_id         ON borrow_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_status               ON borrow_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_owner_school_id      ON borrow_requests(owner_school_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester_school_id  ON borrow_requests(requester_school_id);
CREATE INDEX IF NOT EXISTS idx_br_item_status_dates          ON borrow_requests(item_id, status, requested_date, return_date);
CREATE INDEX IF NOT EXISTS idx_br_owner_school               ON borrow_requests(owner_school_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_br_requester                  ON borrow_requests(requester_id, created_at DESC);

-- Conversations (threaded around an item between borrower and lender)
CREATE TABLE conversations (
  id          SERIAL PRIMARY KEY,
  item_id     INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  borrower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  read            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL
              CHECK (type IN (
                'borrow_request', 'approved', 'rejected', 'cancelled',
                'picked_up', 'returned', 'overdue', 'system'
              )),
  title       VARCHAR(200) NOT NULL,
  body        TEXT,
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_unread
  ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read)
  WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- Refresh Tokens (JWT refresh token rotation)
CREATE TABLE refresh_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  revoked     BOOLEAN DEFAULT FALSE,
  device_info TEXT
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
  ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash
  ON refresh_tokens(token_hash);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user_id
  ON password_reset_tokens(user_id);

-- Device push tokens for mobile (APNs) and web (FCM) push notifications
CREATE TABLE device_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id
  ON device_tokens(user_id);

-- Seed schools
INSERT INTO schools (name, domain, location) VALUES
('University of Example', 'example.edu', 'Example City, EX'),
('Sample State College', 'sample.edu', 'Sample Town, SM'),
('Tech Institute', 'tech.edu', 'Tech City, TC');

-- Backfill slugs from school names
UPDATE schools
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'))
WHERE slug IS NULL;

-- Seed categories (theatre-specific — must match frontend ResourceCategory union)
INSERT INTO categories (name, icon) VALUES
('Scripts', 'scripts'),
('Lesson Plans', 'lesson-plans'),
('Costumes', 'costumes'),
('Props', 'props'),
('Lighting', 'lighting'),
('Sound', 'sound'),
('Set Design', 'set-design'),
('Makeup', 'makeup'),
('Music', 'music'),
('Other', 'other');
