# Adding Protected Routes - Developer Guide

This guide explains how to add new routes to the application with proper authentication protection.

## Overview

The application uses three route wrapper components to manage access control:

| Component | Purpose | Use Case |
|-----------|---------|----------|
| `ProtectedRoutes` | Requires authentication | Dashboard, leagues, profile, etc. |
| `AuthRoutes` | Redirects if authenticated | Login, register pages |
| `AdminRoutes` | Requires admin role | Admin dashboard, user management |

## Quick Reference

### Adding a New Protected Route

```typescript
// 1. Add route definition to src/routes/index.tsx
export const routes = {
  protected: {
    newFeature: '/new-feature',
    // Or with parameters:
    newFeatureDetail: '/new-feature/:id',
  },
};

// 2. Add route to router.tsx within ProtectedRoutes children
{
  element: <ProtectedRoutes />,
  children: [
    {
      element: <AppLayout />,
      children: [
        {
          path: routes.protected.newFeature,
          element: <NewFeatureComponent />,
        },
      ],
    },
  ],
}
```

That's it! The route is now protected automatically.

## Architecture

### Route Structure

```
/                      -> Public (landing page)
/login                 -> AuthRoutes (redirects if logged in)
/register              -> AuthRoutes (redirects if logged in)
/dashboard             -> ProtectedRoutes (requires auth)
/leagues               -> ProtectedRoutes (requires auth)
/profile               -> ProtectedRoutes (requires auth)
/draft/:leagueId       -> ProtectedRoutes (requires auth)
/admin                 -> AdminRoutes (requires auth + admin role*)
```

*Note: Admin role checking is infrastructure-ready but not yet enforced.

### Component Responsibilities

#### ProtectedRoutes (`src/routes/ProtectedRoutes.tsx`)

- Checks authentication via `useIsAuthenticated()` hook
- Shows loading spinner during auth verification
- Redirects to `/login` if not authenticated
- Passes `state.from` with original path for return-to-URL
- Renders `<Outlet />` for child routes when authenticated

#### AuthRoutes (`src/routes/AuthRoutes.tsx`)

- Inverse of ProtectedRoutes
- Redirects authenticated users away from login/register
- Reads `state.from` to redirect to intended destination
- Defaults to `/leagues` if no `state.from` provided

#### AdminRoutes (`src/routes/ProtectedRoutes.tsx`)

- Same as ProtectedRoutes + admin role check (TODO)
- Currently allows all authenticated users
- Ready for role-based access when user roles are implemented

## Step-by-Step Guide

### 1. Define the Route Path

Add your route to `src/routes/index.tsx`:

```typescript
export const routes = {
  // ... existing routes
  protected: {
    // ... existing protected routes
    myNewPage: '/my-new-page',
    // With parameters:
    myNewPageDetail: '/my-new-page/:itemId',
  },
} as const;
```

For routes with parameters, add a path generator:

```typescript
export const generatePath = {
  // ... existing generators
  myNewPageDetail: (itemId: string) => `/my-new-page/${itemId}`,
} as const;
```

### 2. Create Your Component

Create your page component following the feature-based structure:

```typescript
// src/features/my-feature/components/MyNewPage.tsx
export function MyNewPage() {
  return (
    <div>
      <h1>My New Page</h1>
      {/* Your content */}
    </div>
  );
}
```

### 3. Add to Router Configuration

Add your route to `src/routes/router.tsx`:

```typescript
import { MyNewPage } from '@/features/my-feature/components/MyNewPage';

const router = createBrowserRouter([
  // ... existing routes

  // Protected routes
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // ... existing protected routes
          {
            path: routes.protected.myNewPage,
            element: <MyNewPage />,
          },
        ],
      },
    ],
  },
]);
```

### 4. Link to Your Route

Use the routes object for type-safe navigation:

```typescript
import { Link } from 'react-router-dom';
import { routes, generatePath } from '@/routes';

// Static route
<Link to={routes.protected.myNewPage}>Go to My Page</Link>

// Dynamic route with parameter
<Link to={generatePath.myNewPageDetail('item-123')}>
  View Item Details
</Link>

// Programmatic navigation
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate(routes.protected.myNewPage);
```

## Return-to-URL Mechanism

### How It Works

1. User tries to access `/leagues` without being logged in
2. `ProtectedRoutes` redirects to `/login` with `state={{ from: '/leagues' }}`
3. User logs in successfully
4. `AuthRoutes` reads `state.from` and redirects to `/leagues`
5. User arrives at their intended destination

### Code Flow

```typescript
// ProtectedRoutes.tsx
if (!isAuthenticated) {
  return <Navigate
    to={routes.public.login}
    state={{ from: location.pathname }}
    replace
  />;
}

// AuthRoutes.tsx
if (isAuthenticated) {
  const from = (location.state as { from?: string })?.from
    || routes.protected.leagues;
  return <Navigate to={from} replace />;
}
```

