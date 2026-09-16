# WealthAI Frontend - Testing & Performance Guide

## 🧪 Testing Strategy

### Test Pyramid

```
        /\
       /  \
      / E2E \      (5-10% - Full user journeys)
     /______\
      /\    /\
     /  \  /  \
    / Int\ / Int\  (15-20% - Feature integration tests)
   /______\______\
    /\    /\    /\
   /  \  /  \  /  \
  / U  \/ U  \/ U  \ (70-75% - Unit tests)
 /______\____\______\
```

### Testing Tools

```
Unit Testing:
├─ Vitest (fast unit test runner)
├─ React Testing Library (component testing)
├─ Jest Matchers

Integration Testing:
├─ Vitest with RTL
├─ MSW (Mock Service Worker)

E2E Testing:
├─ Cypress (recommended)
├─ Playwright (alternative)

Test Reporting:
├─ Coverage reports
├─ Dashboard integration
```

---

## 🧩 Unit Testing

### Component Unit Tests

```typescript
// components/__tests__/BalanceCard.test.tsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BalanceCard } from '../BalanceCard';

describe('BalanceCard Component', () => {
  const mockStore = configureStore({
    reducer: {
      auth: (state = { user: { id: '1', name: 'John' } }) => state,
      ui: (state = {}) => state,
    },
  });

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
  };

  it('renders balance correctly', () => {
    render(
      <Provider store={mockStore}>
        <BalanceCard user={mockUser} balance={50000} onViewDetails={() => {}} />
      </Provider>
    );

    expect(screen.getByText('My Balance')).toBeInTheDocument();
    expect(screen.getByText(/₹50,000/)).toBeInTheDocument();
  });

  it('displays percentage change', () => {
    render(
      <Provider store={mockStore}>
        <BalanceCard user={mockUser} balance={50000} onViewDetails={() => {}} />
      </Provider>
    );

    const percentageText = screen.getByText(/this month/);
    expect(percentageText).toBeInTheDocument();
  });

  it('calls onViewDetails when button is clicked', async () => {
    const handleViewDetails = jest.fn();

    render(
      <Provider store={mockStore}>
        <BalanceCard 
          user={mockUser} 
          balance={50000} 
          onViewDetails={handleViewDetails} 
        />
      </Provider>
    );

    const button = screen.getByRole('button', { name: /view details/i });
    await userEvent.click(button);

    expect(handleViewDetails).toHaveBeenCalled();
  });

  it('applies dark theme styling', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <BalanceCard user={mockUser} balance={50000} onViewDetails={() => {}} />
      </Provider>
    );

    const card = container.querySelector('[data-testid="balance-card"]');
    expect(card).toHaveClass('bg-gradient-to-r', 'from-blue-600');
  });
});
```

### Hook Testing

```typescript
// hooks/__tests__/useExpenses.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useExpenses } from '../useExpenses';
import expenseReducer from '@/store/slices/expenseSlice';

describe('useExpenses Hook', () => {
  const createWrapper = () => {
    const store = configureStore({
      reducer: { expenses: expenseReducer },
    });

    return ({ children }: any) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  it('fetches expenses on mount', async () => {
    const { result } = renderHook(() => useExpenses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions.length).toBeGreaterThan(0);
  });

  it('adds expense successfully', async () => {
    const { result } = renderHook(() => useExpenses(), {
      wrapper: createWrapper(),
    });

    const newExpense = {
      amount: 500,
      description: 'Groceries',
      category: 'Food',
    };

    await act(async () => {
      await result.current.addExpense(newExpense);
    });

    await waitFor(() => {
      expect(result.current.transactions).toContainEqual(
        expect.objectContaining(newExpense)
      );
    });
  });

  it('handles errors gracefully', async () => {
    const { result } = renderHook(() => useExpenses(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.addExpense({} as any);
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### Service Testing

```typescript
// services/__tests__/expense.service.test.ts
import { expenseService } from '@/services/expense.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Expense Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches expenses', async () => {
    const mockExpenses = [
      { id: '1', amount: 100, category: 'Food' },
      { id: '2', amount: 50, category: 'Transport' },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockExpenses,
      },
    });

    const result = await expenseService.getTransactions();

    expect(result).toEqual(mockExpenses);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/expenses',
      expect.any(Object)
    );
  });

  it('creates expense', async () => {
    const newExpense = {
      amount: 100,
      description: 'Groceries',
      category: 'Food',
    };

    const createdExpense = {
      id: '1',
      ...newExpense,
      createdAt: new Date().toISOString(),
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: createdExpense,
      },
    });

    const result = await expenseService.createTransaction(newExpense);

    expect(result).toEqual(createdExpense);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/v1/expenses',
      newExpense,
      expect.any(Object)
    );
  });

  it('handles API errors', async () => {
    mockedAxios.get.mockRejectedValueOnce(
      new Error('API Error: 500 Internal Server Error')
    );

    await expect(expenseService.getTransactions()).rejects.toThrow('API Error');
  });
});
```

---

## 🔗 Integration Testing

### Feature Integration Tests

```typescript
// tests/integration/expenses.integration.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ExpensesPage } from '@/pages/ExpensesPage';

