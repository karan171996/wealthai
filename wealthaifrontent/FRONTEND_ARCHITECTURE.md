# WealthAI Frontend - Architecture & Component Design

## 📐 Frontend Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Pages (Smart Components - connected to Redux)          │ │
│  │  ├─ DashboardPage, ExpensesPage, InvestmentsPage, etc  │ │
│  └─────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  COMPONENT LAYER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Organisms (Complex components)                     │  │
│  │  ├─ Dashboard, TransactionList, PortfolioChart     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Molecules (Composed components)                    │  │
│  │  ├─ Card, Button, Input, Select, etc              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Atoms (Basic UI elements)                         │  │
│  │  ├─ Icon, Text, Spinner, Badge, etc               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Custom Hooks                                       │  │
│  │  ├─ useAuth, useTransaction, useInvestment, etc    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Redux Store (State Management)                    │  │
│  │  ├─ authSlice, expenseSlice, investmentSlice       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    SERVICE LAYER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Services (Axios + Interceptors)               │  │
│  │  ├─ auth.service.ts, expense.service.ts, etc      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Utility Services                                  │  │
│  │  ├─ storage.service.ts, analytics.service.ts      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  DATA LAYER (BACKEND)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoints (REST)                              │  │
│  │  ├─ /api/v1/expenses, /api/v1/investments, etc     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WebSocket (Real-time)                             │  │
│  │  ├─ Market data, Notifications, Live updates      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### Atomic Design Pattern

#### **1. Atoms** (Smallest, single-responsibility)
```typescript
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = "font-medium rounded transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### **2. Molecules** (Combination of atoms)
```typescript
// Card.tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  action,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// Usage
<Card title="Balance" subtitle="As of today" action={<Button>See Details</Button>}>
  <div className="text-3xl font-bold">₹50,000</div>
