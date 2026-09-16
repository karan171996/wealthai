# WealthAI - Database Schema Design

## 📋 Overview

- **Database**: PostgreSQL 15+
- **Schema Format**: SQL with UUIDs as primary keys
- **Timezone**: UTC
- **Encoding**: UTF-8

---

## 🏗️ Core Tables

### 1. USERS & AUTHENTICATION

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_picture_url TEXT,
  date_of_birth DATE,
  account_status ENUM('ACTIVE', 'SUSPENDED', 'DELETED') DEFAULT 'ACTIVE',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  kyc_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'VERIFIED', 'REJECTED') DEFAULT 'NOT_STARTED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  INDEX idx_email (email),
  INDEX idx_phone (phone_number),
  INDEX idx_status (account_status),
  INDEX idx_created_at (created_at)
);

-- User profiles (extended info)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  occupation VARCHAR(255),
  income_range VARCHAR(50),
  risk_tolerance ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
  investment_experience ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
  financial_goals TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id)
);

-- User settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  default_currency VARCHAR(3) DEFAULT 'INR',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  theme ENUM('LIGHT', 'DARK', 'AUTO') DEFAULT 'AUTO',
  language VARCHAR(10) DEFAULT 'en',
  notifications_email BOOLEAN DEFAULT true,
  notifications_sms BOOLEAN DEFAULT true,
  notifications_whatsapp BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT true,
  budget_alerts BOOLEAN DEFAULT true,
  spending_alerts BOOLEAN DEFAULT true,
  investment_updates BOOLEAN DEFAULT true,
  promotional_emails BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id)
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token VARCHAR(512) UNIQUE,
  refresh_token VARCHAR(512) UNIQUE NOT NULL,
  access_token_expires_at TIMESTAMP NOT NULL,
  refresh_token_expires_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  revoked_at TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_refresh_token (refresh_token),
  INDEX idx_access_token (access_token),
  INDEX idx_expires_at (refresh_token_expires_at)
);

-- OAuth providers
CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_name VARCHAR(50) NOT NULL, -- 'GOOGLE', 'APPLE', 'FACEBOOK'
  provider_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  
  UNIQUE (provider_name, provider_user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_provider (provider_name)
);

-- MFA devices
CREATE TABLE mfa_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type ENUM('TOTP', 'SMS', 'EMAIL') NOT NULL,
  device_identifier VARCHAR(255),
  name VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_verified (verified)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(100),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

---

### 2. TRANSACTIONS & EXPENSES

