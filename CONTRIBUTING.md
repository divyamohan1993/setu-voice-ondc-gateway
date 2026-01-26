# Contributing to Setu Voice-to-ONDC Gateway

Thank you for your interest in contributing to Setu! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Areas for Contribution](#areas-for-contribution)
- [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Git** installed and configured
- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
- **Node.js** (version 18+) and **npm** (version 9+)
- **Code editor** (VS Code recommended)
- **Basic knowledge** of TypeScript, React, and Next.js

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/setu-voice-ondc-gateway.git
   cd setu-voice-ondc-gateway
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/setu-voice-ondc-gateway.git
   ```

### Initial Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment**:
   ```bash
   docker compose up -d
   npm run dev
   ```

4. **Verify setup**:
   - Open http://localhost:3000
   - Check that the application loads correctly
   - Run tests: `npm test`

---

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features (e.g., `feature/voice-recognition`)
- `fix/` - Bug fixes (e.g., `fix/translation-error`)
- `docs/` - Documentation updates (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/database-layer`)
- `test/` - Test additions/improvements (e.g., `test/translation-agent`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### 2. Make Your Changes

- **Write clean, readable code** following our coding standards
- **Add tests** for new functionality
- **Update documentation** as needed
- **Keep commits focused** on a single logical change

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Run type checking
npm run type-check
```

### 4. Commit Your Changes

Follow our [commit message format](#commit-message-format):

```bash
git add .
git commit -m "feat: add voice recognition support"
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

---

## Coding Standards

### TypeScript Guidelines

#### 1. Use Strict Mode

Always use TypeScript strict mode:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### 2. Explicit Types

Prefer explicit types over implicit inference:

```typescript
// Good
function calculatePrice(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

// Avoid
function calculatePrice(quantity, unitPrice) {
  return quantity * unitPrice;
}
```

#### 3. Avoid `any`

Use specific types or `unknown` instead of `any`:

```typescript
// Good
function processData(data: unknown): void {
  if (typeof data === 'string') {
    console.log(data.toUpperCase());
  }
}

// Avoid
function processData(data: any): void {
  console.log(data.toUpperCase());
}
```

#### 4. Use Type Guards

Implement type guards for runtime type checking:

```typescript
function isBecknCatalog(data: unknown): data is BecknCatalogItem {
  return (
    typeof data === 'object' &&
    data !== null &&
    'descriptor' in data &&
    'price' in data
  );
}
```

### React Guidelines

#### 1. Functional Components

Use functional components with hooks:

```typescript
// Good
export function VoiceInjector({ onScenarioSelect }: VoiceInjectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  // ...
}

// Avoid class components
```

#### 2. Props Interface

Define explicit props interfaces:

```typescript
interface VoiceInjectorProps {
  onScenarioSelect: (text: string) => Promise<void>;
  isProcessing: boolean;
}
```

#### 3. Custom Hooks

Extract reusable logic into custom hooks:

```typescript
function useCatalogBroadcast(catalogId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const broadcast = async () => {
    setIsLoading(true);
    try {
      await broadcastCatalogAction(catalogId);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { broadcast, isLoading, error };
}
```

### Naming Conventions

#### Variables and Functions

```typescript
// camelCase for variables and functions
const catalogData = getCatalogData();
function translateVoiceToJson(text: string) { }
```

#### Components and Types

```typescript
// PascalCase for components and types
interface BecknCatalogItem { }
function VoiceInjector() { }
```

#### Constants

```typescript
// UPPER_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_CURRENCY = "INR";
```

#### Files

```typescript
// kebab-case for file names
translation-agent.ts
voice-injector.tsx
beckn-schema.ts
```

### Code Organization

#### File Structure

```
lib/
├── translation-agent.ts    # AI translation logic
├── network-simulator.ts    # Network simulation
├── beckn-schema.ts         # Zod schemas
└── db.ts                   # Database utilities

components/
├── VoiceInjector.tsx       # Voice input component
├── VisualVerifier.tsx      # Visual verification
└── ui/                     # Reusable UI components
    ├── button.tsx
    └── card.tsx

app/
├── actions.ts              # Server actions
├── page.tsx                # Main page
└── debug/
    └── page.tsx            # Debug page
```

#### Import Order

```typescript
// 1. External dependencies
import { useState } from 'react';
import { z } from 'zod';

// 2. Internal modules
import { translateVoiceToJson } from '@/lib/translation-agent';
import { BecknCatalogItem } from '@/lib/beckn-schema';

// 3. Components
import { Button } from '@/components/ui/button';
import { VoiceInjector } from '@/components/VoiceInjector';

// 4. Types
import type { Catalog } from '@prisma/client';

// 5. Styles
import './styles.css';
```

### Documentation

#### JSDoc Comments

Add JSDoc comments to all public functions:

```typescript
/**
 * Translates voice text to Beckn Protocol JSON using AI.
 * 
 * This function uses the Vercel AI SDK with structured output generation
 * to convert vernacular voice commands into valid Beckn Protocol catalogs.
 * 
 * @param voiceText - The raw voice input text
 * @returns Promise resolving to BecknCatalogItem
 * @throws Error if translation fails
 * 
 * @example
 * ```typescript
 * const catalog = await translateVoiceToJson("500 kilo pyaaz hai");
 * console.log(catalog.descriptor.name); // "Onions"
 * ```
 */
export async function translateVoiceToJson(voiceText: string): Promise<BecknCatalogItem> {
  // Implementation
}
```

#### Inline Comments

Add inline comments for complex logic:

```typescript
// Calculate bid amount (catalog price ± 5-10%)
// This simulates realistic market negotiation
const variationPercent = 0.95 + Math.random() * 0.10;
const bidAmount = Math.round(catalogPrice * variationPercent * 100) / 100;
```

---

## Testing Guidelines

### Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── translation-agent.test.ts
│   └── beckn-schema.test.ts
├── property/                # Property-based tests
│   └── catalog.property.test.ts
└── fixtures/                # Test data
    └── sample-catalogs.ts
```

### Unit Tests

Write unit tests for specific examples and edge cases:

```typescript
import { describe, test, expect } from 'vitest';
import { translateVoiceToJson } from '@/lib/translation-agent';

describe('Translation Agent', () => {
  test('translates Hindi commodity names', async () => {
    const result = await translateVoiceToJson("500 kilo pyaaz hai");
    expect(result.descriptor.name).toContain("Onion");
  });
  
  test('handles empty input', async () => {
    await expect(translateVoiceToJson("")).rejects.toThrow();
  });
  
  test('uses fallback when API key is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await translateVoiceToJson("test");
    expect(result).toBeDefined();
  });
});
```

### Property-Based Tests

Write property tests for universal properties:

```typescript
import { fc, test } from '@fast-check/vitest';
import { BecknCatalogItemSchema } from '@/lib/beckn-schema';

test.prop([becknCatalogArbitrary])(
  'Beckn catalog round-trip serialization',
  (catalog) => {
    const serialized = JSON.stringify(catalog);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toEqual(catalog);
  }
);
```

### Test Coverage

- **Aim for 80%+ coverage** on critical paths
- **Test edge cases**: empty inputs, boundary values, error conditions
- **Test error handling**: API failures, validation errors, database errors
- **Test user interactions**: button clicks, form submissions, navigation

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- translation-agent.test.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config, etc.)
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
# Feature
feat(translation): add support for Marathi language

# Bug fix
fix(broadcast): handle network timeout errors

# Documentation
docs(readme): add installation instructions for Windows

# Refactoring
refactor(database): extract connection logic to utility

# Test
test(translation): add property-based tests for catalog validation

# Chore
chore(deps): update Next.js to version 15.1
```

### Rules

1. **Use imperative mood** in subject line ("add" not "added")
2. **Keep subject line under 72 characters**
3. **Capitalize subject line**
4. **No period at the end of subject line**
5. **Separate subject from body with blank line**
6. **Wrap body at 72 characters**
7. **Use body to explain what and why, not how**

---

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature
   git rebase main
   ```

2. **Run all tests**:
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

3. **Update documentation** if needed

4. **Squash commits** if necessary:
   ```bash
   git rebase -i HEAD~3  # Squash last 3 commits
   ```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Property-based tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. **Automated checks** must pass (tests, linting, type checking)
2. **At least one approval** from maintainers required
3. **Address review comments** promptly
4. **Keep PR focused** on a single feature/fix
5. **Respond to feedback** constructively

### After Approval

1. **Squash and merge** (preferred) or **Rebase and merge**
2. **Delete your branch** after merging
3. **Update your fork**:
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

---

## Areas for Contribution

### High Priority

1. **Voice Recognition Integration**
   - Implement actual voice input (currently simulated)
   - Support multiple Indian languages
   - Handle background noise and accents

2. **Language Support**
   - Add support for more Indian languages (Marathi, Gujarati, Tamil, etc.)
   - Improve Hindi/Hinglish translation accuracy
   - Add language-specific commodity mappings

3. **Testing**
   - Increase test coverage to 90%+
   - Add more property-based tests
   - Add end-to-end tests with Playwright

4. **Performance**
   - Optimize database queries
   - Implement caching for static assets
   - Reduce bundle size

### Medium Priority

1. **UI/UX Enhancements**
   - Improve accessibility (ARIA labels, keyboard navigation)
   - Add more animations and visual feedback
   - Implement dark mode

2. **Features**
   - Add catalog editing functionality
   - Implement catalog history/versioning
   - Add farmer profile management

3. **Documentation**
   - Add video tutorials
   - Create API documentation site
   - Write deployment guides for cloud platforms

### Low Priority

1. **Integrations**
   - Integrate with actual ONDC network
   - Add payment gateway integration
   - Implement SMS notifications

2. **Analytics**
   - Add usage analytics
   - Implement error tracking
   - Create admin dashboard

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code contributions and reviews

### Getting Help

- **Documentation**: Check README.md and docs/ folder
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Ask questions in GitHub Discussions

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## License

By contributing to Setu, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

If you have questions about contributing, please:
1. Check this document thoroughly
2. Search existing issues and discussions
3. Create a new discussion if your question isn't answered

Thank you for contributing to Setu! 🙏
