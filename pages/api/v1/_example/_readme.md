# API Route Examples

This directory contains example API route implementations demonstrating different authentication and authorization patterns for both client and admin applications.

## 📁 File Structure

```text
example/
├── _readme.md              # This documentation
├── client-authenticated.ts # For authenticated client app endpoints
├── unauthenticated.ts      # For public endpoints (both client & admin)
└── admin/
    ├── index.ts            # Admin endpoint for managing all platform data
    └── [user_id].ts        # Admin endpoint for managing user-specific data
```

## 🔐 Authentication Patterns

### 1. **Client Authenticated Endpoint** (`client-authenticated.ts`)

**Use Case**: Client-side endpoints that require user authentication

- ✅ Uses `authMiddleware` for authentication
- ✅ Uses `AuthenticatedRequest` type
- ✅ Requires user role validation
- 🎯 **Target**: Client application users

**Example Usage**:

```typescript
await authMiddleware(req, res, async () => {
  const role: UserRoleType = "user";
  // Your protected logic here
});
```

### 2. **Unauthenticated Endpoint** (`unauthenticated.ts`)

**Use Case**: Public endpoints accessible without authentication

- ❌ No `authMiddleware`
- ❌ No `AuthenticatedRequest` type
- ❌ No role validation needed
- 🎯 **Target**: Both client and admin applications

**Example Usage**:

```typescript
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Public logic here - no auth required
}
```

### 3. **Admin Platform Management** (`admin/index.ts`)

**Use Case**: Admin endpoints for managing all platform data

- ✅ Uses `authMiddleware` for authentication
- ✅ Uses `AuthenticatedRequest` type
- ✅ Requires admin role (`"admin"`)
- 🎯 **Target**: Admin application - platform-wide data management

**Example Usage**:

```typescript
await authMiddleware(req, res, async () => {
  const role: UserRoleType = "admin";
  // Admin logic for all platform data
});
```

### 4. **Admin User-Specific Management** (`admin/[user_id].ts`)

**Use Case**: Admin endpoints for managing specific user data

- ✅ Uses `authMiddleware` for authentication
- ✅ Uses `AuthenticatedRequest` type
- ✅ Requires admin role (`"admin"`)
- ✅ Includes user ID parameter handling
- 🎯 **Target**: Admin application - user-specific data management

**Example Usage**:

```typescript
const { user_id } = req.query;
await authMiddleware(req, res, async () => {
  const role: UserRoleType = "admin";
  // Admin logic for specific user data
});
```

## 🚀 How to Use These Examples

### For Client Application Endpoints

1. **Authenticated Endpoints**: Copy `client-authenticated.ts`
   - Keep `authMiddleware`, `AuthenticatedRequest`, and role validation
   - Modify business logic as needed
   - Keep validation and error handling patterns

2. **Public Endpoints**: Copy `unauthenticated.ts`
   - Modify business logic as needed
   - Keep validation and error handling patterns

### For Admin Application Endpoints

1. **Platform Management**: Copy `admin/index.ts`
   - For managing platform-wide data (all users, system settings, etc.)
   - Keep admin role requirement

2. **User Management**: Copy `admin/[user_id].ts`
   - For managing specific user data
   - Keep admin role requirement and user ID handling

3. **Admin Personal Data**: Copy `client-authenticated.ts` and modify
   - For admin managing their own profile/settings
   - Change role from `"user"` to `"admin"`
   - This is personal data, not platform management

## 🔧 Making Endpoints Public

To convert any authenticated endpoint to public:

1. Remove `authMiddleware` wrapper
2. Change `AuthenticatedRequest` to `NextApiRequest`
3. Remove `requiredRole` middleware
4. Keep validation and business logic

**Before (Authenticated)**:

```typescript
export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  await authMiddleware(req, res, async () => {
    return requiredRole("user")(req, res, async () =>
      validateRequest(rules)(req, res, async () => handleLogic(req, res)),
    );
  });
}
```

**After (Public)**:

```typescript
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return validateRequest(rules)(req, res, async () => handleLogic(req, res));
}
```

## 📋 Common Patterns

### Request Types

- **Authenticated**: `AuthenticatedRequest` (includes user data)
- **Unauthenticated**: `NextApiRequest` (standard Next.js)

### Role Types

- `"user"` - Client application users
- `"admin"` - Admin application users

### Middleware Chain

1. `authMiddleware` - Validates JWT token
2. `requiredRole` - Checks user permissions
3. `validateRequest` - Validates input data
4. Handler function - Business logic

### Error Handling

All examples include standard response functions with their corresponding HTTP status codes:

#### Success Responses

- `send200Success` - **200** - For successful operations
- `send201Created` - **201** - For successful resource creation
- `send204NoContent` - **204** - For successful operations with no content returned

#### Error Responses

- `send400ValidationError` - **400** - For invalid input data/bad requests
- `send401Unauthorised` - **401** - For authentication failures
- `send403Forbidden` - **403** - For authorization failures/permission denied
- `send404NotFound` - **404** - For missing resources
- `send405MethodNotAllowed` - **405** - For unsupported HTTP methods
- `send409Conflict` - **409** - For resource conflicts (e.g., duplicate entries)
- `send500Error` - **500** (or custom) - For general/internal server errors

#### Usage Examples

```typescript
// Success responses
return send200Success({
  res,
  message: "Data retrieved successfully",
  data: results,
});
return send201Created({
  res,
  message: "User created successfully",
  data: newUser,
});
return send204NoContent({ res, message: "Operation completed", data: null });

// Error responses
return send400ValidationError({
  res,
  message: "Invalid email format",
  error: validationErrors,
});
return send401Unauthorised({
  res,
  message: "Invalid credentials",
  error: "Authentication failed",
});
return send403Forbidden({
  res,
  message: "Admin access required",
  error: "Insufficient permissions",
});
return send404NotFound({
  res,
  message: "User not found",
  error: "No user with this ID",
});
return send405MethodNotAllowed({ res, message: "Only GET and POST allowed" });
return send409Conflict({
  res,
  message: "Email already exists",
  error: "Duplicate email",
});
return send500Error({
  res,
  message: "Database connection failed",
  error: dbError,
});
```

## 🔄 HTTP Methods

Each example supports standard CRUD operations:

- **GET** - Retrieve data (with pagination)
- **POST** - Create new resources
- **PUT** - Update existing resources
- **DELETE** - Remove resources

Choose the appropriate example based on your authentication requirements and modify the business logic to fit your specific use case.