```sql
-- Transaction categories
CREATE TABLE transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  color_code VARCHAR(7),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  category_id UUID REFERENCES transaction_categories(id),
  description TEXT,
  merchant_name VARCHAR(255),
  merchant_category VARCHAR(100),
  transaction_date DATE NOT NULL,
  transaction_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  is_recurring BOOLEAN DEFAULT false,
  recurring_id UUID,
  
  payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'CASH', 'BANK_TRANSFER', 'OTHER'),
  payment_mode VARCHAR(100),
  
  tags TEXT[],
  notes TEXT,
  
  receipt_id UUID,
  is_verified BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3, 2),
  
  external_id VARCHAR(255), -- For bank imports
  external_source VARCHAR(50), -- 'PLAID', 'MANUAL', etc
  
  deleted_at TIMESTAMP,
  
  CONSTRAINT amount_positive CHECK (amount > 0),
  INDEX idx_user_date (user_id, transaction_date DESC),
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_category (category_id),
  INDEX idx_merchant (merchant_name),
  INDEX idx_external_id (external_id),
  FULLTEXT INDEX idx_search (description, merchant_name)
);

-- Transaction tags (for flexible tagging)
CREATE TABLE transaction_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (transaction_id, tag_name),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_tag_name (tag_name)
);

-- Receipts
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  original_filename VARCHAR(255),
  image_url TEXT NOT NULL,
  s3_key VARCHAR(500),
  
  extracted_text TEXT,
  extracted_data JSONB, -- {merchant, date, amount, items, tax}
  
  extracted_amount DECIMAL(12, 2),
  extracted_date DATE,
  extracted_merchant VARCHAR(255),
  
  extraction_confidence DECIMAL(3, 2),
  is_ocr_verified BOOLEAN DEFAULT false,
  
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_user_id (user_id),
  INDEX idx_uploaded_at (uploaded_at)
);

-- Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES transaction_categories(id),
  name VARCHAR(255),
  description TEXT,
  
  limit_amount DECIMAL(12, 2) NOT NULL,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  
  period ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') DEFAULT 'MONTHLY',
  start_date DATE,
  end_date DATE,
  
  notification_threshold INT DEFAULT 80, -- Alert at 80%
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT amount_positive CHECK (limit_amount > 0),
  CONSTRAINT threshold_valid CHECK (notification_threshold BETWEEN 0 AND 100),
  INDEX idx_user_id (user_id),
  INDEX idx_user_active (user_id, is_active)
);

-- Recurring transactions
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  category_id UUID REFERENCES transaction_categories(id),
  
  frequency ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE,
  
  payment_method VARCHAR(100),
  merchant_name VARCHAR(255),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT amount_positive CHECK (amount > 0),
  INDEX idx_user_id (user_id),
  INDEX idx_next_due (next_due_date)
);

-- Spending anomalies
CREATE TABLE spending_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  
  anomaly_type ENUM('UNUSUAL_AMOUNT', 'UNUSUAL_CATEGORY', 'UNUSUAL_TIME', 'UNUSUAL_MERCHANT') NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
  description TEXT,
  
  ai_confidence DECIMAL(3, 2),
  
  is_reviewed BOOLEAN DEFAULT false,
  user_response ENUM('LEGITIMATE', 'FRAUDULENT', 'IGNORED'),
  
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_reviewed (is_reviewed),
  INDEX idx_severity (severity)
);
```

---

### 3. INVESTMENTS & PORTFOLIOS

```sql
-- Portfolios
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('AGGRESSIVE', 'BALANCED', 'CONSERVATIVE') DEFAULT 'BALANCED',
  
  target_allocation JSONB, -- {equity: 60, debt: 30, gold: 10}
  current_allocation JSONB,
  
  total_invested DECIMAL(12, 2) DEFAULT 0,
  current_value DECIMAL(12, 2) DEFAULT 0,
  profit_loss DECIMAL(12, 2) DEFAULT 0,
  roi_percentage DECIMAL(5, 2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_rebalanced TIMESTAMP,
  
  is_active BOOLEAN DEFAULT true,
  
  INDEX idx_user_id (user_id),
  INDEX idx_type (type)
);

-- SIPs (Systematic Investment Plans)
CREATE TABLE sips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  
  mutual_fund_id VARCHAR(100),
  fund_name VARCHAR(255),
  fund_category VARCHAR(100),
  
  monthly_amount DECIMAL(10, 2) NOT NULL,
  frequency ENUM('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY') DEFAULT 'MONTHLY',
  
  start_date DATE NOT NULL,
  end_date DATE,
  next_sip_date DATE,
  
  units_purchased DECIMAL(12, 4) DEFAULT 0,
  invested_amount DECIMAL(12, 2) DEFAULT 0,
  current_value DECIMAL(12, 2) DEFAULT 0,
  nav_at_purchase DECIMAL(10, 4),
  current_nav DECIMAL(10, 4),
  
  status ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT amount_positive CHECK (monthly_amount > 0),
  INDEX idx_user_id (user_id),
  INDEX idx_next_sip_date (next_sip_date),
  INDEX idx_status (status)
);

-- Holdings
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  
  asset_type ENUM('EQUITY', 'MUTUAL_FUND', 'DEBT', 'GOLD', 'CRYPTO', 'REAL_ESTATE') NOT NULL,
  
  symbol VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  
  quantity DECIMAL(12, 4) NOT NULL,
  average_cost DECIMAL(12, 2),
  current_price DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  
  profit_loss DECIMAL(12, 2),
  roi_percentage DECIMAL(5, 2),
  
  purchase_date DATE,
  
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT quantity_positive CHECK (quantity > 0),
  INDEX idx_portfolio_id (portfolio_id),
  INDEX idx_asset_type (asset_type)
);

-- Investment transactions
CREATE TABLE investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  holding_id UUID REFERENCES holdings(id) ON DELETE SET NULL,
  
  transaction_type ENUM('BUY', 'SELL', 'DIVIDEND', 'SPLIT', 'DEPOSIT', 'WITHDRAWAL') NOT NULL,
  
  quantity DECIMAL(12, 4),
  price_per_unit DECIMAL(12, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  
  transaction_date DATE NOT NULL,
  settlement_date DATE,
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_portfolio_id (portfolio_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_transaction_date (transaction_date)
);

-- Financial goals
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  goal_name VARCHAR(255) NOT NULL,
  goal_type ENUM('HOUSE', 'CAR', 'EDUCATION', 'VACATION', 'RETIREMENT', 'WEDDING', 'INVESTMENT', 'OTHER') NOT NULL,
  
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  
  target_date DATE NOT NULL,
  
  priority INT DEFAULT 1,
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT target_positive CHECK (target_amount > 0),
  INDEX idx_user_id (user_id),
  INDEX idx_goal_type (goal_type),
  INDEX idx_target_date (target_date)
);

-- Goal-SIP mapping
CREATE TABLE goal_sips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
  sip_id UUID NOT NULL REFERENCES sips(id) ON DELETE CASCADE,
  
  monthly_contribution DECIMAL(10, 2),
  contributions_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (goal_id, sip_id),
  INDEX idx_goal_id (goal_id)
);
```