const server = setupServer(
  rest.get('/api/v1/expenses', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          { id: '1', amount: 100, description: 'Groceries', category: 'Food' },
          { id: '2', amount: 50, description: 'Gas', category: 'Transport' },
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 2 },
      })
    );
  }),

  rest.post('/api/v1/expenses', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: '3',
          amount: 75,
          description: 'Restaurant',
          category: 'Food',
        },
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Expenses Feature', () => {
  it('loads and displays expenses', async () => {
    render(
      <Provider store={createMockStore()}>
        <ExpensesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Gas')).toBeInTheDocument();
    });
  });

  it('adds new expense', async () => {
    const user = userEvent.setup();

    render(
      <Provider store={createMockStore()}>
        <ExpensesPage />
      </Provider>
    );

    // Wait for initial expenses to load
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    // Click "Add Expense" button
    const addButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(addButton);

    // Fill in form
    await user.type(screen.getByLabelText(/description/i), 'Restaurant');
    await user.type(screen.getByLabelText(/amount/i), '75');
    await user.selectOption(screen.getByLabelText(/category/i), 'Food');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Verify new expense appears
    await waitFor(() => {
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
    });
  });

  it('deletes expense', async () => {
    const user = userEvent.setup();

    render(
      <Provider store={createMockStore()}>
        <ExpensesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify expense is removed
    await waitFor(() => {
      expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
    });
  });
});
```

---

## 🎯 E2E Testing

### Cypress E2E Tests

```typescript
// tests/e2e/dashboard.spec.ts
describe('Dashboard', () => {
  beforeEach(() => {
    // Login and navigate to dashboard
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button').contains('Login').click();
    cy.url().should('include', '/dashboard');
  });

  it('displays user balance', () => {
    cy.get('[data-testid="balance-amount"]').should('be.visible');
    cy.get('[data-testid="balance-amount"]').should('contain', '₹');
  });

  it('shows recent transactions', () => {
    cy.get('[data-testid="recent-transactions"]').should('exist');
    cy.get('[data-testid="recent-transactions"] li').should('have.length.gt', 0);
  });

  it('displays financial health score', () => {
    cy.get('[data-testid="health-score"]').should('be.visible');
    cy.get('[data-testid="health-score"]').should('contain', '%');
  });

  it('navigates to expenses page', () => {
    cy.get('a').contains('Expenses').click();
    cy.url().should('include', '/expenses');
    cy.get('[data-testid="expense-list"]').should('be.visible');
  });

  it('adds new expense', () => {
    cy.get('a').contains('Expenses').click();
    cy.get('button').contains('Add Expense').click();

    cy.get('input[placeholder="Amount"]').type('500');
    cy.get('input[placeholder="Description"]').type('Groceries');
    cy.get('select[name="category"]').select('Food');

    cy.get('button').contains('Add').click();

    cy.get('[data-testid="expense-list"]').should('contain', 'Groceries');
  });

  it('filters expenses by category', () => {
    cy.get('a').contains('Expenses').click();

    cy.get('select[name="category"]').select('Food');
    cy.get('button').contains('Filter').click();

    cy.get('[data-testid="expense-list"] li').each(($el) => {
      cy.wrap($el).should('contain', 'Food');
    });
  });

  it('responsive on mobile', () => {
    cy.viewport('iphone-x');

    cy.get('[data-testid="sidebar"]').should('not.be.visible');
    cy.get('[data-testid="hamburger-menu"]').click();
    cy.get('[data-testid="sidebar"]').should('be.visible');
  });
});
```

---

## ⚡ Performance Optimization

### 1. Code Splitting

```typescript
// routes/index.tsx
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/common/Loading';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage'));
const InvestmentsPage = lazy(() => import('@/pages/InvestmentsPage'));
const ShoppingPage = lazy(() => import('@/pages/ShoppingPage'));

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <Suspense fallback={<Loading />}>
          <DashboardPage />
        </Suspense>
      } />
      <Route path="/expenses" element={
        <Suspense fallback={<Loading />}>
          <ExpensesPage />
        </Suspense>
      } />
      {/* More routes... */}
    </Routes>
  );
};
```

### 2. Component Memoization

```typescript
// Memoize expensive components
import { memo } from 'react';

