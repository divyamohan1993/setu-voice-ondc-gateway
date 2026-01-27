# Setu - Local Development Setup (Without Docker)

This guide is for systems where Docker virtualization is not supported.

## Important Note

The Setu application uses Prisma 7 with PostgreSQL, which requires Docker for the full setup. However, you can still:

1. **Run all tests** - Tests use mocked database connections
2. **View the code** - Explore the implementation
3. **Build the application** - Verify the build process works

## Prerequisites

- Node.js 18+ (you have v24.11.1 ✓)
- npm 7+ (you have 11.6.2 ✓)

## Quick Test Run

### Windows

```cmd
test_local.bat
```

### Linux/macOS

```bash
chmod +x test_local.sh
./test_local.sh
```

## Manual Testing

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
# Run all tests (no database required)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### 3. Build the Application

```bash
# Verify the build works
npm run build
```

## What Works Without Docker

✅ **All Tests** - Unit tests, property-based tests, component tests
✅ **Code Exploration** - Browse and understand the implementation
✅ **Build Verification** - Ensure the application builds correctly
✅ **Linting** - Check code quality with `npm run lint`

## What Requires Docker

❌ **Database Operations** - PostgreSQL requires Docker
❌ **Full Application** - Running the dev server requires database
❌ **Seed Data** - Database seeding requires PostgreSQL
❌ **End-to-End Testing** - Full workflow testing requires database

## Recommended Approach

Since Docker virtualization is not supported on your system, we recommend:

1. **Run the test suite** to verify all functionality works correctly
2. **Review the code** to understand the implementation
3. **Check the documentation** in the `.kiro/specs` directory

The tests provide comprehensive coverage and don't require a database connection.

## Test Coverage

The project includes:

- **Unit Tests** - Test individual functions and components
- **Property-Based Tests** - Test universal properties across inputs
- **Component Tests** - Test React components in isolation
- **Integration Tests** - Test server actions with mocked database

All tests run without requiring Docker or a database.

## Alternative: Cloud Development Environment

If you need to run the full application, consider:

1. **GitHub Codespaces** - Cloud-based VS Code with Docker support
2. **GitPod** - Browser-based development environment
3. **AWS Cloud9** - Cloud IDE with full Docker support
4. **Local VM** - Run a Linux VM with virtualization enabled

## Troubleshooting

### Module Not Found Errors

```bash
# Clean install
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Test Failures

```bash
# Clear test cache
npm test -- --clearCache

# Run tests in watch mode to see details
npm run test:watch
```

## Next Steps

1. Run `npm test` to verify all tests pass
2. Review the test files in `tests/`, `lib/__tests__/`, and `components/`
3. Check the implementation in `app/`, `components/`, and `lib/`
4. Read the design document in `.kiro/specs/setu-voice-ondc-gateway/design.md`

