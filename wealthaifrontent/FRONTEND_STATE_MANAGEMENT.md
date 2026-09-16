# WealthAI Frontend - State Management & Redux Guide

## 🔄 Redux Architecture

### Store Setup

```typescript
// store/index.ts
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { expenseReducer } from './slices/expenseSlice';
import { investmentReducer } from './slices/investmentSlice';
import { uiReducer } from './slices/uiSlice';
import { notificationReducer } from './slices/notificationSlice';
import { userReducer } from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
    investments: investmentReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(loggerMiddleware)
      .concat(errorMiddleware),
  devTools: process.env.NODE_ENV === 'development',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
```

### Typed Hooks

```typescript
// store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 🔐 Auth Slice

### State Definition

```typescript
// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaRequired: boolean;
  mfaToken: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  isLoading: false,
  error: null,
  mfaRequired: false,
  mfaToken: null,
};

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const verifyMFA = createAsyncThunk(
  'auth/verifyMFA',
  async ({ mfaToken, code }: { mfaToken: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyMFA(mfaToken, code);
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as RootState;
      if (!auth.refreshToken) {
        throw new Error('No refresh token');
      }
      
      const response = await authService.refreshToken(auth.refreshToken);
      localStorage.setItem('authToken', response.accessToken);
      return response;
    } catch (error: any) {
      // Clear auth if refresh fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      return rejectWithValue('Session expired');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.mfaRequired = action.payload.requiresMFA || false;
        if (action.payload.mfaToken) {
          state.mfaToken = action.payload.mfaToken;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.mfaRequired = false;
      });

    // Verify MFA
    builder
      .addCase(verifyMFA.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.mfaRequired = false;
        state.mfaToken = null;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export const authReducer = authSlice.reducer;
```

---

## 💰 Expense Slice

### State Definition

```typescript
// store/slices/expenseSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { expenseService } from '@/services/expense.service';

export interface ExpenseState {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  recurringTransactions: RecurringTransaction[];
  isLoading: boolean;
  error: string | null;
  filters: ExpenseFilters;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  selectedTransaction: Transaction | null;
}

const initialState: ExpenseState = {
  transactions: [],
  budgets: [],
  categories: [],
  recurringTransactions: [],
  isLoading: false,
  error: null,
  filters: {
    category: null,
    dateRange: { start: null, end: null },
    minAmount: null,
    maxAmount: null,
    searchText: '',
  },
  pagination: {
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  selectedTransaction: null,
};

// Async Thunks
export const fetchTransactions = createAsyncThunk(
  'expenses/fetchTransactions',
  async (
    { page = 1, filters }: { page?: number; filters?: ExpenseFilters },
    { rejectWithValue }
  ) => {
    try {
      const response = await expenseService.getTransactions(page, filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'expenses/createTransaction',
  async (data: CreateTransactionDTO, { rejectWithValue }) => {
    try {
      const response = await expenseService.createTransaction(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'expenses/updateTransaction',
  async ({ id, data }: { id: string; data: UpdateTransactionDTO }, { rejectWithValue }) => {
    try {
      const response = await expenseService.updateTransaction(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'expenses/deleteTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      await expenseService.deleteTransaction(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const fetchBudgets = createAsyncThunk(
  'expenses/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await expenseService.getBudgets();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const createBudget = createAsyncThunk(
  'expenses/createBudget',
  async (data: CreateBudgetDTO, { rejectWithValue }) => {
    try {
      const response = await expenseService.createBudget(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'expenses/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await expenseService.getCategories();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

// Slice
const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ExpenseFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    setPagination: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Transaction
    builder
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.selectedTransaction?.id === action.payload.id) {
          state.selectedTransaction = action.payload;
        }
      });

    // Delete Transaction
    builder
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
      });

    // Fetch Budgets
    builder
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.budgets = action.payload;
      });

    // Create Budget
    builder
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload);
      });

    // Fetch Categories
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { setFilters, setPagination, setSelectedTransaction, clearError } = expenseSlice.actions;
export const expenseReducer = expenseSlice.reducer;
```

---

## 📈 Investment Slice

```typescript
// store/slices/investmentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { investmentService } from '@/services/investment.service';

export interface InvestmentState {
  portfolios: Portfolio[];
  sips: SIP[];
  goals: FinancialGoal[];
  holdings: Holding[];
  recommendations: InvestmentRecommendation[];
  isLoading: boolean;
  error: string | null;
  selectedPortfolio: Portfolio | null;
}

const initialState: InvestmentState = {
  portfolios: [],
  sips: [],
  goals: [],
  holdings: [],
  recommendations: [],
  isLoading: false,
  error: null,
  selectedPortfolio: null,
};

export const fetchPortfolios = createAsyncThunk(
  'investments/fetchPortfolios',
  async (_, { rejectWithValue }) => {
    try {
      return await investmentService.getPortfolios();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const fetchSIPs = createAsyncThunk(
  'investments/fetchSIPs',
  async (_, { rejectWithValue }) => {
    try {
      return await investmentService.getSIPs();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const createSIP = createAsyncThunk(
  'investments/createSIP',
  async (data: CreateSIPDTO, { rejectWithValue }) => {
    try {
      return await investmentService.createSIP(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const fetchGoals = createAsyncThunk(
  'investments/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      return await investmentService.getGoals();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const createGoal = createAsyncThunk(
  'investments/createGoal',
  async (data: CreateGoalDTO, { rejectWithValue }) => {
    try {
      return await investmentService.createGoal(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const getRecommendations = createAsyncThunk(
  'investments/getRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      return await investmentService.getRecommendations();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

const investmentSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    setSelectedPortfolio: (state, action) => {
      state.selectedPortfolio = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolios.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.isLoading = false;
        state.portfolios = action.payload;
      })
      .addCase(fetchPortfolios.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSIPs.fulfilled, (state, action) => {
        state.sips = action.payload;
      })
      .addCase(createSIP.fulfilled, (state, action) => {
        state.sips.push(action.payload);
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.goals = action.payload;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })
      .addCase(getRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      });
  },
});

export const investmentReducer = investmentSlice.reducer;
```

---

## 🎨 UI Slice

```typescript
// store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  selectedNavigation: string;
  modals: {
    [key: string]: boolean;
  };
  toasts: Toast[];
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as any) || 'auto',
  sidebarOpen: window.innerWidth > 1024,
  selectedNavigation: '/dashboard',
  modals: {},
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSelectedNavigation: (state, action: PayloadAction<string>) => {
      state.selectedNavigation = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    showToast: (state, action: PayloadAction<Toast>) => {
      state.toasts.push({
        ...action.payload,
        id: Date.now(),
      });
    },
    removeToast: (state, action: PayloadAction<number>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSelectedNavigation,
  openModal,
  closeModal,
  showToast,
  removeToast,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
```

---

## 🎣 Using Redux in Components

### In Functional Components

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTransactions, setFilters } from '@/store/slices/expenseSlice';

export const ExpensesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    transactions,
    isLoading,
    error,
    filters,
    pagination,
  } = useAppSelector(state => state.expenses);

  useEffect(() => {
    dispatch(fetchTransactions({ page: 1, filters }));
  }, [dispatch, filters]);

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <ExpenseFilters
        filters={filters}
        onFilterChange={(newFilters) => dispatch(setFilters(newFilters))}
      />
      <ExpenseList transactions={transactions} />
      <Pagination {...pagination} />
    </div>
  );
};
```

### Custom Hooks for Convenience

```typescript
// hooks/useExpenses.ts
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  setFilters,
} from '@/store/slices/expenseSlice';

export const useExpenses = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.expenses);

  const addExpense = useCallback(
    (data: CreateTransactionDTO) => {
      return dispatch(createTransaction(data));
    },
    [dispatch]
  );

  const removeExpense = useCallback(
    (id: string) => {
      return dispatch(deleteTransaction(id));
    },
    [dispatch]
  );

  const applyFilters = useCallback(
    (filters: ExpenseFilters) => {
      dispatch(setFilters(filters));
    },
    [dispatch]
  );

  return {
    ...state,
    addExpense,
    removeExpense,
    applyFilters,
  };
};

// Usage
const MyComponent = () => {
  const { transactions, addExpense, isLoading } = useExpenses();
  // ... rest of component
};
```

---

## 🔄 Middleware

### Logging Middleware

```typescript
// store/middleware/loggerMiddleware.ts
const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.log('Dispatching:', action);
  const result = next(action);
  console.log('New state:', store.getState());
  return result;
};
```

### Error Handling Middleware

```typescript
// store/middleware/errorMiddleware.ts
const errorMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Error in dispatch:', error);
    store.dispatch(showToast({
      message: 'An error occurred',
      type: 'error',
    }));
    throw error;
  }
};
```

---

## 📊 Selectors

```typescript
// store/selectors.ts
import { RootState } from './index';

// Auth selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

// Expense selectors
export const selectAllTransactions = (state: RootState) => state.expenses.transactions;
export const selectTransactionCount = (state: RootState) => state.expenses.transactions.length;
export const selectTotalSpent = (state: RootState) =>
  state.expenses.transactions.reduce((sum, t) => sum + t.amount, 0);

export const selectBudgets = (state: RootState) => state.expenses.budgets;
export const selectBudgetStatus = (state: RootState) => {
  return state.expenses.budgets.map(budget => ({
    ...budget,
    percentageUsed: (budget.spent_amount / budget.limit_amount) * 100,
    isOver: budget.spent_amount > budget.limit_amount,
  }));
};

// Usage in components
const MyComponent = () => {
  const totalSpent = useAppSelector(selectTotalSpent);
  const budgetStatus = useAppSelector(selectBudgetStatus);
  // ...
};
```

---

## 🧪 Testing Redux

```typescript
// tests/store/expenseSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import expenseReducer, {
  setFilters,
  fetchTransactions,
} from '@/store/slices/expenseSlice';

describe('expenseSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        expenses: expenseReducer,
      },
    });
  });

  it('should handle setFilters', () => {
    const newFilters = {
      category: 'Food',
      dateRange: { start: '2024-01-01', end: '2024-12-31' },
    };

    store.dispatch(setFilters(newFilters));
    const state = store.getState().expenses;

    expect(state.filters.category).toBe('Food');
    expect(state.filters.dateRange.start).toBe('2024-01-01');
  });

  it('should fetch transactions', async () => {
    // Mock the API call
    const mockTransactions = [{ id: '1', amount: 100, category: 'Food' }];

    await store.dispatch(
      fetchTransactions({ page: 1, filters: {} }) as any
    );

    const state = store.getState().expenses;
    expect(state.transactions).toHaveLength(1);
  });
});
```

---