---

### 4. SHOPPING & PRODUCTS

```sql
-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  asin VARCHAR(255),
  sku VARCHAR(255),
  barcode VARCHAR(50),
  
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  subcategory VARCHAR(255),
  
  image_url TEXT,
  image_urls TEXT[],
  
  rating DECIMAL(2, 1),
  review_count INT DEFAULT 0,
  
  is_currently_available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (asin),
  UNIQUE (sku),
  INDEX idx_name (name),
  INDEX idx_category (category),
  FULLTEXT INDEX idx_search (name, description)
);

-- Prices
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  platform VARCHAR(100) NOT NULL, -- 'AMAZON', 'FLIPKART', 'MEESHO', etc
  
  current_price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percentage INT,
  
  currency VARCHAR(3) DEFAULT 'INR',
  availability_status VARCHAR(50),
  
  product_url TEXT,
  
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT price_positive CHECK (current_price > 0),
  INDEX idx_product_id (product_id),
  INDEX idx_platform (platform),
  INDEX idx_product_platform (product_id, platform),
  INDEX idx_price (current_price)
);

-- Price history
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  platform VARCHAR(100) NOT NULL,
  
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage INT,
  
  recorded_date DATE NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_product_date (product_id, recorded_date DESC),
  INDEX idx_platform (platform),
  UNIQUE (product_id, platform, recorded_date)
);

-- Product recommendations
CREATE TABLE product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  source_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommended_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  reason VARCHAR(255), -- 'CHEAPER', 'BETTER_RATING', 'SAME_CATEGORY', etc
  ai_confidence DECIMAL(3, 2),
  
  clicked_count INT DEFAULT 0,
  purchased BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_source_product (source_product_id),
  INDEX idx_confidence (ai_confidence DESC)
);

-- Cashback offers
CREATE TABLE cashback_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  platform VARCHAR(100),
  
  offer_percentage DECIMAL(5, 2),
  offer_amount DECIMAL(10, 2),
  min_purchase_amount DECIMAL(10, 2),
  
  start_date DATE,
  end_date DATE,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_platform_date (platform, end_date),
  INDEX idx_product_id (product_id)
);

-- Wishlist
CREATE TABLE user_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  price_alert_threshold DECIMAL(10, 2),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user_id, product_id),
  INDEX idx_user_id (user_id)
);

-- User search history
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  search_query VARCHAR(255),
  results_count INT,
  
  searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_searched_at (searched_at)
);
```