interface PortfolioChartProps {
  data: ChartData;
  isLoading: boolean;
}

export const PortfolioChart = memo(
  ({ data, isLoading }: PortfolioChartProps) => {
    return (
      <div>
        {isLoading ? <Loading /> : <Chart data={data} />}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.isLoading === nextProps.isLoading &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    );
  }
);
```

### 3. useCallback for Event Handlers

```typescript
const ExpenseForm = ({ onSubmit }: Props) => {
  const [formData, setFormData] = useState({});

  // Memoize callback to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    },
    []
  );

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};
```

### 4. useMemo for Derived State

```typescript
const BudgetOverview = ({ transactions, budgets }: Props) => {
  // Memoize expensive calculation
  const budgetStatus = useMemo(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...budget,
        spent,
        percentageUsed: (spent / budget.limit) * 100,
        isOver: spent > budget.limit,
      };
    });
  }, [transactions, budgets]);

  return (
    <div>
      {budgetStatus.map(status => (
        <BudgetItem key={status.id} {...status} />
      ))}
    </div>
  );
};
```

### 5. Image Optimization

```typescript
// Image component with lazy loading
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
}> = ({ src, alt, width, height }) => {
  return (
    <picture>
      <source srcSet={`${src}.webp`} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="w-full h-auto"
      />
    </picture>
  );
};
```

### 6. Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList } from 'react-window';

const ExpenseList = ({ transactions }: Props) => {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <ExpenseItem transaction={transactions[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={transactions.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 7. Web Vitals Monitoring

```typescript
// utils/web-vitals.ts
import {
  getCLS,
  getFID,
  getFCP,
  getLCP,
  getTTFB,
} from 'web-vitals';

export const reportWebVitals = (onReport?: (metric: any) => void) => {
  getCLS(onReport);
  getFID(onReport);
  getFCP(onReport);
  getLCP(onReport);
  getTTFB(onReport);
};

// main.tsx
reportWebVitals((metric) => {
  console.log(metric);
  // Send to analytics
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics(metric);
  }
});
```

### 8. Bundle Analysis

```bash
npm run build:analyze
# or
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/stats.json
```

### 9. Lighthouse CI

```yaml
# lighthouse-ci.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/dashboard",
        "http://localhost:3000/expenses"
      ],
      "numberOfRuns": 3
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 4000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Largest Contentful Paint (LCP) | < 2.5s | - |
| First Input Delay (FID) | < 100ms | - |
| Cumulative Layout Shift (CLS) | < 0.1 | - |
| Bundle Size (gzipped) | < 250KB | - |
| Lighthouse Score | > 90 | - |
| Time to Interactive | < 3.5s | - |

---

## 🔍 Performance Checklist

- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Lazy loading enabled
- [ ] Memoization applied to expensive components
- [ ] useCallback used for event handlers
- [ ] useMemo used for derived state
- [ ] Redux DevTools only in dev
- [ ] Service worker caching strategy implemented
- [ ] API responses cached appropriately
- [ ] Bundle analyzed and optimized
- [ ] Lighthouse scores > 90 for all pages
- [ ] Web Vitals monitored in production
- [ ] CI configured with Lighthouse
- [ ] Performance monitored with Sentry

---