### Benefits

- Users don't lose their place
- Deep links work correctly
- Query parameters preserved in pathname
- No manual state management needed

## Common Patterns

### Public Route (No Protection)

```typescript
// In router.tsx - outside any wrapper
{
  path: '/about',
  element: <AboutPage />,
}
```

### Protected Route with Error Boundary

```typescript
{
  path: routes.protected.profile,
  element: (
    <ProfileErrorBoundary>
      <ProfileView />
    </ProfileErrorBoundary>
  ),
}
```

### Protected Route with Layout

All protected routes use `AppLayout` for consistent navigation:

```typescript
{
  element: <ProtectedRoutes />,
  children: [
    {
      element: <AppLayout />,  // Header, sidebar, etc.
      children: [
        { path: '/dashboard', element: <Dashboard /> },
        { path: '/profile', element: <Profile /> },
      ],
    },
  ],
}
```

### Admin Route (Future)

```typescript
{
  element: <AdminRoutes />,
  children: [
    {
      element: <AppLayout />,
      children: [
        { path: '/admin', element: <AdminDashboard /> },
        { path: '/admin/users', element: <UserManagement /> },
      ],
    },
  ],
}
```

## Testing Protected Routes

### Don't Re-test Protection

The protection mechanism is already tested in:
- `tests/routes/ProtectedRoutes.test.tsx`
- `tests/routes/AuthRoutes.test.tsx`
- `tests/integration/route-protection.test.tsx`

### Focus on Your Component

```typescript
// Good: Test your component's functionality
test('MyNewPage displays correctly', () => {
  render(<MyNewPage />);
  expect(screen.getByText('My New Page')).toBeInTheDocument();
});

// Not needed: Don't re-test protection
// The route wrapper tests already cover this
```

### One Integration Test (Optional)

If you want to verify your route is correctly protected:

```typescript
test('MyNewPage requires authentication', () => {
  // Mock auth as not authenticated
  mockIsAuthenticated = false;

  render(
    <MemoryRouter initialEntries={['/my-new-page']}>
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route path="/my-new-page" element={<MyNewPage />} />
        </Route>
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText('Login')).toBeInTheDocument();
});
```

## Best Practices

### Do

- Use the `routes` object for all route paths (type safety)
- Use `generatePath` helpers for dynamic routes
- Add new routes within the existing wrapper structure
- Use `replace` flag in navigation to prevent back-button issues

### Don't

- Modify `ProtectedRoutes` or `AuthRoutes` components
- Add custom auth checks to individual components
- Duplicate protection logic
- Hardcode route paths as strings

## Troubleshooting

### Route Not Protected

**Symptom:** Unauthenticated users can access the page

**Solution:** Ensure your route is nested inside `<ProtectedRoutes>`:

```typescript
// Wrong - outside protection
{
  path: '/my-route',
  element: <MyComponent />,
}

// Correct - inside ProtectedRoutes
{
  element: <ProtectedRoutes />,
  children: [
    { path: '/my-route', element: <MyComponent /> },
  ],
}
```

### Return-to-URL Not Working

**Symptom:** After login, user goes to `/leagues` instead of intended page

**Solution:** Check that:
1. The redirect uses `state={{ from: location.pathname }}`
2. AuthRoutes reads `location.state?.from`

### Flash of Unauthenticated Content

**Symptom:** Protected content briefly shows before redirect

**Solution:** Ensure the loading state is properly handled:

```typescript
if (isLoading) {
  return <LoadingSpinner />;
}
```

### 404 on Protected Route

**Symptom:** Route shows 404 even when logged in

**Solution:** Check route definition in `router.tsx`:
1. Path matches the `routes.protected.*` definition
2. Route is inside the `children` array of ProtectedRoutes

## Related Files

| File | Purpose |
|------|---------|
| `src/routes/index.tsx` | Route path definitions |
| `src/routes/router.tsx` | Router configuration |
| `src/routes/ProtectedRoutes.tsx` | Protected route wrapper |
| `src/routes/AuthRoutes.tsx` | Auth route wrapper |
| `src/features/auth/stores/authStore.ts` | Auth state management |

## Future Enhancements

### Admin Role Checking

When user roles are implemented (Epic 13):

```typescript
// AdminRoutes will check:
const user = useUser();
if (user?.role !== 'admin') {
  return <Navigate to={routes.protected.dashboard} replace />;
}
```

### Lazy Loading

Routes can be lazily loaded for performance:

```typescript
const Dashboard = lazy(() => import('@/features/dashboard/components/Dashboard'));

{
  path: routes.protected.dashboard,
  element: (
    <Suspense fallback={<LoadingSpinner />}>
      <Dashboard />
    </Suspense>
  ),
}
```

---

**Last Updated:** 2025-12-15
**Story:** 2.7 - Implement Protected Routes