---

### 5. SUBSCRIPTIONS & BILLS

```sql
-- Subscriptions (auto-detected)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') DEFAULT 'MONTHLY',
  
  start_date DATE,
  renewal_date DATE,
  end_date DATE,
  
  auto_renew BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  payment_method VARCHAR(100),
  merchant_name VARCHAR(255),
  
  auto_detected BOOLEAN DEFAULT false,
  confidence DECIMAL(3, 2),
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT amount_positive CHECK (amount > 0),
  INDEX idx_user_id (user_id),
  INDEX idx_renewal_date (renewal_date),
  INDEX idx_is_active (is_active)
);

-- Bill negotiations history
CREATE TABLE bill_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  bill_type VARCHAR(100), -- 'INTERNET', 'ELECTRICITY', 'INSURANCE', etc
  provider_name VARCHAR(255),
  
  original_amount DECIMAL(10, 2),
  negotiated_amount DECIMAL(10, 2),
  savings_amount DECIMAL(10, 2),
  
  status ENUM('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  
  ai_recommended_price DECIMAL(10, 2),
  market_average DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

---

### 6. HOUSEHOLD INVENTORY

```sql
-- Household inventory items
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  
  quantity DECIMAL(10, 2),
  unit VARCHAR(50), -- 'pieces', 'kg', 'liters', etc
  
  purchase_price DECIMAL(10, 2),
  current_value DECIMAL(10, 2),
  
  purchase_date DATE,
  expiry_date DATE,
  warranty_expiry_date DATE,
  
  location VARCHAR(255),
  description TEXT,
  image_url TEXT,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_expiry_date (expiry_date),
  INDEX idx_category (category)
);

-- Maintenance reminders
CREATE TABLE maintenance_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  reminder_type VARCHAR(100), -- 'SERVICE', 'REPLACEMENT', 'INSPECTION', etc
  description TEXT,
  
  last_done_date DATE,
  next_due_date DATE,
  frequency VARCHAR(50), -- 'MONTHLY', 'YEARLY', etc
  
  estimated_cost DECIMAL(10, 2),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_inventory_id (inventory_item_id),
  INDEX idx_next_due_date (next_due_date)
);

-- Insurance recommendations
CREATE TABLE insurance_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  
  item_type VARCHAR(100),
  item_value DECIMAL(10, 2),
  
  recommended_coverage DECIMAL(10, 2),
  recommended_premium DECIMAL(10, 2),
  
  insurance_type VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id)
);
```

---

### 7. FAMILY & SHARING

```sql
-- Families
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_created_by (created_by_user_id)
);

-- Family members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  role ENUM('ADMIN', 'CO_ADMIN', 'MEMBER', 'CHILD') DEFAULT 'MEMBER',
  
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (family_id, user_id),
  INDEX idx_family_id (family_id),
  INDEX idx_user_id (user_id)
);

-- Shared budgets
CREATE TABLE shared_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  total_limit DECIMAL(12, 2) NOT NULL,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  
  period ENUM('WEEKLY', 'MONTHLY', 'YEARLY') DEFAULT 'MONTHLY',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT limit_positive CHECK (total_limit > 0),
  INDEX idx_family_id (family_id)
);

-- Kids allowance
CREATE TABLE kids_allowance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  monthly_allowance DECIMAL(10, 2),
  earned_amount DECIMAL(10, 2) DEFAULT 0,
  spent_amount DECIMAL(10, 2) DEFAULT 0,
  saved_amount DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT allowance_positive CHECK (monthly_allowance > 0),
  INDEX idx_family_id (family_id),
  INDEX idx_child_user_id (child_user_id)
);

