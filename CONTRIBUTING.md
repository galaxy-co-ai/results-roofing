# Contributing to Results Roofing

Thank you for your interest in contributing to Results Roofing! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, be helpful, and be constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Git
- A code editor (we recommend VS Code)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/results-roofing.git
   cd results-roofing
   ```

3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/galaxy-co-ai/results-roofing.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

6. **Set up the database:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

7. **Start the development server:**
   ```bash
   npm run dev
   ```

### Recommended VS Code Extensions

- ESLint
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense (for CSS modules)
- Prettier (optional, project uses ESLint for formatting)

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:

- `feature/short-description` - New features
- `fix/short-description` - Bug fixes
- `docs/short-description` - Documentation updates
- `refactor/short-description` - Code refactoring
- `test/short-description` - Test additions/updates

**Examples:**
- `feature/add-payment-processing`
- `fix/quote-calculation-error`
- `docs/update-api-docs`

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your local main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## Code Standards

### TypeScript

- Use strict TypeScript (no `any` types unless absolutely necessary)
- Define interfaces for all data structures
- Use Zod for runtime validation
- Export types from `src/types/`

### React Components

- Use functional components with hooks
- Follow the component file structure in `docs/planning/15-file-architecture.md`
- Co-locate component styles (CSS modules) and tests
- Use named exports (not default exports)

### File Naming

- Components: `PascalCase.tsx` (e.g., `QuoteCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-currency.ts`)
- Hooks: `use-kebab-case.ts` (e.g., `use-quote.ts`)
- Types: `kebab-case.ts` (e.g., `api.ts`)

### Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal absolute imports
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

// 4. Relative imports
import { QuoteCard } from './QuoteCard';

// 5. Types (last)
import type { Quote } from '@/types';
```

### CSS Modules

- Use CSS modules for component styling
- Follow the design tokens in `src/styles/tokens/`
- Keep styles co-located with components

## Commit Guidelines

### Commit Message Format

```
<type>: <short description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat: add financing pre-qualification flow

Implement Wisetack integration for 60-second financing pre-qual.
Includes adapter pattern for future vendor swaps.

Closes #42
```

```
fix: correct deposit calculation for premium tier

The deposit was incorrectly calculated at 10% instead of 15%
for the Premium tier.
```

### Guidelines

- Use present tense ("add feature" not "added feature")
- Keep the first line under 72 characters
- Reference issues and PRs in the footer

## Pull Request Process

### Before Opening a PR

1. **Ensure all checks pass:**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

2. **Update documentation** if you've changed APIs or added features

3. **Add tests** for new functionality

4. **Rebase on main** to ensure your branch is up to date:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### PR Template

When opening a PR, fill out the template completely:

- Summary of changes
- Type of change (bug fix, feature, etc.)
- Related issues
- Testing performed
- Checklist items

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR

### PR Tips

- Keep PRs focused and small when possible
- Include screenshots for UI changes
- Link to relevant issues
- Respond to feedback promptly

## Issue Guidelines

### Bug Reports

When reporting a bug, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/environment information

### Feature Requests

When requesting a feature:

- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider alternatives you've thought about
- Note if you'd like to implement it yourself

### Questions

For questions about the codebase:

- Check existing documentation first
- Search closed issues for similar questions
- Provide context about what you're trying to accomplish

## Project Structure Quick Reference

```
src/
├── app/              # Next.js pages and API routes
├── components/
│   ├── ui/           # Reusable UI primitives
│   ├── layout/       # Layout components
│   └── features/     # Feature-specific components
├── db/               # Database schema and queries
├── hooks/            # Custom React hooks
├── lib/
│   ├── integrations/ # External service adapters
│   └── utils/        # Utility functions
├── styles/           # Global styles and tokens
└── types/            # TypeScript definitions
```

## Key Documentation

- [Vision & Goals](docs/planning/01-vision-and-goals.md) - Why we're building this
- [Feature Breakdown](docs/planning/04-feature-breakdown.md) - What we're building
- [Technical Architecture](docs/planning/07-technical-architecture.md) - How it's structured
- [File Architecture](docs/planning/15-file-architecture.md) - Code organization
- [Code Patterns](docs/planning/17-code-patterns.md) - Implementation patterns
- [Conventions](docs/reference/conventions.md) - Coding standards

## Need Help?

- Review the [troubleshooting guide](docs/reference/troubleshooting.md)
- Open an issue with your question
- Check the [glossary](docs/reference/glossary.md) for project terminology

---

Thank you for contributing to Results Roofing!
