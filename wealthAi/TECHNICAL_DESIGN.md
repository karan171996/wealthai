# WealthAI - Low-Level Technical Design (LLD)

## 📋 Overview

This document provides detailed technical implementation specifications for each service in WealthAI.

---

## 1️⃣ AUTH SERVICE (LLD)

### Technology Stack
- Framework: Express.js + TypeScript
- Database: PostgreSQL (users, sessions, tokens)
- Cache: Redis (token blacklist)
- Auth: JWT + OAuth2
- External: Google OAuth, Apple Sign-in

### Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_picture_url TEXT,
  account_status ENUM('ACTIVE', 'SUSPENDED', 'DELETED'),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone_number)
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(512) NOT NULL,
  access_token_expires_at TIMESTAMP NOT NULL,
  refresh_token_expires_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_refresh_token (refresh_token)
);

CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_name VARCHAR(50) NOT NULL, -- 'GOOGLE', 'APPLE', etc
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  connected_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (provider_name, provider_user_id),
  INDEX idx_user_id (user_id)
);

CREATE TABLE mfa_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type ENUM('TOTP', 'SMS', 'EMAIL'),
  device_identifier VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  INDEX idx_user_id (user_id)
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
);
```

### Key Functions

```typescript
// src/services/auth.service.ts

class AuthService {
  
  // User Registration
  async register(email: string, password: string, name: string): Promise<{user, tokens}> {
    // 1. Validate email format
    // 2. Check if user exists
    // 3. Hash password (bcrypt, 12 rounds)
    // 4. Create user in database
    // 5. Send verification email
    // 6. Generate JWT tokens
    // 7. Return user + tokens
  }
  
  // User Login
  async login(email: string, password: string): Promise<{user, tokens}> {
    // 1. Find user by email
    // 2. Compare password hashes
    // 3. Check email verification status
    // 4. Check MFA requirement
    // 5. Generate JWT + refresh tokens
    // 6. Store session in database
    // 7. Log login event
    // 8. Return tokens
  }
  
  // Refresh Token
  async refreshAccessToken(refreshToken: string): Promise<{accessToken}> {
    // 1. Verify refresh token validity
    // 2. Check if in blacklist (Redis)
    // 3. Extract user from token
    // 4. Generate new access token
    // 5. Return new token
  }
  
  // Logout
  async logout(refreshToken: string, accessToken: string): Promise<void> {
    // 1. Add tokens to blacklist (Redis) with TTL
    // 2. Delete session from database
    // 3. Log logout event
  }
  
  // OAuth Login
  async oauthLogin(provider: string, code: string): Promise<{user, tokens}> {
    // 1. Exchange code for access token from provider
    // 2. Get user info from provider
    // 3. Check if user exists (provider_user_id)
    // 4. If exists: update tokens, return user
    // 5. If new: create user, link provider, return
    // 6. Generate session
  }
  
  // Verify Email
  async verifyEmail(token: string): Promise<void> {
    // 1. Validate token
    // 2. Update user email_verified = true
    // 3. Log verification
  }
  
  // Send MFA Challenge
  async sendMFAChallenge(userId: string, device: MFADevice): Promise<void> {
    // 1. Generate 6-digit code
    // 2. Store code in Redis with 5min expiry
    // 3. Send via SMS/Email/App
  }
  