-- Chores (for earning)
CREATE TABLE chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  reward_amount DECIMAL(10, 2),
  
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED') DEFAULT 'NOT_STARTED',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  INDEX idx_family_id (family_id),
  INDEX idx_assigned_to (assigned_to_user_id)
);

-- Shared goals
CREATE TABLE shared_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  
  goal_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  
  target_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_family_id (family_id)
);
```

---

### 8. NOTIFICATIONS & PREFERENCES

```sql
-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(100), -- 'BUDGET_ALERT', 'GOAL_MILESTONE', etc
  title VARCHAR(255),
  message TEXT,
  
  data JSONB, -- Additional notification data
  
  is_read BOOLEAN DEFAULT false,
  
  notification_channels TEXT[], -- {EMAIL, SMS, PUSH, IN_APP}
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
);

-- Notification preferences (per category)
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  
  spending_alerts BOOLEAN DEFAULT true,
  budget_alerts BOOLEAN DEFAULT true,
  investment_updates BOOLEAN DEFAULT true,
  goal_reminders BOOLEAN DEFAULT true,
  subscription_alerts BOOLEAN DEFAULT true,
  promotional_emails BOOLEAN DEFAULT false,
  
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id)
);
```

---

## 📊 Indexes Summary

Key indexes for performance:

```sql
-- Fast lookups
INDEX idx_users_email ON users(email);
INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
INDEX idx_subscriptions_renewal ON subscriptions(renewal_date);
INDEX idx_sips_next_date ON sips(next_sip_date);
INDEX idx_goals_target_date ON financial_goals(target_date);

-- Search
FULLTEXT INDEX idx_transaction_search ON transactions(description, merchant_name);
FULLTEXT INDEX idx_product_search ON products(name, description);

-- Filtering
INDEX idx_transactions_category ON transactions(category_id);
INDEX idx_budgets_user_active ON budgets(user_id, is_active);
INDEX idx_inventory_expiry ON inventory_items(expiry_date);
```

---

## 🔄 Relationships Diagram

```
users (root)
├── user_profiles
├── user_settings
├── user_sessions
├── oauth_providers
├── mfa_devices
├── audit_logs
├── transactions
│   ├── transaction_categories
│   ├── transaction_tags
│   ├── receipts
│   └── spending_anomalies
├── budgets
├── recurring_transactions
├── portfolios
│   ├── sips
│   ├── holdings
│   ├── investment_transactions
│   └── goal_sips
├── financial_goals
├── subscriptions
├── bill_negotiations
├── inventory_items
│   ├── maintenance_reminders
│   └── insurance_recommendations
├── families (created_by_user_id)
│   ├── family_members
│   ├── shared_budgets
│   ├── kids_allowance
│   ├── chores
│   └── shared_goals
├── product_recommendations
├── user_wishlist
├── search_history
└── notifications
```

---

## 🔐 Data Retention Policy

```
Users: Indefinite (or deleted on request)
Transactions: Retain 7 years (tax requirement)
Audit Logs: Retain 1 year
Notifications: Retain 90 days
Session Tokens: Retain until expiry
Deleted Data: Archive to S3 after 30 days
```

---

## 📈 Partitioning Strategy

For large tables:

```sql
-- Partition transactions by year
CREATE TABLE transactions (...)
PARTITION BY RANGE (YEAR(transaction_date)) (
  PARTITION p_2020 VALUES LESS THAN (2021),
  PARTITION p_2021 VALUES LESS THAN (2022),
  PARTITION p_2022 VALUES LESS THAN (2023),
  PARTITION p_2023 VALUES LESS THAN (2024),
  PARTITION p_2024 VALUES LESS THAN (2025),
  PARTITION p_future VALUES LESS THAN (MAXVALUE)
);

-- Partition price_history by date
CREATE TABLE price_history (...)
PARTITION BY RANGE (recorded_date) (
  PARTITION p_2024_q1 VALUES LESS THAN ('2024-04-01'),
  PARTITION p_2024_q2 VALUES LESS THAN ('2024-07-01'),
  -- ...
);
```

