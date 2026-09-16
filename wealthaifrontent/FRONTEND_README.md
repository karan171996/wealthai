# WealthAI Frontend - Complete Documentation

## 📋 Table of Contents

- [Frontend Overview](#frontend-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Development Guide](#development-guide)
- [Features](#features)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Styling & Design System](#styling--design-system)
- [Performance](#performance)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎨 Frontend Overview

**WealthAI Frontend** is a modern, responsive web and mobile application built with React and React Native. It provides users with an intuitive interface to manage their finances, track expenses, and build wealth.

### Key Characteristics
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Real-time Updates** - WebSocket integration for live data
- ✅ **Offline Support** - Service workers for offline functionality
- ✅ **Progressive Web App** - PWA capabilities
- ✅ **Dark Mode** - Light/dark/auto theme support
- ✅ **Multi-language** - i18n support for international users
- ✅ **Accessibility** - WCAG 2.1 AA compliance
- ✅ **Performance** - Optimized bundle size and lazy loading

---

## 🛠 Tech Stack

### Web Frontend
```
Framework: React 18.2+
Language: TypeScript 5.0+
State Management: Redux Toolkit + Redux Persist
Styling: Tailwind CSS 3.0+
UI Components: Shadcn/ui
HTTP Client: Axios + Interceptors
Forms: React Hook Form + Yup validation
Charts: Recharts, Chart.js, Plotly
Date Handling: Day.js (lightweight)
Icons: Lucide React
Animations: Framer Motion
Routing: React Router v6
Build Tool: Vite
Package Manager: npm or yarn
```

### Mobile Frontend
```
Framework: React Native 0.72+
Development: Expo (managed workflow)
State Management: Redux Toolkit (shared with web)
Navigation: React Navigation v6
UI Components: React Native Paper
HTTP Client: Axios
Forms: React Hook Form
Storage: AsyncStorage, MMKV (performance)
Push Notifications: Expo Notifications
Camera: Expo Camera
File System: Expo FileSystem
Maps: React Native Maps
Charts: Victory (React Native charts)
```

### Development Tools
```
Code Editor: VSCode + Extensions
Linter: ESLint
Code Formatter: Prettier
Git Hooks: Husky + Lint-staged
Testing: Vitest + React Testing Library
E2E Testing: Cypress / Playwright
Storybook: Component documentation
Performance: Lighthouse, Web Vitals
API Mocking: MSW (Mock Service Worker)
```

---

## 📁 Project Structure

### Web Frontend

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── OAuthButtons.tsx
│   │   │   ├── MFASetup.tsx
│   │   │   └── PasswordReset.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── SpendingChart.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   ├── GoalsProgress.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── FinancialHealthScore.tsx
│   │   │
│   │   ├── expenses/
│   │   │   ├── ExpenseList.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ExpenseFilter.tsx
│   │   │   ├── ExpenseDetail.tsx
│   │   │   ├── ReceiptScanner.tsx
│   │   │   ├── BudgetTracker.tsx
│   │   │   └── SpendingTrends.tsx
│   │   │
│   │   ├── shopping/
│   │   │   ├── ProductSearch.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── PriceComparison.tsx
│   │   │   ├── Alternatives.tsx
│   │   │   ├── Wishlist.tsx
│   │   │   ├── PriceHistory.tsx
│   │   │   └── CashbackOptimizer.tsx
│   │   │
│   │   ├── investments/
│   │   │   ├── PortfolioOverview.tsx
│   │   │   ├── SIPForm.tsx
│   │   │   ├── Holdings.tsx
│   │   │   ├── GoalTracker.tsx
│   │   │   ├── PortfolioChart.tsx
│   │   │   ├── Recommendations.tsx
│   │   │   └── Rebalancing.tsx
│   │   │
│   │   ├── analytics/
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── CategoryBreakdown.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   ├── Insights.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Export.tsx
│   │   │
│   │   ├── family/
│   │   │   ├── FamilySetup.tsx
│   │   │   ├── FamilyMembers.tsx
│   │   │   ├── SharedBudget.tsx
│   │   │   ├── KidsAllowance.tsx
│   │   │   └── FamilyDashboard.tsx
│   │   │
│   │   ├── settings/
│   │   │   ├── ProfileSettings.tsx
│   │   │   ├── NotificationPreferences.tsx
│   │   │   ├── SecuritySettings.tsx
│   │   │   ├── BillingSettings.tsx
│   │   │   ├── LinkedAccounts.tsx
│   │   │   └── DataManagement.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Checkbox.tsx
│   │       ├── Tabs.tsx
│   │       ├── Toast.tsx
│   │       ├── Tooltip.tsx
│   │       └── Pagination.tsx
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ExpensesPage.tsx
│   │   ├── InvestmentsPage.tsx
│   │   ├── ShoppingPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── FamilyPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTransaction.ts
│   │   ├── useInvestment.ts
│   │   ├── useNotification.ts
│   │   ├── useFetch.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   └── useWebSocket.ts
│   │
│   ├── services/
│   │   ├── api.ts (Axios instance)
│   │   ├── auth.service.ts
│   │   ├── expense.service.ts
│   │   ├── investment.service.ts
│   │   ├── shopping.service.ts
│   │   ├── analytics.service.ts
│   │   ├── notification.service.ts
│   │   └── storage.service.ts
│   │
│   ├── store/
│   │   ├── index.ts
│   │   ├── hooks.ts (typed selectors)
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── expenseSlice.ts
│   │       ├── investmentSlice.ts
│   │       ├── uiSlice.ts
│   │       ├── notificationSlice.ts
│   │       └── userSlice.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts (currency, date, number)
│   │   ├── validators.ts (form validation)
│   │   ├── constants.ts (app constants)
│   │   ├── helpers.ts (utility functions)
│   │   ├── api-errors.ts (error handling)
│   │   └── analytics.ts (tracking)
│   │
│   ├── styles/
│   │   ├── index.css
│   │   ├── tailwind.config.ts
│   │   ├── themes/
│   │   │   ├── light.css
│   │   │   ├── dark.css
│   │   │   └── variables.css
│   │   └── globals/
│   │       ├── animations.css
│   │       └── scrollbar.css
│   │
│   ├── types/
│   │   ├── index.ts (all types)
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── expense.ts
│   │   ├── investment.ts
│   │   └── ui.ts
│   │
│   ├── constants/
│   │   ├── api.ts
│   │   ├── routes.ts
│   │   ├── messages.ts
│   │   └── config.ts
│   │
│   ├── i18n/
│   │   ├── i18n.ts
│   │   ├── en.json
│   │   ├── hi.json
│   │   └── es.json
│   │
│   ├── App.tsx (Root component)
│   ├── main.tsx (Entry point)
│   └── vite-env.d.ts
│
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 💻 Installation & Setup

### Prerequisites

```bash
Node.js 18+ (LTS recommended)
npm 9+ or yarn 4+
Git
VSCode (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Thunder Client (API testing)
```

### Installation Steps

```bash
# Clone repository
git clone https://github.com/wealthai/wealthai.git
cd wealthai/frontend

# Install dependencies
npm install
# or
yarn install

# Setup environment
cp .env.example .env.local

# Edit .env.local with your values
# VITE_API_URL=http://localhost:3000/api/v1
# VITE_CLAUDE_API_KEY=your_key
# etc

# Start development server
npm run dev
# or
yarn dev

# Open browser
# http://localhost:5173
```

### .env.local Configuration

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=30000

# Authentication
VITE_AUTH_REDIRECT_URI=http://localhost:5173/auth/callback

# Third-party Services
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_PLAID_CLIENT_ID=client_id_...
VITE_GOOGLE_OAUTH_CLIENT_ID=client_id_...

# Features
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PWA=true
VITE_ENABLE_DARK_MODE=true

# Analytics
VITE_SENTRY_DSN=https://...
VITE_GA_MEASUREMENT_ID=G-...

# Environment
VITE_ENV=development
VITE_LOG_LEVEL=debug
```

---

## 🚀 Development Guide

### Development Workflow

```bash
# Start dev server with hot reload
npm run dev

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Clean build
npm run clean

# Run tests
npm run test
npm run test:watch
npm run test:coverage

# E2E tests
npm run test:e2e
npm run test:e2e:ui

# Generate component stories
npm run storybook
```

### Code Organization Principles

1. **Atomic Design Pattern**
   - Atoms: Basic UI elements (Button, Input)
   - Molecules: Combinations (Card, SearchBox)
   - Organisms: Complex sections (Header, Dashboard)
   - Pages: Full page layouts
   - Templates: Page templates

2. **Feature-Based Organization**
   - Group by features (expenses, investments)
   - Each feature has components, hooks, services
   - Easier to scale and maintain

3. **Separation of Concerns**
   - Components: UI only
   - Services: API calls
   - Hooks: Logic reuse
   - Store: Global state
   - Utils: Helper functions

---

## ✨ Features

### 🎯 Core Features Implemented

#### 1. **Authentication**
- Email/password registration and login
- Social login (Google, Apple OAuth2)
- JWT token management
- 2FA/MFA setup
- Password reset flow
- Session persistence

#### 2. **Dashboard**
- Net worth overview
- Spending summary
- Quick action buttons
- Recent transactions
- Goal progress tracking
- Financial health score
- Real-time updates via WebSocket

#### 3. **Expense Management**
- Add/edit/delete transactions
- AI-powered categorization
- Receipt scanning with OCR
- Budget tracking
- Recurring transactions
- Spending trends & analytics
- Category-wise breakdown
- Search and filter

#### 4. **Shopping Assistant**
- Product search across platforms
- Real-time price comparison
- Alternative product suggestions
- Cashback optimization
- Wishlist management
- Price history tracking
- Best time to buy predictions

#### 5. **Investment Tracker**
- Portfolio overview
- SIP management
- Goal tracking
- Holdings management
- Performance analytics
- Recommendations
- Portfolio rebalancing suggestions

#### 6. **Analytics & Insights**
- Spending breakdown (daily/weekly/monthly)
- Category trends
- AI-generated insights
- Hidden money discovery
- Custom reports
- Export to PDF/CSV

#### 7. **Family Finance**
- Multi-user family setup
- Shared budgets
- Kids allowance tracking
- Chore management
- Family goals

#### 8. **Settings & Preferences**
- Profile management
- Account security
- Notification preferences
- Billing management
- Data management
- Theme/language settings

---

## 🏗️ Component Architecture

### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   ├── Sidebar/Navigation
│   ├── MainContent
│   │   ├── Page Routes
│   │   │   ├── Dashboard
│   │   │   ├── Expenses
│   │   │   ├── Investments
│   │   │   ├── Shopping
│   │   │   ├── Analytics
│   │   │   ├── Family
│   │   │   └── Settings
│   │   └── RightSidebar (notifications)
│   └── Footer
└── Modals/Dialogs
```

### Component Categories

#### **Common Components**
- `Header.tsx` - Top navigation bar
- `Sidebar.tsx` - Side navigation
- `Navigation.tsx` - Route navigation
- `Footer.tsx` - Footer information
- `Loading.tsx` - Loading states
- `ErrorBoundary.tsx` - Error handling

#### **Auth Components**
- `LoginForm.tsx` - Email/password login
- `RegisterForm.tsx` - User registration
- `OAuthButtons.tsx` - Social login buttons
- `MFASetup.tsx` - 2FA setup flow
- `PasswordReset.tsx` - Password reset

#### **Dashboard Components**
- `Dashboard.tsx` - Main dashboard page
- `BalanceCard.tsx` - Net worth display
- `SpendingChart.tsx` - Monthly spending chart
- `RecentTransactions.tsx` - Recent activity list
- `GoalsProgress.tsx` - Financial goals progress
- `QuickActions.tsx` - Quick action buttons

#### **Expense Components**
- `ExpenseList.tsx` - List with filtering
- `ExpenseForm.tsx` - Add/edit expense form
- `ExpenseFilter.tsx` - Advanced filtering
- `ExpenseDetail.tsx` - Single expense detail
- `ReceiptScanner.tsx` - Receipt scanning UI
- `BudgetTracker.tsx` - Budget overview
- `SpendingTrends.tsx` - Trend analysis

#### **Shopping Components**
- `ProductSearch.tsx` - Search interface
- `ProductCard.tsx` - Individual product display
- `PriceComparison.tsx` - Price comparison table
- `Alternatives.tsx` - Suggested alternatives
- `Wishlist.tsx` - Wishlist management
- `PriceHistory.tsx` - Historical price chart
- `CashbackOptimizer.tsx` - Cashback calculator

#### **Investment Components**
- `PortfolioOverview.tsx` - Portfolio summary
- `SIPForm.tsx` - Create/edit SIP
- `Holdings.tsx` - Holdings list
- `GoalTracker.tsx` - Goal tracking
- `PortfolioChart.tsx` - Allocation chart
- `Recommendations.tsx` - Investment suggestions
- `Rebalancing.tsx` - Rebalancing plan

#### **UI Components (Reusable)**
- `Button.tsx` - Styled button variants
- `Card.tsx` - Card container
- `Modal.tsx` - Modal dialog
- `Input.tsx` - Form input field
- `Select.tsx` - Dropdown select
- `Tabs.tsx` - Tab navigation
- `Toast.tsx` - Toast notifications
- `Pagination.tsx` - Pagination controls

---

## 🔄 State Management

### Redux Store Structure

```typescript
// Store setup
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    expenses: expenseSlice.reducer,
    investments: investmentSlice.reducer,
    ui: uiSlice.reducer,
    notifications: notificationSlice.reducer,
    user: userSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiMiddleware)
      .concat(errorMiddleware),
  devTools: process.env.NODE_ENV === 'development',
});
```

### Redux Slices

```typescript
// authSlice.ts - Authentication state
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaRequired: boolean;
}

// expenseSlice.ts - Expenses state
interface ExpenseState {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  filters: ExpenseFilters;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;
}

// investmentSlice.ts - Investments state
interface InvestmentState {
  portfolios: Portfolio[];
  sips: SIP[];
  goals: FinancialGoal[];
  holdings: Holding[];
  isLoading: boolean;
  error: string | null;
}

// uiSlice.ts - UI state
interface UIState {
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  modalOpen: boolean;
  notifications: Toast[];
  darkMode: boolean;
}

// notificationSlice.ts - Notifications
interface NotificationState {
  unread: Notification[];
  all: Notification[];
  preferences: NotificationPreferences;
  isLoading: boolean;
}
```

### Accessing State

```typescript
// Using typed hooks
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const isLoading = useAppSelector(state => state.auth.isLoading);
  
  return (
    <div>
      {isLoading ? <Loading /> : <div>{user?.name}</div>}
    </div>
  );
}
```

---

## 🎨 Styling & Design System

### Tailwind CSS Configuration

```javascript
// tailwind.config.ts
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### Design Tokens

```css
/* styles/variables.css */
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-secondary: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1f2937;
    --color-text: #f3f4f6;
  }
}
```

### Responsive Design

```typescript
// Component with responsive classes
export function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="col-span-1 md:col-span-2">
        {/* Balance Card */}
      </Card>
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        {/* Goals */}
      </Card>
    </div>
  );
}
```

---

## ⚡ Performance Optimization

### Key Optimizations

1. **Code Splitting**
```typescript
// Lazy load pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage'));

