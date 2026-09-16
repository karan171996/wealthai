# WealthAI - API Design & Specifications

## 📋 Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Auth Endpoints](#auth-endpoints)
- [Expense Endpoints](#expense-endpoints)
- [Shopping Endpoints](#shopping-endpoints)
- [Investment Endpoints](#investment-endpoints)
- [Analytics Endpoints](#analytics-endpoints)
- [Notification Endpoints](#notification-endpoints)
- [Family Endpoints](#family-endpoints)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)

---

## API Overview

**Base URL:** `https://api.wealthai.com/api/v1`

**Current Version:** v1.0

**API Types:**
- REST (primary)
- GraphQL (available at `/graphql`)
- WebSocket (for real-time data)

**Response Format:** JSON

---

## Authentication

### JWT Token Structure

```
Authorization: Bearer <access_token>
```

### Token Refresh

```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_value"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

### OAuth2 Flow

For Google/Apple Sign-in, use standard OAuth2 authorization code flow.

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "value",
    ...
  },
  "meta": {
    "timestamp": "2024-09-16T10:30:00Z",
    "requestId": "req_12345"
  }
}
```

### List Response with Pagination

```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "meta": {
    "timestamp": "2024-09-16T10:30:00Z",
    "requestId": "req_12345"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-09-16T10:30:00Z",
    "requestId": "req_12345"
  }
}
```

---

## Error Handling

### Standard Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Permission denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## 🔐 AUTH ENDPOINTS

### Register User

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+919876543210"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "accessToken": "eyJhbGc...",
    "refreshToken": "refresh_token...",
    "expiresIn": 3600
  }
}
```

### Login

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "accessToken": "eyJhbGc...",
    "refreshToken": "refresh_token...",
    "expiresIn": 3600,
    "requiresMFA": false
  }
}
```

### Logout

```
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "refresh_token_value"
}
```

### Verify Email

```
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "email_verification_token"
}
```

### OAuth - Google Sign-in

```
POST /api/v1/auth/oauth/google
Content-Type: application/json

{
  "code": "authorization_code_from_google"
}
```

### Setup MFA

```
POST /api/v1/auth/mfa/setup
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deviceType": "TOTP",
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "otpauth://totp/WealthAI:user@example.com?...",
    "backupCodes": ["code1", "code2", ...],
    "setupToken": "setup_token_for_verification"
  }
}
```

### Verify MFA

```
POST /api/v1/auth/mfa/verify
Content-Type: application/json

{
  "setupToken": "setup_token",
  "code": "123456"
}
```

---

## 💰 EXPENSE ENDPOINTS

### Create Transaction

```
POST /api/v1/expenses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 1500,
  "currency": "INR",
  "description": "Grocery shopping",
  "merchantName": "Big Bazaar",
  "transactionDate": "2024-09-16",
  "paymentMethod": "CREDIT_CARD",
  "tags": ["groceries", "food"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "txn_123",
    "amount": 1500,
    "category": {
      "id": "cat_food",
      "name": "Food & Dining",
      "confidence": 0.95
    },
    "description": "Grocery shopping",
    "transactionDate": "2024-09-16",
    "createdAt": "2024-09-16T10:30:00Z",
    "anomalies": []
  }
}
```

### Get Transactions

```
GET /api/v1/expenses?page=1&pageSize=20&category=food&startDate=2024-01-01&endDate=2024-09-16&search=grocery
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_123",
      "amount": 1500,
      "category": "Food & Dining",
      "description": "Grocery shopping",
      "transactionDate": "2024-09-16"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 250,
    "totalPages": 13
  }
}
```

### Update Transaction

```
PUT /api/v1/expenses/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "category": "Groceries",
  "description": "Updated description",
  "tags": ["updated-tag"]
}
```

### Delete Transaction

```
DELETE /api/v1/expenses/{id}
Authorization: Bearer <access_token>
```

### Scan Receipt

```
POST /api/v1/expenses/receipts/scan
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <image_file>
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "receiptId": "rcpt_123",
    "extractedData": {
      "amount": 1500,
      "date": "2024-09-16",
      "merchant": "Big Bazaar",
      "items": ["Milk", "Bread", "Eggs"],
      "confidence": 0.92
    },
    "imageUrl": "https://s3.../receipt_123.jpg"
  }
}
```

### Get Budgets

```
GET /api/v1/budgets
Authorization: Bearer <access_token>

Response:
[
  {
    "id": "budget_1",
    "name": "Food Budget",
    "category": "Food & Dining",
    "limitAmount": 10000,
    "spentAmount": 7500,
    "percentageUsed": 75,
    "period": "MONTHLY",
    "notificationThreshold": 80,
    "status": "ON_TRACK"
  }
]
```

### Create Budget

```
POST /api/v1/budgets
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Food Budget",
  "category": "Food & Dining",
  "limitAmount": 10000,
  "period": "MONTHLY",
  "notificationThreshold": 80
}
```

### Get Spending Analytics

```
GET /api/v1/analytics/breakdown?period=monthly&startDate=2024-01-01
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSpent": 45000,
    "byCategory": {
      "Food & Dining": {
        "amount": 18000,
        "percentage": 40,
        "trend": "+5%"
      },
      "Transport": {
        "amount": 12000,
        "percentage": 26.7,
        "trend": "-10%"
      },
      ...
    },
    "dailyAverage": 1500,
    "comparison": {
      "previousMonth": 42000,
      "change": "+7%"
    }
  }
}
```

### Get AI Insights

```
GET /api/v1/analytics/insights
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "title": "High Food Spending",
        "description": "Your food expenses are 40% above average for your income bracket",
        "severity": "MEDIUM",
        "recommendation": "Consider meal planning to reduce food costs by ₹5,000/month",
        "potentialSavings": 5000
      },
      ...
    ],
    "hiddenMoney": {
      "totalIdentified": 12500,
      "opportunities": [
        {
          "name": "Unused Gym Membership",
          "savings": 1000
        },
        ...
      ]
    }
  }
}
```

---

## 🛍 SHOPPING ENDPOINTS

### Search Products

```
GET /api/v1/shopping/search?q=laptop&category=electronics&minPrice=30000&maxPrice=80000&platforms=amazon,flipkart
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "name": "Dell Laptop XPS 13",
      "category": "Electronics",
      "image": "https://...",
      "rating": 4.5,
      "reviewCount": 1250,
      "prices": [
        {
          "platform": "Amazon",
          "price": 75000,
          "originalPrice": 85000,
          "discount": 12,
          "cashback": 2000,
          "finalPrice": 73000,
          "availability": "In Stock"
        },
        ...
      ],
      "bestDeal": {
        "platform": "Flipkart",
        "price": 72000
      }
    }
  ]
}
```

### Get Product Details

```
GET /api/v1/shopping/products/{productId}
Authorization: Bearer <access_token>
```

### Compare Prices

```
GET /api/v1/shopping/products/{productId}/prices
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productName": "Dell Laptop XPS 13",
    "comparison": [
      {
        "platform": "Amazon",
        "price": 75000,
        "cashback": 2000,
        "finalPrice": 73000,
        "availability": "In Stock",
        "link": "https://amazon.in/..."
      },
      ...
    ],
    "bestDeal": {
      "platform": "Flipkart",
      "finalPrice": 72000
    },
    "priceHistory": [
      {
        "date": "2024-09-10",
        "price": 78000
      },
      ...
    ],
    "bestTimeToBy": {
      "estimatedPrice": 65000,
      "expectedDate": "2024-10-15",
      "reasoning": "Diwali sale expected"
    }
  }
}
```

### Get Alternatives

```
GET /api/v1/shopping/products/{productId}/alternatives
Authorization: Bearer <access_token>
```

### Add to Wishlist

```
POST /api/v1/wishlist
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "prod_123",
  "priceAlertThreshold": 70000
}
```

### Get Wishlist

```
GET /api/v1/wishlist
Authorization: Bearer <access_token>
```

---

## 📈 INVESTMENT ENDPOINTS

### Create SIP

```
POST /api/v1/investments/sips
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "portfolioId": "port_123",
  "mutualFundId": "mf_123",
  "monthlyAmount": 5000,
  "frequency": "MONTHLY",
  "startDate": "2024-10-01",
  "endDate": "2035-09-30"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "sip_123",
    "fundName": "ICICI Prudential Bluechip Fund",
    "monthlyAmount": 5000,
    "startDate": "2024-10-01",
    "status": "ACTIVE",
    "nextSIPDate": "2024-10-01",
    "projectedReturns": {
      "10Years": 8500000,
      "expectedROI": 12.5
    }
  }
}
```

### Get SIPs

```
GET /api/v1/investments/sips
Authorization: Bearer <access_token>
```

### Get Portfolio Performance

```
GET /api/v1/investments/portfolios/{portfolioId}/performance
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolioName": "Aggressive Growth",
    "totalInvested": 250000,
    "currentValue": 280000,
    "profitLoss": 30000,
    "roi": 12,
    "allocation": {
      "equity": {
        "percentage": 60,
        "value": 168000
      },
      "debt": {
        "percentage": 30,
        "value": 84000
      },
      "gold": {
        "percentage": 10,
        "value": 28000
      }
    },
    "holdings": [
      {
        "name": "Infosys",
        "quantity": 10,
        "avgCost": 1500,
        "currentPrice": 1650,
        "value": 16500,
        "roi": 10
      }
    ]
  }
}
```

### Create Financial Goal

```
POST /api/v1/goals
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "goalName": "Buy House",
  "goalType": "HOUSE",
  "targetAmount": 5000000,
  "targetDate": "2030-12-31",
  "priority": 1,
  "description": "Down payment for house"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "goal_123",
    "goalName": "Buy House",
    "targetAmount": 5000000,
    "currentAmount": 250000,
    "progress": 5,
    "targetDate": "2030-12-31",
    "yearsRemaining": 6,
    "requiredMonthlySavings": 60000,
    "sipRecommendation": {
      "amount": 50000,
      "expectedReturn": "12.5%"
    }
  }
}
```

### Get Goal Progress

```
GET /api/v1/goals/{goalId}/progress
Authorization: Bearer <access_token>
```

### Get Investment Recommendations

```
GET /api/v1/investments/recommend
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendedPortfolio": {
      "type": "BALANCED",
      "allocation": {
        "equity": 50,
        "debt": 35,
        "gold": 15
      }
    },
    "recommendedFunds": [
      {
        "id": "mf_123",
        "name": "ICICI Bluechip",
        "category": "Large Cap",
        "rating": 5,
        "return3Y": 18.5,
        "return5Y": 15.2,
        "recommendation": "Core holding"
      }
    ],
    "reasoning": "Based on your income, expenses, and goals..."
  }
}
```

---

## 📢 NOTIFICATION ENDPOINTS

### Get Notifications

```
GET /api/v1/notifications?unread=true&limit=20
Authorization: Bearer <access_token>
```

### Mark as Read

```
PATCH /api/v1/notifications/{id}
Authorization: Bearer <access_token>

{
  "isRead": true
}
```

### Update Preferences

```
PUT /api/v1/notifications/preferences
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "emailNotifications": true,
  "smsNotifications": false,
  "whatsappNotifications": true,
  "pushNotifications": true,
  "categories": {
    "spendingAlerts": true,
    "budgetAlerts": true,
    "investmentUpdates": true,
    "promotions": false
  }
}
```

---

## 👨‍👩‍👧 FAMILY ENDPOINTS

### Create Family

```
POST /api/v1/families
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "familyName": "The Patels",
  "description": "Family savings and investment tracker"
}
```

### Add Family Member

```
POST /api/v1/families/{familyId}/members
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "wife@example.com",
  "role": "CO_ADMIN",
  "name": "Jane Doe"
}
```

### Create Family Budget

```
POST /api/v1/families/{familyId}/budgets
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Household Food Budget",
  "limitAmount": 25000,
  "period": "MONTHLY"
}
```

### Get Family Dashboard

```
GET /api/v1/families/{familyId}/dashboard
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "familyName": "The Patels",
    "members": [
      {
        "id": "user_123",
        "name": "John Patel",
        "role": "ADMIN",
        "monthlyExpenses": 45000
      }
    ],
    "totalFamilyBudget": {
      "limit": 100000,
      "spent": 85000,
      "remaining": 15000
    },
    "sharedGoals": [
      {
        "name": "Vacation to Europe",
        "target": 500000,
        "current": 250000,
        "progress": 50
      }
    ]
  }
}
```

---

## ⚡ Rate Limiting

All endpoints are rate-limited:

**Free Tier:**
- 100 requests/minute
- 10,000 requests/day

**Premium Tier:**
- 1,000 requests/minute
- 100,000 requests/day

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1694865000
```

---

## 📄 Pagination

All list endpoints support pagination:

**Query Parameters:**
```
?page=1&pageSize=20&sortBy=createdAt&sortOrder=DESC
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 500,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 🔄 Webhook Events

WealthAI sends webhooks for important events:

### Event Types

```
transaction.created
transaction.updated
budget.alert
goal.milestone
investment.sip_created
anomaly.detected
```

### Webhook Signature

All webhooks include a signature:

```
X-WealthAI-Signature: sha256=<hmac_signature>
X-WealthAI-Timestamp: 1694865000
```

### Example Payload

```json
{
  "eventId": "evt_123",
  "eventType": "transaction.created",
  "timestamp": "2024-09-16T10:30:00Z",
  "userId": "user_123",
  "data": {
    "transactionId": "txn_123",
    "amount": 1500,
    "category": "Food"
  }
}
```

---

## 📚 API Documentation Tools

### OpenAPI/Swagger
Available at: `https://api.wealthai.com/api-docs`

### GraphQL
Schema available at: `https://api.wealthai.com/graphql`

### Postman Collection
Available at: `https://www.postman.com/collections/wealthai`

---

## 🔒 Security Best Practices

1. Always use HTTPS
2. Store tokens securely (not in localStorage)
3. Implement request signing for sensitive operations
4. Use API keys for server-to-server communication
5. Implement CSRF protection
6. Validate all inputs on client and server

---

## ✅ Testing

### Test Account

```
Email: test@wealthai.com
Password: TestPass123!
Access Token: (provided after login)
```

### Sandbox Mode

All endpoints support a sandbox mode for testing:

```
X-Sandbox-Mode: true
```

---

## 📞 Support

- **API Status**: https://status.wealthai.com
- **Documentation**: https://docs.wealthai.com
- **Issues**: https://github.com/wealthai/api/issues
- **Email**: api-support@wealthai.com

