# WealthAI - High-Level Architecture Design (HLD)

## 📐 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌──────────────────────┐         ┌──────────────────────┐           │
│  │   Web (React)        │         │  Mobile (React Native) │         │
│  │  - Dashboard         │         │  - App Store          │         │
│  │  - Transactions      │         │  - Google Play        │         │
│  │  - Analytics         │         │  - Offline support    │         │
│  └──────────────────────┘         └──────────────────────┘           │
│              │                                 │                      │
│              └─────────────────┬────────────────┘                     │
│                                │                                      │
└────────────────────────────────┼──────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    API GATEWAY          │
                    │  (Express/FastAPI)      │
                    │  - Rate Limiting        │
                    │  - Auth middleware      │
                    │  - Request routing      │
                    │  - Response formatting  │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        │                        │                        │
┌───────▼────────┐    ┌──────────▼─────────┐   ┌─────────▼──────────┐
│ REST API       │    │  GraphQL API      │   │  WebSocket API     │
│                │    │                    │   │                    │
│ /api/v1/*      │    │ /graphql          │   │ Real-time alerts   │
│                │    │                    │   │ Live notifications │
└───────┬────────┘    └──────────┬─────────┘   └─────────┬──────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
        ┌────────────────────────▼────────────────────────┐
        │      MICROSERVICES LAYER                        │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 1. AUTH SERVICE                          │  │
        │  │    - User registration/login             │  │
        │  │    - JWT token generation                │  │
        │  │    - OAuth2 integration                  │  │
        │  │    - MFA/2FA                             │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 2. EXPENSE SERVICE                       │  │
        │  │    - Transaction tracking                │  │
        │  │    - Category classification (AI)        │  │
        │  │    - Budget management                   │  │
        │  │    - Anomaly detection                   │  │
        │  │    - Receipt scanning (OCR)              │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 3. SHOPPING SERVICE                      │  │
        │  │    - Price comparison                    │  │
        │  │    - Product recommendations             │  │
        │  │    - Cashback optimization               │  │
        │  │    - Alternative suggestions             │  │
        │  │    - Web scraping & APIs                 │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 4. INVESTMENT SERVICE                    │  │
        │  │    - SIP management                      │  │
        │  │    - Portfolio recommendations           │  │
        │  │    - Mutual fund integration             │  │
        │  │    - Stock market data                   │  │
        │  │    - Goal tracking                       │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 5. INVENTORY SERVICE                     │  │
        │  │    - Household item tracking             │  │
        │  │    - Expiry management                   │  │
        │  │    - Maintenance reminders               │  │
        │  │    - Waste tracking                      │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 6. SUBSCRIPTION SERVICE                  │  │
        │  │    - Auto-detect subscriptions           │  │
        │  │    - Cancellation management             │  │
        │  │    - Bill negotiation                    │  │
        │  │    - Plan comparison                     │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 7. AI SERVICE (Core - Claude API)        │  │
        │  │    - Text analysis & insights            │  │
        │  │    - Spending predictions                │  │
        │  │    - Recommendations generation          │  │
        │  │    - Natural language processing         │  │
        │  │    - Pattern detection                   │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 8. ANALYTICS SERVICE                     │  │
        │  │    - Financial metrics calculation       │  │
        │  │    - Dashboard data aggregation          │  │
        │  │    - Report generation                   │  │
        │  │    - Trend analysis                      │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 9. NOTIFICATION SERVICE                  │  │
        │  │    - Email notifications                 │  │
        │  │    - SMS/WhatsApp alerts                 │  │
        │  │    - Push notifications                  │  │
        │  │    - In-app notifications                │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 10. PAYMENT SERVICE                      │  │
        │  │     - Stripe/Razorpay integration        │  │
        │  │     - Subscription billing               │  │
        │  │     - Refund management                  │  │
        │  │     - Invoice generation                 │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 11. FAMILY SERVICE                       │  │
        │  │     - Multi-user management              │  │
        │  │     - Family budgets                     │  │
        │  │     - Allowance tracking                 │  │
        │  │     - Shared goals                       │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 12. INTEGRATION SERVICE                  │  │
        │  │     - Bank APIs (Plaid)                  │  │
        │  │     - Investment platforms               │  │
        │  │     - E-commerce integrations            │  │
        │  │     - Third-party webhooks               │  │
        │  └──────────────────────────────────────────┘  │
        │                                                  │
        └────────────────────┬─────────────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │    MESSAGE QUEUE & EVENT BUS            │
        │  ┌──────────────────────────────────┐  │
        │  │ Bull (Redis)                     │  │
        │  │ - Async job processing           │  │
        │  │ - Event publishing               │  │
        │  │ - Delayed tasks                  │  │
        │  │ - Retry logic                    │  │
        │  └──────────────────────────────────┘  │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │      DATA LAYER & PERSISTENCE           │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ PostgreSQL (Primary DB)          │  │
        │  │ - Users & Accounts               │  │
        │  │ - Transactions                   │  │
        │  │ - Subscriptions                  │  │
        │  │ - Investments                    │  │
        │  │ - Family data                    │  │
        │  └──────────────────────────────────┘  │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ Redis Cache Layer                │  │
        │  │ - Session store                  │  │
        │  │ - Query cache                    │  │
        │  │ - Real-time data                 │  │
        │  └──────────────────────────────────┘  │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ InfluxDB (Time-series)           │  │
        │  │ - Financial metrics              │  │
        │  │ - Usage analytics                │  │
        │  │ - Performance data                │  │
        │  └──────────────────────────────────┘  │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ S3 Storage                       │  │
        │  │ - Receipt images                 │  │
        │  │ - User documents                 │  │
        │  │ - Backups                        │  │
        │  └──────────────────────────────────┘  │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ Elasticsearch                    │  │
        │  │ - Transaction search             │  │
        │  │ - Analytics indexing             │  │
        │  └──────────────────────────────────┘  │
        └─────────────────────────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │    EXTERNAL INTEGRATIONS                 │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ Banking APIs                     │  │
        │  │ - Plaid (transaction data)       │  │
        │  │ - Finbox (credit data)           │  │
        │  └──────────────────────────────────┘  │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ Investment APIs                  │  │
        │  │ - Zerodha (stocks)               │  │
        │  │ - Smallcase (portfolios)         │  │
        │  │ - Groww (mutual funds)           │  │
        │  └──────────────────────────────────┘  │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ E-commerce APIs                  │  │
        │  │ - Amazon Product Advertising     │  │
        │  │ - Flipkart API                   │  │
        │  │ - Web scraping (Selenium)        │  │
        │  └──────────────────────────────────┘  │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ Payment APIs                     │  │
        │  │ - Stripe                         │  │
        │  │ - Razorpay                       │  │
        │  └──────────────────────────────────┘  │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ Communication APIs               │  │
        │  │ - Twilio (SMS)                   │  │
        │  │ - SendGrid (Email)               │  │
        │  │ - WhatsApp Business API          │  │
        │  └──────────────────────────────────┘  │
        │                                          │
        │  ┌──────────────────────────────────┐  │
        │  │ AI APIs                          │  │
        │  │ - Claude API (Anthropic)         │  │
        │  │ - OpenAI Whisper (Audio)         │  │
        │  │ - AWS Textract (OCR)             │  │
        │  └──────────────────────────────────┘  │
        └─────────────────────────────────────────┘
```

---

## 🎯 Architectural Principles

### 1. **Microservices Architecture**
- Each service has a single responsibility
- Independent deployment and scaling
- Technology agnostic (can use different stacks)
- API contracts (REST/GraphQL)

### 2. **Event-Driven Architecture**
- Asynchronous communication via message queues
- Event sourcing for audit trails
- Eventual consistency model
- Decopled services

### 3. **API-First Design**
- API contracts defined first
- Mobile and web use same APIs
- Versioning (v1, v2, etc.)
- Comprehensive documentation

### 4. **Security by Design**
- Zero-trust security model
- Encryption at rest and in transit
- Input validation & sanitization
- Rate limiting and DDoS protection
- Audit logging

### 5. **Scalability**
- Horizontal scaling of services
- Database sharding strategy
- Caching at multiple layers
- CDN for static content
- Connection pooling

### 6. **Resilience**
- Circuit breakers
- Retry logic with exponential backoff
- Fallback mechanisms
- Health checks
- Graceful degradation

---

## 📦 Core Services Deep Dive

### 1. Auth Service
```
Responsibilities:
- User registration (email, phone, OAuth)
- Login/Logout
- JWT token generation and validation
- OAuth2 integration (Google, Apple)
- 2FA/MFA setup
- Session management
- Password reset
- Rate limiting on auth endpoints

Database Tables:
- users
- user_sessions
- oauth_providers
- mfa_devices
```

### 2. Expense Service
```
Responsibilities:
- Create/Read/Update/Delete transactions
- Auto-categorization via AI
- Budget tracking
- Spending patterns analysis
- Anomaly detection
- Receipt scanning (OCR)
- Recurring transaction management
- Tag-based organization

Database Tables:
- transactions
- transaction_categories
- budgets
- recurring_transactions
- receipts
- spending_anomalies
```

### 3. Shopping Service
```
Responsibilities:
- Product search across platforms
- Price comparison
- Price history tracking
- Product recommendations
- Cashback calculation
- Alternative suggestions
- Web scraping management
- Search indexing

Database Tables:
- products
- prices
- price_history
- recommendations
- cashback_offers
- product_reviews
```

### 4. Investment Service
```
Responsibilities:
- Portfolio management
- SIP creation and tracking
- Mutual fund integration
- Stock portfolio tracking
- Investment recommendations
- Goal-based investment planning
- Performance tracking
- Tax-loss harvesting suggestions

Database Tables:
- portfolios
- sips
- holdings
- transactions (investment)
- goals
- performance_metrics
```

### 5. AI Service
```
Responsibilities:
- Call Claude API for intelligent analysis
- Generate spending insights
- Predict future expenses
- Create personalized recommendations
- Process natural language queries
- Anomaly detection using ML
- Trend analysis
- Financial advice generation

Integration:
- Claude API (Anthropic)
- TensorFlow for ML models
- Feature store for data
```

### 6. Notification Service
```
Responsibilities:
- Send email notifications
- Send SMS via Twilio
- Send WhatsApp messages
- Push notifications (Firebase)
- In-app notifications
- Notification preferences management
- Notification history

Integration:
- Twilio (SMS)
- SendGrid (Email)
- WhatsApp Business API
- Firebase Cloud Messaging
```

---

## 🔄 Data Flow Examples

### Transaction Processing Flow
```
1. User makes purchase
2. Bank sends webhook to Plaid
3. Plaid notifies WealthAI via webhook
4. Expense Service receives transaction
5. AI Service categorizes automatically
6. Analytics Service updates dashboard
7. Notification Service sends alert
8. Real-time update via WebSocket to client
```

### Investment Recommendation Flow
```
1. User sets financial goal
2. Analytics Service calculates required savings
3. AI Service analyzes spending patterns
4. Investment Service recommends portfolio
5. User approves recommendation
6. SIP created with investment provider
7. Notifications sent on milestones
8. Dashboard updated in real-time
```

### Shopping Assistant Flow
```
1. User searches for product
2. Shopping Service queries multiple APIs
3. Web scraping for real-time prices
4. Price comparison & ranking
5. AI suggests alternatives
6. Cashback optimizer calculates benefits
7. User clicks buy (redirected to partner)
8. Commission & cashback tracked
```

---

## 📊 Database Schema Overview

### Core Tables
```sql
-- Users
users (id, email, phone, password_hash, created_at, ...)
user_profiles (user_id, name, dob, address, ...)
user_settings (user_id, preferences, notifications, ...)

-- Transactions
transactions (id, user_id, amount, category, date, ...)
transaction_tags (transaction_id, tag_id)
receipts (transaction_id, image_path, extracted_text)

-- Budgets & Goals
budgets (id, user_id, category, limit, period, ...)
financial_goals (id, user_id, name, target, deadline, ...)

-- Investments
portfolios (id, user_id, name, type, ...)
sips (id, user_id, mutual_fund_id, amount, frequency, ...)
holdings (id, portfolio_id, asset_type, quantity, ...)

-- Family
families (id, name, created_by_user_id)
family_members (id, family_id, user_id, role)
```

Full schema: See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────┐
│         DDoS Protection                  │
│      (CloudFlare / AWS Shield)           │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      API Gateway (Rate Limiting)         │
│    (Throttling, IP whitelisting)         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Authentication & Authorization       │
│  (JWT + OAuth2 + RBAC)                  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Input Validation & Sanitization    │
│    (XSS, SQL Injection prevention)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Encryption (TLS 1.3)                │
│    (Transit & At-rest with AES-256)     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Secrets Management (Vault)         │
│    (API keys, Credentials)              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Audit Logging & Monitoring         │
│    (All actions logged, Sentry)         │
└─────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────┐
│          CI/CD Pipeline (GitHub Actions)      │
│  - Build Docker images                       │
│  - Run tests                                 │
│  - Push to ECR                               │
│  - Deploy to EKS                             │
└────────────────┬─────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │   AWS EKS        │
        │  Kubernetes      │
        │                  │
        │  ┌────────────┐  │
        │  │ Pods       │  │
        │  │ Services   │  │
        │  │ Ingress    │  │
        │  └────────────┘  │
        └────────┬─────────┘
                 │
        ┌────────▼──────────────────────┐
        │    AWS Services               │
        │                               │
        │ - RDS (PostgreSQL)           │
        │ - ElastiCache (Redis)        │
        │ - S3 (Storage)               │
        │ - CloudFront (CDN)           │
        │ - CloudWatch (Monitoring)    │
        │ - CloudFormation (IaC)       │
        └───────────────────────────────┘
```

---

## 📈 Scaling Strategy

### Horizontal Scaling
- Load balancing across multiple pods
- Database read replicas
- Redis cluster for caching
- Elasticsearch sharding

### Vertical Scaling
- Increase resource allocation per service
- Database optimization (indexing)
- Query optimization

### Database Scaling
- Connection pooling
- Read replicas for analytics
- Sharding by user_id for horizontal scaling
- Archive old data to cold storage

---

## 🔄 API Design Pattern

```
All services follow RESTful principles:

GET    /api/v1/resource              - List resources
GET    /api/v1/resource/{id}         - Get single resource
POST   /api/v1/resource              - Create resource
PUT    /api/v1/resource/{id}         - Update resource
DELETE /api/v1/resource/{id}         - Delete resource

Response Format:
{
  "success": boolean,
  "data": {},
  "error": null,
  "pagination": {},
  "timestamp": ISO8601
}

Error Handling:
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

## 🎯 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Microservices | Independent scaling, separate deployments |
| Event-driven | Loose coupling, asynchronous processing |
| PostgreSQL | ACID compliance, complex queries |
| Redis cache | Fast lookups, session management |
| Claude API | Advanced AI without building models |
| Kubernetes | Container orchestration, auto-scaling |
| GraphQL | Flexible queries, less overfetching |

---

## 📚 Related Documents

- [TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md) - Low-Level Design
- [API_DESIGN.md](./API_DESIGN.md) - API Specifications
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database Design
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment Guide