// Use in routes
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
</Suspense>
```

2. **Image Optimization**
```typescript
// Use next-gen formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="description" loading="lazy" />
</picture>
```

3. **Memoization**
```typescript
// Memoize expensive components
const PortfolioChart = memo(({ data }: Props) => {
  return <Chart data={data} />;
});
```

4. **Bundle Analysis**
```bash
npm run build:analyze
# Visualize bundle size
```

5. **Web Vitals**
```typescript
// Monitor performance
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getFCP(console.log);
getLCP(console.log);
getCLS(console.log);
getFID(console.log);
getTTFB(console.log);
```

---

## 🧪 Testing

### Unit Tests

```typescript
// components/__tests__/BalanceCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BalanceCard } from '../BalanceCard';

describe('BalanceCard', () => {
  it('displays balance correctly', () => {
    render(<BalanceCard balance={50000} currency="INR" />);
    expect(screen.getByText('₹50,000')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// tests/integration/auth.test.ts
describe('Authentication Flow', () => {
  it('should login user successfully', async () => {
    const { user } = render(<LoginPage />);
    
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

```typescript
// tests/e2e/dashboard.spec.ts
describe('Dashboard', () => {
  it('should load and display balance', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="balance-amount"]')).toBeVisible();
  });
});
```

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E UI
npm run test:e2e:ui
```

---

## 📱 Mobile App (React Native)

### Expo Setup

```bash
# Create React Native app with Expo
npx create-expo-app wealthai-mobile
cd wealthai-mobile

# Install dependencies
npm install @react-navigation/native react-native-screens react-native-safe-area-context
npm install redux react-redux @reduxjs/toolkit axios react-hook-form

# Start development
npm start
# Scan QR with Expo Go app
```

### Mobile-Specific Features

```typescript
// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export function MobileApp() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} />
        <Tab.Screen name="Shopping" component={ShoppingScreen} />
        <Tab.Screen name="Investments" component={InvestmentsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Camera for receipt scanning
import { CameraView, useCameraPermissions } from 'expo-camera';

export function ReceiptCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  
  if (!permission?.granted) {
    return <Button title="Grant Camera" onPress={requestPermission} />;
  }
  
  return (
    <CameraView
      facing="back"
      onBarcodeScanned={({ data }) => handleReceiptScan(data)}
    />
  );
}

// Offline storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

const retrieveData = async (key) => {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};
```

---

## 🚀 Build & Deployment

### Build for Production

```bash
# Build web app
npm run build

# Output in dist/
# Build size: ~200-250KB (gzipped)

# Preview production build
npm run preview

# Analyze bundle
npm run build:analyze
```

### Deployment Options

#### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### **Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### **AWS S3 + CloudFront**
```bash
aws s3 sync dist/ s3://wealthai-frontend/
aws cloudfront create-invalidation --distribution-id E123456 --paths "/*"
```

#### **Docker**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Vite Not Starting**
```bash
# Clear node_modules and cache
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**2. TypeScript Errors**
```bash
# Clear TypeScript cache
rm -rf .tsbuildinfo
npm run type-check
```

**3. Redux DevTools Not Working**
```bash
# Install Redux DevTools extension in browser
# https://github.com/reduxjs/redux-devtools-extension
```

**4. API Calls Failing**
```bash
# Check .env.local
# Verify VITE_API_URL is correct
# Check backend is running
curl http://localhost:3000/api/v1/health
```

**5. Hot Reload Not Working**
```bash
# In vite.config.ts
export default {
  server: {
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
};
```

---

## 📚 Additional Resources

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Router](https://reactrouter.com/)
- [Vite Guide](https://vitejs.dev/guide/)

### Tools
- [Storybook Components](http://localhost:6006) (after `npm run storybook`)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools-extension)
- [React DevTools](https://react-devtools-tutorial.vercel.app/)

### Performance
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/vite-plugin-visualizer)

---

## 📝 Git Workflow

### Branch Naming
```
feature/feature-name
bugfix/bug-name
refactor/refactor-name
docs/documentation-name
```

### Commit Messages
```
feat: Add expense categorization
fix: Fix date picker bug
refactor: Extract API logic to service
docs: Update README
style: Fix spacing issues
test: Add unit tests for Dashboard
```

### Pull Request Process
1. Create feature branch
2. Make changes with atomic commits
3. Push to GitHub
4. Create PR with description
5. Request code review
6. Address feedback
7. Squash and merge

---

## 🎯 Best Practices

1. **Component Design**
   - Keep components small and focused
   - Use composition over inheritance
   - Prop drill wisely, use Redux for global state

2. **Performance**
   - Lazy load routes
   - Memoize expensive components
   - Use React.memo for pure components
   - Optimize renders with useCallback

3. **Code Quality**
   - Write tests for critical paths
   - Use TypeScript strict mode
   - Follow ESLint/Prettier rules
   - Document complex logic

4. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels
   - Test with keyboard navigation
   - Maintain color contrast

5. **Security**
   - Store tokens securely
   - Validate all inputs
   - Use HTTPS always
   - Implement CSRF protection

---

## 📞 Support

- **Questions**: Create GitHub issue
- **Bug Reports**: Use bug report template
- **Feature Requests**: Use feature request template
- **Email**: frontend-team@wealthai.com

---

**Built with ❤️ by WealthAI Frontend Team**