</Card>
```

#### **3. Organisms** (Complex, multi-component sections)
```typescript
// BalanceCard.tsx
interface BalanceCardProps {
  user: User;
  balance: number;
  onViewDetails: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  user,
  balance,
  onViewDetails,
}) => {
  const percentageChange = 5.2; // Example: 5.2% growth this month

  return (
    <Card 
      title="My Balance" 
      action={<Button size="sm" onClick={onViewDetails}>View Details</Button>}
      className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
    >
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm opacity-90">Total Balance</p>
          <h2 className="text-4xl font-bold">₹{formatCurrency(balance)}</h2>
          <p className={`text-sm mt-2 ${percentageChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {percentageChange >= 0 ? '+' : '-'}{Math.abs(percentageChange)}% this month
          </p>
        </div>
        <Icon name="trending-up" size={48} opacity={0.3} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-blue-400">
        <div>
          <p className="text-xs opacity-75">Saved This Month</p>
          <p className="text-lg font-semibold">₹{formatCurrency(15000)}</p>
        </div>
        <div>
          <p className="text-xs opacity-75">Invested</p>
          <p className="text-lg font-semibold">₹{formatCurrency(150000)}</p>
        </div>
        <div>
          <p className="text-xs opacity-75">Goals Progress</p>
          <p className="text-lg font-semibold">45%</p>
        </div>
      </div>
    </Card>
  );
};
```

#### **4. Templates** (Page layouts)
```typescript
// DashboardLayout.tsx
export const DashboardLayout: React.FC<{children: ReactNode}> = ({children}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
```

#### **5. Pages** (Smart components connected to Redux)
```typescript
// DashboardPage.tsx
export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { transactions } = useAppSelector(state => state.expenses);

  useEffect(() => {
    // Fetch data on mount
    dispatch(fetchTransactions());
    dispatch(fetchPortfolio());
  }, [dispatch]);

  if (!user) return <Navigate to="/login" />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome, {user.firstName}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BalanceCard user={user} balance={50000} onViewDetails={() => {}} />
          <SpendingChart />
          <GoalsProgress />
        </div>

        <RecentTransactions transactions={transactions} />
      </div>
    </DashboardLayout>
  );
};
```

---

## 🎯 Component Design Patterns

### 1. **Presentational vs Container Pattern**

```typescript
// Presentational (Dumb) Component
interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  isLoading: boolean;
}

export const ExpenseListView: React.FC<ExpenseListProps> = ({
  expenses,
  onDelete,
  onEdit,
  isLoading,
}) => {
  if (isLoading) return <Loading />;
  if (expenses.length === 0) return <EmptyState />;

  return (
    <div className="space-y-2">
      {expenses.map(expense => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

// Container (Smart) Component
export const ExpenseListContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { expenses, isLoading } = useAppSelector(state => state.expenses);

  const handleDelete = (id: string) => {
    dispatch(deleteExpense(id));
  };

  const handleEdit = (expense: Expense) => {
    dispatch(updateExpense(expense));
  };

  return (
    <ExpenseListView
      expenses={expenses}
      onDelete={handleDelete}
      onEdit={handleEdit}
      isLoading={isLoading}
    />
  );
};
```

### 2. **Composition Pattern**

```typescript
// Flexible, composable structure
export const Dashboard = () => {
  return (
    <DashboardLayout>
      <DashboardGrid>
        <GridItem span={2}>
          <BalanceCard />
        </GridItem>
        <GridItem span={1}>
          <GoalsCard />
        </GridItem>
        <GridItem span={3}>
          <SpendingChart />
        </GridItem>
        <GridItem span={3}>
          <RecentTransactions />
        </GridItem>
      </DashboardGrid>
    </DashboardLayout>
  );
};
```

### 3. **Render Props Pattern**

```typescript
interface DataFetcherProps {
  url: string;
  children: (data: any, isLoading: boolean, error: Error | null) => ReactNode;
}

export const DataFetcher: React.FC<DataFetcherProps> = ({ url, children }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api.get(url)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [url]);

  return <>{children(data, isLoading, error)}</>;
};

// Usage
<DataFetcher url="/api/v1/expenses">
  {(expenses, isLoading, error) => (
    isLoading ? <Loading /> : <ExpenseList expenses={expenses} />
  )}
</DataFetcher>
```

### 4. **Custom Hooks Pattern**

```typescript
// Custom hook encapsulates logic
export const useExpenses = () => {
  const dispatch = useAppDispatch();
  const { expenses, isLoading, error } = useAppSelector(state => state.expenses);

  const addExpense = useCallback((expense: CreateExpenseDTO) => {
    dispatch(createExpense(expense));
  }, [dispatch]);

  const deleteExpense = useCallback((id: string) => {
    dispatch(deleteExpense(id));
  }, [dispatch]);

  const updateExpense = useCallback((expense: Expense) => {
    dispatch(updateExpense(expense));
  }, [dispatch]);

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    deleteExpense,
    updateExpense,
  };
};

// Usage
const MyComponent = () => {
  const { expenses, addExpense, isLoading } = useExpenses();

  return (
    <div>
      {isLoading ? <Loading /> : <ExpenseList expenses={expenses} />}
      <Button onClick={() => addExpense({amount: 100, ...})}>Add Expense</Button>
    </div>
  );
};
```

---

## 🔄 Data Flow

### Redux Data Flow

```
User Interaction (e.g., click "Add Expense")
                    ↓
        Component dispatches Action (thunk)
                    ↓
        Middleware (async thunk) makes API call
                    ↓
        API returns data or error
                    ↓
        Reducer updates state
                    ↓
        Component re-renders with new state
```

### Example: Adding an Expense

```typescript
// 1. User clicks "Add Expense" button
const handleAddExpense = async (data: ExpenseFormData) => {
  // 2. Dispatch thunk (async action)
  const result = await dispatch(createExpense(data));
};

// 3. Thunk (in expenseSlice.ts)
export const createExpense = createAsyncThunk(
  'expense/createExpense',
  async (data: CreateExpenseDTO, { rejectWithValue }) => {
    try {
      // 4. API call
      const response = await expenseService.createExpense(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// 5. Reducer handles result
extraReducers: (builder) => {
  builder
    .addCase(createExpense.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(createExpense.fulfilled, (state, action) => {
      // 6. Update state
      state.transactions.push(action.payload);
      state.isLoading = false;
    })
    .addCase(createExpense.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message;
    });
}

// 7. Component re-renders with new data
const { transactions } = useAppSelector(state => state.expenses);
```

---

## 🎨 Component Hierarchy Example

### Dashboard Feature

```
<Dashboard /> (Page)
  ├── <DashboardLayout /> (Template)
  │   ├── <Sidebar /> (Organism)
  │   │   └── <NavItem /> (Molecule)
  │   │       └── <Icon /> (Atom)
  │   ├── <Header /> (Organism)
  │   │   ├── <Button /> (Atom)
  │   │   └── <UserMenu /> (Molecule)
  │   └── <MainContent /> (Organism)
  │       ├── <BalanceCard /> (Organism)
  │       │   ├── <Card /> (Molecule)
  │       │   ├── <Text /> (Atom)
  │       │   └── <Icon /> (Atom)
  │       ├── <DashboardGrid /> (Molecule)
  │       │   ├── <SpendingChart /> (Organism)
  │       │   ├── <GoalsCard /> (Organism)
  │       │   └── <RecentTransactions /> (Organism)
  │       │       └── <TransactionItem /> (Molecule)
  │       │           └── <Badge /> (Atom)
  │       └── <Footer /> (Organism)
```

---

## 🛡️ Error Handling

### Error Boundary

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Send to error tracking service
    captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-gray-600 mt-2">{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### API Error Handling

```typescript
// axiosInstance with interceptors
const axiosInstance = axios.create({
  baseURL: process.env.VITE_API_URL,
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      dispatch(logout());
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Show permission error
      showToast('You don\'t have permission to do this', 'error');
    }
    
    if (error.response?.status === 429) {
      // Rate limited
      showToast('Too many requests. Please try again later.', 'error');
    }
    
    return Promise.reject(error);
  }
);
```

---

## 📊 Component Communication

### Parent to Child (Props)

```typescript
<TransactionList 
  transactions={transactions}
  onDelete={handleDelete}
  onEdit={handleEdit}
/>
```

### Child to Parent (Callbacks)

```typescript
const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  return (
    <div>
      <span>{transaction.description}</span>
      <Button onClick={() => onEdit(transaction)}>Edit</Button>
      <Button onClick={() => onDelete(transaction.id)}>Delete</Button>
    </div>
  );
};
```

### Sibling Communication (Redux)

```typescript
// Component A dispatches action
dispatch(updateFilter(newFilter));

// Component B subscribes to state
const filter = useAppSelector(state => state.expenses.filter);
```

### Cross-cutting Concerns (Context)

```typescript
// Theme context
const ThemeContext = createContext<Theme>('light');

export const ThemeProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [theme, setTheme] = useState<Theme>('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Usage in any component
const theme = useContext(ThemeContext);
```

---

## ✨ Best Practices

1. **Single Responsibility Principle**
   - Each component should do one thing well
   - Keep components small (< 200 lines)

2. **Composition over Inheritance**
   - Use composition to build complex UIs
   - Avoid deep component hierarchies

3. **Props Drilling Prevention**
   - Use Redux for global state
   - Use Context for theme/language

4. **Performance Optimization**
   - Memoize expensive computations
   - Use useCallback for event handlers
   - Use useMemo for derived state

5. **Reusability**
   - Build generic, configurable components
   - Extract common patterns into hooks
   - Use component libraries (Shadcn/ui)

6. **Testing**
   - Test components in isolation
   - Focus on user interactions
   - Mock API calls

7. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels
   - Support keyboard navigation
   - Maintain color contrast

---