  // Verify MFA
  async verifyMFA(userId: string, code: string): Promise<boolean> {
    // 1. Get stored code from Redis
    // 2. Compare with provided code
    // 3. If valid, delete from Redis
    // 4. Return true/false
  }
}
```

### API Endpoints

```
POST   /api/v1/auth/register           Register new user
POST   /api/v1/auth/login              Login with email/password
POST   /api/v1/auth/refresh            Refresh access token
POST   /api/v1/auth/logout             Logout user
POST   /api/v1/auth/oauth/google       Google OAuth callback
POST   /api/v1/auth/oauth/apple        Apple OAuth callback
POST   /api/v1/auth/verify-email       Verify email address
POST   /api/v1/auth/forgot-password    Send reset link
POST   /api/v1/auth/reset-password     Reset password
POST   /api/v1/auth/mfa/setup          Setup MFA device
POST   /api/v1/auth/mfa/verify         Verify MFA code
GET    /api/v1/auth/me                 Get current user
```

---

## 2️⃣ EXPENSE SERVICE (LLD)

### Technology Stack
- Framework: Express.js + TypeScript
- Database: PostgreSQL
- Cache: Redis
- Search: Elasticsearch
- AI Integration: Claude API
- OCR: AWS Textract / Tesseract

### Database Schema

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  category_id UUID REFERENCES transaction_categories(id),
  description TEXT,
  merchant_name VARCHAR(255),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_recurring BOOLEAN DEFAULT false,
  payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'CASH', 'BANK_TRANSFER'),
  tags JSONB, -- Array of string tags
  receipt_id UUID,
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  INDEX idx_user_date (user_id, transaction_date DESC),
  INDEX idx_category (category_id),
  FULLTEXT INDEX idx_description (description, merchant_name)
);

CREATE TABLE transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  color_code VARCHAR(7),
  is_default BOOLEAN DEFAULT false,
  UNIQUE (name)
);

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  extracted_amount DECIMAL(12, 2),
  extracted_date DATE,
  extraction_confidence DECIMAL(3, 2),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_transaction_id (transaction_id)
);

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  category_id UUID REFERENCES transaction_categories(id),
  name VARCHAR(255),
  limit_amount DECIMAL(12, 2) NOT NULL,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  period ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'),
  start_date DATE,
  end_date DATE,
  notification_threshold INT DEFAULT 80, -- Alert at 80%
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);

CREATE TABLE spending_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  anomaly_type ENUM('UNUSUAL_AMOUNT', 'UNUSUAL_CATEGORY', 'UNUSUAL_TIME'),
  severity ENUM('LOW', 'MEDIUM', 'HIGH'),
  description TEXT,
  ai_confidence DECIMAL(3, 2),
  is_reviewed BOOLEAN DEFAULT false,
  user_response ENUM('LEGITIMATE', 'FRAUDULENT', 'IGNORED'),
  detected_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);

CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  frequency ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'),
  category_id UUID REFERENCES transaction_categories(id),
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);
```

### Core Functions

```typescript
// src/services/expense.service.ts

class ExpenseService {
  
  // Create Transaction
  async createTransaction(userId: string, data: CreateTransactionDTO): Promise<Transaction> {
    // 1. Validate transaction data
    // 2. Call AI Service to categorize
    // 3. Check for anomalies
    // 4. Insert into database
    // 5. Invalidate user cache
    // 6. Emit event to notification service
    // 7. Return transaction
  }
  
  // Scan Receipt
  async scanReceipt(userId: string, imageFile: File): Promise<{extractedData}> {
    // 1. Upload image to S3
    // 2. Call AWS Textract / Tesseract OCR
    // 3. Extract amount, date, merchant
    // 4. Store extraction result in database
    // 5. Return extracted data for user confirmation
  }
  
  // Categorize Transaction
  async categorizeTransaction(transaction: Transaction): Promise<Category> {
    // 1. Prepare context for Claude API
    // 2. Call Claude with transaction details
    // 3. Get AI recommendation
    // 4. Store category with confidence score
    // 5. Log for training
    // 6. Return category
  }
  
  // Detect Anomalies
  async detectAnomalies(userId: string, transaction: Transaction): Promise<Anomaly[]> {
    // 1. Get user's historical data
    // 2. Calculate average spending per category
    // 3. Check if current transaction is outlier (3 std dev)
    // 4. Use ML model to predict if fraudulent
    // 5. Store anomalies in database
    // 6. Return list of detected anomalies
  }
  
  // Get Transactions
  async getTransactions(
    userId: string,
    filters: {dateRange, category, searchText, pagination}
  ): Promise<{transactions, pagination}> {
    // 1. Build query with filters
    // 2. Use Elasticsearch for text search
    // 3. Apply pagination
    // 4. Get from cache if available
    // 5. Return results
  }
  
  // Calculate Budget Status
  async calculateBudgetStatus(userId: string): Promise<BudgetStatus[]> {
    // 1. Get all active budgets for user
    // 2. Get transactions in budget period
    // 3. Sum spent amount per category
    // 4. Calculate percentage used
    // 5. Identify over-budget categories
    // 6. Return status for each budget
  }
  
  // Get Spending Breakdown
  async getSpendingBreakdown(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Promise<SpendingBreakdown> {
    // 1. Get transactions for period
    // 2. Group by category
    // 3. Calculate totals and percentages
    // 4. Compare with previous period
    // 5. Return breakdown
  }
}
```

