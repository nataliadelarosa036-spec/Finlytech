-- ============================================================
-- FinPilot — Schema MySQL
-- Ejecutar UNA VEZ para crear la base de datos
-- ============================================================

CREATE DATABASE IF NOT EXISTS finlytech
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE finlytech;

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NULL,         -- NULL si se registró con Google
  avatar_color  VARCHAR(7)    NOT NULL DEFAULT '#13a8a1',
  currency      VARCHAR(3)    NOT NULL DEFAULT 'COP',
  locale        VARCHAR(10)   NOT NULL DEFAULT 'es-CO',
  mode          ENUM('simple','advanced') NOT NULL DEFAULT 'simple',
  monthly_income_goal DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- OAuth
  google_id     VARCHAR(255)  NULL UNIQUE,
  google_email  VARCHAR(255)  NULL,
  avatar_url    VARCHAR(500)  NULL,

  -- Estado de cuenta
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
  email_verified_at DATETIME  NULL,

  -- Términos y condiciones
  accepted_terms    BOOLEAN   NOT NULL DEFAULT FALSE,
  accepted_terms_at DATETIME  NULL,
  terms_version     VARCHAR(10) NULL,

  -- Timestamps
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME      NULL,

  INDEX idx_email (email),
  INDEX idx_google_id (google_id)
) ENGINE=InnoDB;

-- ─── REFRESH TOKENS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  user_id     CHAR(36)      NOT NULL,
  token_hash  VARCHAR(255)  NOT NULL UNIQUE,
  device_info VARCHAR(500)  NULL,
  ip_address  VARCHAR(45)   NULL,
  expires_at  DATETIME      NOT NULL,
  revoked     BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB;

-- ─── EMAIL VERIFICATION TOKENS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_tokens (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  type       ENUM('verify','reset_password') NOT NULL,
  expires_at DATETIME     NOT NULL,
  used       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB;

-- ─── ACCOUNTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id                   CHAR(36)     NOT NULL PRIMARY KEY,
  user_id              CHAR(36)     NOT NULL,
  name                 VARCHAR(100) NOT NULL,
  type                 ENUM('checking','savings','credit','cash','investment') NOT NULL,
  balance              DECIMAL(15,2) NOT NULL DEFAULT 0,
  institution          VARCHAR(100) NOT NULL,
  color                VARCHAR(7)   NOT NULL DEFAULT '#13a8a1',
  included_in_net_worth BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── CATEGORIES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id        CHAR(36)     NOT NULL PRIMARY KEY,
  user_id   CHAR(36)     NOT NULL,
  name      VARCHAR(100) NOT NULL,
  icon      VARCHAR(10)  NOT NULL,
  color     VARCHAR(7)   NOT NULL DEFAULT '#13a8a1',
  kind      ENUM('income','expense') NOT NULL,
  parent_id CHAR(36)     NULL,
  is_default BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)   REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  user_id     CHAR(36)     NOT NULL,
  type        ENUM('income','expense','transfer','debt','payment','saving','investment') NOT NULL,
  amount      DECIMAL(15,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category_id CHAR(36)     NOT NULL,
  account_id  CHAR(36)     NOT NULL,
  date        DATETIME     NOT NULL,
  note        TEXT         NULL,
  recurring   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)     REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE RESTRICT,
  FOREIGN KEY (account_id)  REFERENCES accounts(id)    ON DELETE RESTRICT,
  INDEX idx_user_id   (user_id),
  INDEX idx_date      (date),
  INDEX idx_type      (type)
) ENGINE=InnoDB;

-- ─── BUDGETS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  user_id     CHAR(36)      NOT NULL,
  category_id CHAR(36)      NOT NULL,
  amount_limit DECIMAL(15,2) NOT NULL,
  spent       DECIMAL(15,2) NOT NULL DEFAULT 0,
  period      ENUM('monthly') NOT NULL DEFAULT 'monthly',
  month       CHAR(7)       NOT NULL,  -- formato YYYY-MM
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY uq_budget (user_id, category_id, month),
  INDEX idx_user_month (user_id, month)
) ENGINE=InnoDB;

-- ─── GOALS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id                   CHAR(36)      NOT NULL PRIMARY KEY,
  user_id              CHAR(36)      NOT NULL,
  name                 VARCHAR(100)  NOT NULL,
  emoji                VARCHAR(10)   NOT NULL DEFAULT '🎯',
  target_amount        DECIMAL(15,2) NOT NULL,
  current_amount       DECIMAL(15,2) NOT NULL DEFAULT 0,
  target_date          DATE          NOT NULL,
  monthly_contribution DECIMAL(15,2) NOT NULL DEFAULT 0,
  color                VARCHAR(7)    NOT NULL DEFAULT '#13a8a1',
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── DEBTS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debts (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  user_id          CHAR(36)      NOT NULL,
  name             VARCHAR(100)  NOT NULL,
  balance          DECIMAL(15,2) NOT NULL,
  original_balance DECIMAL(15,2) NOT NULL,
  interest_rate    DECIMAL(5,2)  NOT NULL,
  min_payment      DECIMAL(15,2) NOT NULL,
  due_date         DATE          NOT NULL,
  type             ENUM('card','loan','other') NOT NULL DEFAULT 'other',
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  user_id       CHAR(36)      NOT NULL,
  name          VARCHAR(100)  NOT NULL,
  amount        DECIMAL(15,2) NOT NULL,
  period        ENUM('monthly','yearly') NOT NULL DEFAULT 'monthly',
  next_charge   DATE          NOT NULL,
  category      VARCHAR(100)  NOT NULL,
  emoji         VARCHAR(10)   NOT NULL DEFAULT '📱',
  active        BOOLEAN       NOT NULL DEFAULT TRUE,
  months_unused TINYINT       NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── CARDS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cards (
  id         CHAR(36)      NOT NULL PRIMARY KEY,
  user_id    CHAR(36)      NOT NULL,
  name       VARCHAR(100)  NOT NULL,
  number     VARCHAR(20)   NOT NULL DEFAULT '',
  card_limit DECIMAL(15,2) NOT NULL DEFAULT 0,
  balance    DECIMAL(15,2) NOT NULL DEFAULT 0,
  due_date   DATE          NOT NULL,
  color      VARCHAR(7)    NOT NULL DEFAULT '#8b5cf6',
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── INVESTMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  user_id       CHAR(36)      NOT NULL,
  name          VARCHAR(100)  NOT NULL,
  type          VARCHAR(50)   NOT NULL,
  invested      DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  return_pct    DECIMAL(7,2)  NOT NULL DEFAULT 0,
  dividends     DECIMAL(15,2) NOT NULL DEFAULT 0,
  emoji         VARCHAR(10)   NOT NULL DEFAULT '📈',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── AUDIT LOG ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    CHAR(36)        NULL,
  action     VARCHAR(100)    NOT NULL,
  entity     VARCHAR(50)     NULL,
  entity_id  CHAR(36)        NULL,
  ip_address VARCHAR(45)     NULL,
  user_agent VARCHAR(500)    NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id  (user_id),
  INDEX idx_action   (action),
  INDEX idx_created  (created_at)
) ENGINE=InnoDB;

-- ─── TERMS VERSIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS terms_versions (
  version    VARCHAR(10)  NOT NULL PRIMARY KEY,
  content    TEXT         NOT NULL,
  effective_date DATE     NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insertar versión inicial de términos
INSERT IGNORE INTO terms_versions (version, content, effective_date) VALUES (
  '1.0',
  'Términos y Condiciones de FinPilot v1.0 — Septiembre 2026',
  '2026-09-01'
);