### AI Integration (Claude API)

```typescript
// src/integrations/claude.integration.ts

class ClaudeIntegration {
  
  async categorizeTransaction(transaction: Transaction): Promise<{category: string, confidence: number}> {
    const prompt = `
      Categorize this transaction:
      - Amount: ₹${transaction.amount}
      - Merchant: ${transaction.merchant_name}
      - Description: ${transaction.description}
      - Payment Method: ${transaction.payment_method}
      
      Available categories: Food, Transport, Utilities, Entertainment, Health, Education, etc.
      
      Return JSON: {category: string, confidence: number (0-1)}
    `;
    
    const response = await this.claudeClient.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{role: "user", content: prompt}]
    });
    
    return this.parseResponse(response);
  }
  
  async detectAnomalies(
    userProfile: UserSpendingProfile,
    transaction: Transaction
  ): Promise<{isAnomaly: boolean, reason: string, severity: 'LOW' | 'MEDIUM' | 'HIGH'}> {
    const prompt = `
      Analyze if this transaction is anomalous:
      
      User Profile:
      - Monthly average spend: ₹${userProfile.avgMonthlySpend}
      - By category: ${JSON.stringify(userProfile.categoryAverages)}
      - Recurring transactions: ${JSON.stringify(userProfile.recurringTransactions)}
      
      Current Transaction:
      - Amount: ₹${transaction.amount}
      - Category: ${transaction.category}
      - Time: ${transaction.created_at}
      
      Assess:
      1. Is amount unusual for this category?
      2. Is category unusual for this user?
      3. Is time unusual for this transaction type?
      
      Return JSON: {
        isAnomaly: boolean,
        reason: string,
        severity: 'LOW' | 'MEDIUM' | 'HIGH'
      }
    `;
    
    const response = await this.claudeClient.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{role: "user", content: prompt}]
    });
    
    return this.parseResponse(response);
  }
  
  async generateInsights(userId: string): Promise<{insights: string[]}> {
    // Get user's recent transactions and patterns
    // Call Claude with context
    // Return actionable insights
  }
}
```

### API Endpoints

```
POST   /api/v1/expenses                    Create expense
GET    /api/v1/expenses                    Get expenses (with filters)
GET    /api/v1/expenses/{id}               Get single expense
PUT    /api/v1/expenses/{id}               Update expense
DELETE /api/v1/expenses/{id}               Delete expense

POST   /api/v1/receipts/scan               Scan receipt image
GET    /api/v1/receipts/{id}               Get receipt data

GET    /api/v1/budgets                     Get user budgets
POST   /api/v1/budgets                     Create budget
PUT    /api/v1/budgets/{id}                Update budget
DELETE /api/v1/budgets/{id}                Delete budget
GET    /api/v1/budgets/status              Get budget status

GET    /api/v1/analytics/breakdown         Get spending breakdown
GET    /api/v1/analytics/trends            Get spending trends
GET    /api/v1/analytics/insights          Get AI insights
GET    /api/v1/analytics/anomalies         Get detected anomalies

POST   /api/v1/recurring/create            Create recurring transaction
GET    /api/v1/recurring                   Get recurring transactions
```

---

## 3️⃣ SHOPPING SERVICE (LLD)

### Technology Stack
- Framework: Express.js + Python (FastAPI for ML)
- Database: PostgreSQL + Elasticsearch
- Caching: Redis
- Web Scraping: Selenium, Puppeteer
- API Integration: Amazon PA-API, Flipkart API
- ML: TensorFlow for price prediction

### Database Schema

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asin VARCHAR(255) UNIQUE,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  image_url TEXT,
  rating DECIMAL(2, 1),
  review_count INT,
  is_currently_available BOOLEAN DEFAULT true,
  last_updated TIMESTAMP DEFAULT NOW(),
  INDEX idx_name (name),
  FULLTEXT INDEX idx_search (name, description)
);

CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  platform VARCHAR(100), -- 'AMAZON', 'FLIPKART', 'MEESHO', etc
  current_price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percentage INT,
  currency VARCHAR(3) DEFAULT 'INR',
  availability_status VARCHAR(50),
  last_checked TIMESTAMP DEFAULT NOW(),
  INDEX idx_product_platform (product_id, platform),
  INDEX idx_price (current_price)
);

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  platform VARCHAR(100),
  price DECIMAL(10, 2),
  discount_percentage INT,
  recorded_date DATE,
  INDEX idx_product_date (product_id, recorded_date),
  UNIQUE (product_id, platform, recorded_date)
);

CREATE TABLE product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  source_product_id UUID REFERENCES products(id),
  recommended_product_id UUID NOT NULL REFERENCES products(id),
  reason VARCHAR(255), -- 'CHEAPER', 'BETTER_RATING', 'SAME_CATEGORY', etc
  ai_confidence DECIMAL(3, 2),
  clicked_count INT DEFAULT 0,
  purchased_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);

CREATE TABLE cashback_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  platform VARCHAR(100),
  offer_percentage DECIMAL(5, 2),
  offer_amount DECIMAL(10, 2),
  min_purchase_amount DECIMAL(10, 2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  INDEX idx_platform_date (platform, end_date)
);

CREATE TABLE user_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  added_at TIMESTAMP DEFAULT NOW(),
  price_alert_threshold DECIMAL(10, 2),
  UNIQUE (user_id, product_id),
  INDEX idx_user_id (user_id)
);
```

### Core Functions

```typescript
// src/services/shopping.service.ts

class ShoppingService {
  
  // Search Products
  async searchProducts(
    query: string,
    filters: {category, priceRange, rating, platforms}
  ): Promise<{products, totalCount}> {
    // 1. Search Elasticsearch for matching products
    // 2. Filter by criteria
    // 3. Get latest prices from Redis cache
    // 4. Sort by relevance
    // 5. Return results with pagination
  }
  
  // Get Price Comparison
  async comparePrices(productId: string): Promise<{priceComparison}> {
    // 1. Get all prices for product across platforms
    // 2. Add cashback information
    // 3. Calculate final price (with cashback)
    // 4. Sort by best deal
    // 5. Include price history for 30 days
    // 6. Return comparison data
  }
  
  // Get Product Recommendations
  async getRecommendations(userId: string, productId: string): Promise<{recommendations}> {
    // 1. Get product details
    // 2. Get user's purchase history
    // 3. Get similar products in same category
    // 4. Filter for cheaper alternatives
    // 5. Use ML model to rank recommendations
    // 6. Store recommendation in database
    // 7. Return top 5 alternatives
  }
  
  // Track Price History
  async trackPriceHistory(productId: string, platform: string): Promise<void> {
    // 1. Get current price from platform
    // 2. Compare with last recorded price
    // 3. Store in price_history
    // 4. If price dropped: notify watchlist users
    // 5. Update cache with latest price
  }
  
  // Calculate Best Time to Buy
  async calculateBestTimeToBuy(productId: string): Promise<{prediction}> {
    // 1. Get price history (last 90 days)
    // 2. Analyze seasonal patterns
    // 3. Use TensorFlow model for prediction
    // 4. Return: current price, predicted price, best buy time
  }
  
  // Get Cashback Optimizer
  async optimizeCashback(products: Product[]): Promise<{recommendations}> {
    // 1. Get all applicable cashback offers
    // 2. Group by platform
    // 3. Calculate total cashback per platform
    // 4. Recommend best platform/timing
    // 5. Return cashback optimization plan
  }
}
```

### Web Scraping Integration

```python
# src/integrations/web_scraper.py

class PriceScraperBot:
    
    def scrape_amazon(self, asin: str) -> dict:
        """Scrape Amazon product using official PA-API"""
        # Use Amazon Product Advertising API (official)
        # More reliable than web scraping
        response = self.amazon_pa_api.get_product(asin)
        return {
            'price': response['Offers']['Listings'][0]['Price']['Amount'],
            'availability': response['Availability']['Message'],
            'rating': response['CustomerReviews']['StarRating'],
            'reviews': response['CustomerReviews']['Count']
        }
    
    def scrape_flipkart(self, product_url: str) -> dict:
        """Scrape Flipkart using Selenium"""
        driver = self.init_selenium_driver()
        driver.get(product_url)
        
        # Wait for dynamic content to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "price"))
        )
        
        price = driver.find_element(By.CLASS_NAME, "price").text
        rating = driver.find_element(By.CLASS_NAME, "rating").text
        availability = driver.find_element(By.CLASS_NAME, "availability").text
        
        driver.quit()
        
        return {
            'price': float(price.replace('₹', '').replace(',', '')),
            'rating': float(rating),
            'availability': availability
        }
```

### API Endpoints

```
GET    /api/v1/shopping/search            Search products
GET    /api/v1/shopping/products/{id}     Get product details
GET    /api/v1/shopping/compare-prices    Compare prices
GET    /api/v1/shopping/recommendations   Get alternatives
GET    /api/v1/shopping/price-history     Get price trends
GET    /api/v1/shopping/best-time-to-buy  Predict best time
GET    /api/v1/shopping/cashback          Get cashback deals

POST   /api/v1/wishlist/add               Add to wishlist
GET    /api/v1/wishlist                   Get wishlist
DELETE /api/v1/wishlist/{id}              Remove from wishlist
```

---

## 4️⃣ INVESTMENT SERVICE (LLD)

### Technology Stack
- Framework: Express.js + TypeScript
- Database: PostgreSQL + TimeSeries DB
- APIs: Zerodha, Smallcase, Groww
- ML: TensorFlow for portfolio optimization
- Real-time: WebSocket for market updates

### Database Schema

```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255),
  type ENUM('AGGRESSIVE', 'BALANCED', 'CONSERVATIVE'),
  target_allocation JSONB, -- {equity: 60, debt: 30, gold: 10}
  current_allocation JSONB,
  total_invested DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  profit_loss DECIMAL(12, 2),
  roi_percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  last_rebalanced TIMESTAMP
);

CREATE TABLE sips (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  portfolio_id UUID REFERENCES portfolios(id),
  mutual_fund_id VARCHAR(100),
  fund_name VARCHAR(255),
  monthly_amount DECIMAL(10, 2),
  frequency ENUM('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'),
  start_date DATE,
  end_date DATE,
  units_purchased DECIMAL(12, 4) DEFAULT 0,
  invested_amount DECIMAL(12, 2) DEFAULT 0,
  current_value DECIMAL(12, 2) DEFAULT 0,
  status ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'),
  next_sip_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE holdings (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id),
  asset_type ENUM('EQUITY', 'MUTUAL_FUND', 'DEBT', 'GOLD', 'CRYPTO'),
  symbol VARCHAR(50),
  name VARCHAR(255),
  quantity DECIMAL(12, 4),
  average_cost DECIMAL(12, 2),
  current_price DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  profit_loss DECIMAL(12, 2),
  roi_percentage DECIMAL(5, 2),
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE financial_goals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  goal_name VARCHAR(255) NOT NULL,
  goal_type ENUM('HOUSE', 'CAR', 'EDUCATION', 'VACATION', 'RETIREMENT', 'OTHER'),
  target_amount DECIMAL(12, 2),
  current_amount DECIMAL(12, 2) DEFAULT 0,
  target_date DATE,
  priority INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE goal_sips (
  id UUID PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES financial_goals(id),
  sip_id UUID REFERENCES sips(id),
  monthly_contribution DECIMAL(10, 2),
  contributions_count INT DEFAULT 0,
  INDEX idx_goal_id (goal_id)
);
```

### Core Functions

```typescript
// src/services/investment.service.ts

class InvestmentService {
  
  // Create SIP
  async createSIP(userId: string, data: CreateSIPDTO): Promise<SIP> {
    // 1. Validate SIP parameters
    // 2. Check user's monthly budget availability
    // 3. Connect to investment platform (Zerodha/Groww)
    // 4. Create SIP on platform
    // 5. Store SIP details in database
    // 6. Setup automated monthly charges
    // 7. Return SIP details
  }
  
  // Recommend Portfolio
  async recommendPortfolio(userId: string): Promise<PortfolioRecommendation> {
    // 1. Analyze user's:
    //    - Spending patterns
    //    - Income level
    //    - Risk tolerance (survey)
    //    - Financial goals
    //    - Existing investments
    // 2. Use Claude API to generate personalized plan
    // 3. Calculate optimal asset allocation
    // 4. Suggest specific funds/stocks
    // 5. Return recommendations
  }
  
  // Track Portfolio Performance
  async trackPortfolioPerformance(portfolioId: string): Promise<PortfolioMetrics> {
    // 1. Get all holdings in portfolio
    // 2. Fetch current prices from APIs
    // 3. Calculate total current value
    // 4. Calculate profit/loss
    // 5. Calculate ROI percentage
    // 6. Store metrics in TimeSeries DB
    // 7. Return performance data
  }
  
  // Rebalance Portfolio
  async rebalancePortfolio(portfolioId: string): Promise<RebalancingPlan> {
    // 1. Get target allocation
    // 2. Get current allocation
    // 3. Calculate drift from target
    // 4. Use optimization algorithm to generate trades
    // 5. Calculate tax implications
    // 6. Return rebalancing plan
    // 7. Ask user for approval before executing
  }
  
  // Calculate Goal Progress
  async calculateGoalProgress(goalId: string): Promise<GoalProgress> {
    // 1. Get goal details
    // 2. Sum all contributions
    // 3. Get current SIP value
    // 4. Calculate progress percentage
    // 5. Project if on track to meet goal
    // 6. Return detailed progress report
  }
  
  // Suggest Job/Side Hustle
  async suggestIncomeBooster(userId: string): Promise<{suggestions}> {
    // 1. Analyze user's income vs lifestyle
    // 2. Calculate income gap for goals
    // 3. Get user's skills from profile
    // 4. Use Claude to suggest side hustles
    // 5. Estimate additional income potential
    // 6. Return suggestions
  }
}
```

### Real-time Market Data

```typescript
// src/integrations/market-data.service.ts

class MarketDataService {
  
  async connectWebSocket(portfolioId: string): Promise<void> {
    // Connect to live market data feed
    // Track holdings in real-time
    // Emit updates to frontend via WebSocket
    // Alert user on significant changes
  }
  
  async getFundPerformance(fundId: string): Promise<{performance}> {
    // Get latest NAV (Net Asset Value)
    // Get 1Y, 3Y, 5Y returns
    // Get expense ratio
    // Get ratings
    // Return comprehensive data
  }
}
```

### API Endpoints

```
POST   /api/v1/investments/sips          Create SIP
GET    /api/v1/investments/sips          Get all SIPs
PUT    /api/v1/investments/sips/{id}     Update SIP
DELETE /api/v1/investments/sips/{id}     Cancel SIP

POST   /api/v1/investments/portfolios    Create portfolio
GET    /api/v1/investments/portfolios    Get portfolios
GET    /api/v1/investments/portfolios/{id}/performance  Get performance
POST   /api/v1/investments/portfolios/{id}/rebalance     Get rebalancing plan

POST   /api/v1/goals                     Create goal
GET    /api/v1/goals                     Get goals
PUT    /api/v1/goals/{id}                Update goal
GET    /api/v1/goals/{id}/progress       Get goal progress
POST   /api/v1/goals/{id}/link-sip       Link SIP to goal

GET    /api/v1/investments/recommend     Get recommendations
GET    /api/v1/investments/suggest-income  Suggest income boosters
```

---

## 5️⃣ AI SERVICE (LLD - Claude Integration)

### Core Responsibilities

```typescript
// src/services/ai.service.ts

class AIService {
  
  // Transaction Categorization
  async categorizeTransaction(transaction: Transaction): Promise<Category> {
    // Already detailed in Expense Service
  }
  
  // Generate Insights
  async generateInsights(userId: string): Promise<string[]> {
    // 1. Get user's recent transactions (30 days)
    // 2. Get spending patterns
    // 3. Get financial goals
    // 4. Prepare context
    // 5. Call Claude API with custom prompt
    // 6. Return insights
  }
  
  // Predict Spending
  async predictSpending(userId: string, period: 'next_week' | 'next_month'): Promise<Prediction> {
    // 1. Get historical spending data
    // 2. Identify patterns (seasonal, recurring)
    // 3. Get upcoming events (bills, subscriptions)
    // 4. Call Claude for prediction with context
    // 5. Generate detailed forecast
    // 6. Return predictions
  }
  
  // Generate Financial Advice
  async generateFinancialAdvice(userId: string): Promise<Advice[]> {
    // 1. Analyze:
    //    - Spending patterns
    //    - Savings rate
    //    - Debt level
    //    - Investment status
    //    - Goals vs progress
    // 2. Prepare comprehensive profile
    // 3. Call Claude with advice prompt
    // 4. Get personalized recommendations
    // 5. Prioritize by impact
    // 6. Return actionable advice
  }
  
  // Detect Hidden Money
  async discoverHiddenMoney(userId: string): Promise<{savings: Saving[], total: number}> {
    // 1. Analyze subscriptions (unused ones)
    // 2. Analyze bills vs market rates
    // 3. Analyze spending leaks
    // 4. Get Claude's analysis
    // 5. Calculate total potential savings
    // 6. Return structured findings
  }
}
```

### Claude API Integration

```typescript
// src/integrations/claude.client.ts

class ClaudeClient {
  private client: Anthropic;
  
  constructor(apiKey: string) {
    this.client = new Anthropic({apiKey});
  }
  
  async analyzeExpenses(userContext: UserFinancialContext): Promise<string> {
    const systemPrompt = `You are a personal financial advisor with expertise in:
    - Expense analysis and optimization
    - Budgeting strategies
    - Wealth building
    - Investment guidance
    
    Provide specific, actionable recommendations based on the user's financial data.
    Be empathetic and encouraging while being realistic about financial goals.`;
    
    const userPrompt = `
    Analyze this user's financial situation:
    
    Monthly Income: ₹${userContext.monthlyIncome}
    Monthly Expenses: ₹${userContext.monthlyExpenses}
    Savings Rate: ${userContext.savingsRate}%
    
    Spending by Category:
    ${Object.entries(userContext.categoryBreakdown)
      .map(([cat, amount]) => `- ${cat}: ₹${amount}`)
      .join('\n')}
    
    Financial Goals:
    ${userContext.goals.map(g => `- ${g.name}: ₹${g.target} by ${g.date}`).join('\n')}
    
    Please provide:
    1. Top 3 areas where money is being wasted
    2. 5 specific recommendations to improve finances
    3. 12-month action plan for financial improvement
    4. Encouragement and motivation
    `;
    
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{role: "user", content: userPrompt}]
    });
    
    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
  
  async chatWithAdvisor(userId: string, userMessage: string): Promise<string> {
    // Multi-turn conversation with financial advisor
    // Maintain context from previous messages
    // Provide personalized advice
  }
}
```

---

## 📊 Remaining Services Overview

Due to space constraints, here are summaries:

### 6. **Inventory Service**
- Track household items, values, expiry dates
- Generate alerts for expired items
- Insurance recommendations based on inventory value
- Waste tracking and optimization

### 7. **Notification Service**
- Email, SMS, WhatsApp integration
- Push notifications
- User preference management
- Event-driven notifications

### 8. **Payment Service**
- Stripe/Razorpay integration
- Subscription billing
- Invoice generation
- Refund processing

### 9. **Family Service**
- Multi-user household management
- Family budgets and shared goals
- Kids' allowance management
- Financial literacy tracking

### 10. **Analytics Service**
- Dashboard data aggregation
- Report generation
- Trend analysis
- Custom reports

---

## 🔄 Data Flow Patterns

### Synchronous Flow
```
Client Request → API Gateway → Service → Database → Cache → Client Response
```

### Asynchronous Flow
```
Client Request → API Gateway → Service → Message Queue → Background Job → Database → Notification
```

### Real-time Flow
```
Client → WebSocket Connection → Service → Market Data Feed → Client Update
```

---

## 📚 See Also

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Complete database design
- [API_DESIGN.md](./API_DESIGN.md) - Complete API specifications
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

