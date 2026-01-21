# Conventions

Code style and naming conventions for [PROJECT_NAME].

<!-- AI: This document establishes consistent coding standards across the project. Fill in conventions based on the chosen tech stack and team preferences. Consistency is more important than any specific style choice. -->

---

## How to Use This Document

<!-- AI: Explain the purpose and importance of conventions. Key points:
- Conventions reduce cognitive load and make code predictable
- They should be enforced by tooling (linters, formatters) whenever possible
- Start with ecosystem defaults, customize only when necessary
- Document exceptions and their rationale -->

---

## File Naming

<!-- AI: Define file naming conventions based on your stack. Choose ONE convention for each file type and use it consistently.

Common ecosystem defaults:
- JavaScript/TypeScript: kebab-case or PascalCase for components
- Python: snake_case for modules
- Go: lowercase, no separators
- Rust: snake_case

Document your conventions in a table like this: -->

| Type | Convention | Example |
|------|------------|---------|
| <!-- AI: List each file type (components, modules, utilities, tests, styles, types, stores, etc.) --> | <!-- AI: kebab-case, PascalCase, snake_case, etc. --> | <!-- AI: Concrete example --> |

---

## Naming Conventions by Ecosystem

<!-- AI: Fill in the section that matches your primary language. Delete or comment out sections that don't apply. -->

### JavaScript/TypeScript

<!-- AI: Document naming conventions if using JS/TS. Common patterns: -->

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName`, `isLoading` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `API_URL` |
| Functions | camelCase, verb prefix | `getUser`, `handleClick` |
| Classes | PascalCase | `UserService`, `ApiClient` |
| Interfaces/Types | PascalCase | `UserProps`, `ApiResponse` |
| Booleans | is/has/should prefix | `isActive`, `hasError` |
| Arrays | plural nouns | `users`, `messages` |
| Event handlers | on[Event] | `onClick`, `onSubmit` |

### Python

<!-- AI: Document naming conventions if using Python. Follow PEP 8: -->

| Type | Convention | Example |
|------|------------|---------|
| Variables | snake_case | `user_name`, `is_loading` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `API_URL` |
| Functions | snake_case, verb prefix | `get_user`, `handle_click` |
| Classes | PascalCase | `UserService`, `ApiClient` |
| Private members | _prefix | `_internal_method` |
| Protected members | __prefix | `__private_attr` |

### Go

<!-- AI: Document naming conventions if using Go. Follow Go conventions: -->

| Type | Convention | Example |
|------|------------|---------|
| Exported | PascalCase | `GetUser`, `HttpClient` |
| Unexported | camelCase | `getUser`, `httpClient` |
| Constants | PascalCase or camelCase | `MaxRetries`, `apiURL` |
| Interfaces | -er suffix when possible | `Reader`, `Handler` |
| Packages | lowercase, no underscores | `httputil`, `strconv` |
| Acronyms | Consistent case | `HTTPClient` or `httpClient` |

### Rust

<!-- AI: Document naming conventions if using Rust. Follow Rust conventions: -->

| Type | Convention | Example |
|------|------------|---------|
| Variables | snake_case | `user_name`, `is_loading` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `API_URL` |
| Functions | snake_case | `get_user`, `handle_click` |
| Types/Structs | PascalCase | `UserService`, `ApiClient` |
| Traits | PascalCase | `Serialize`, `Display` |
| Modules | snake_case | `user_service`, `api_client` |

---

## Component/Module Structure

<!-- AI: Define the internal structure of components or modules. This creates predictable file layouts.

For component-based frameworks (React, Vue, Svelte, SwiftUI):
- Import order (external, internal, relative, types)
- Section order (types, state, computed, methods, render)
- Export conventions

For module-based languages (Python, Go, Rust):
- Import order
- Declaration order (constants, types, functions)
- Export conventions -->

```
<!-- AI: Provide a template showing your preferred structure order. Example for a generic component: -->

// 1. External imports (third-party packages)
// 2. Internal imports (project modules using aliases)
// 3. Relative imports (sibling/child modules)
// 4. Type imports (if language supports type-only imports)

// 5. Type definitions (interfaces, types, structs)
// 6. Constants
// 7. Main component/module logic
// 8. Helper functions
// 9. Export
```

---

## Import Organization

<!-- AI: Define import ordering rules. Most ecosystems have tools to enforce this automatically.

Common groupings:
1. Standard library
2. Third-party packages
3. Internal packages (using path aliases)
4. Relative imports
5. Type-only imports (TypeScript, Python)

Example tools:
- JavaScript/TypeScript: eslint-plugin-import, prettier-plugin-organize-imports
- Python: isort
- Go: goimports (built-in)
- Rust: rustfmt (built-in) -->

---

## Code Style

<!-- AI: Define basic code style rules. These should be enforced by formatters.

Document choices for:
- Indentation (spaces vs tabs, count)
- Quote style (single vs double)
- Semicolons (for JS/TS)
- Trailing commas
- Line length limit
- Bracket style (same line vs new line)

Reference your formatter config file: -->

| Setting | Value |
|---------|-------|
| Indentation | <!-- AI: 2 spaces, 4 spaces, tabs --> |
| Quotes | <!-- AI: Single, double --> |
| Semicolons | <!-- AI: Yes, no (JS/TS only) --> |
| Trailing commas | <!-- AI: Yes, no --> |
| Max line length | <!-- AI: 80, 100, 120, etc. --> |

**Formatter config**: <!-- AI: Reference your config file, e.g., `.prettierrc`, `pyproject.toml`, `.rustfmt.toml` -->

---

## Git Conventions

### Branch Naming

<!-- AI: Define branch naming conventions. Common patterns: -->

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/user-auth` |
| `fix/` | Bug fixes | `fix/login-crash` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code refactoring | `refactor/user-service` |
| `test/` | Test additions | `test/auth-coverage` |
| `chore/` | Maintenance tasks | `chore/upgrade-deps` |

### Commit Messages

<!-- AI: Define commit message format. Conventional Commits is a common standard: -->

```
type(scope): short description

Longer description if needed.

Refs: #123
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

<!-- AI: Add any project-specific commit conventions here. Consider:
- Required scope?
- Breaking change format?
- Issue reference format? -->

---

## Comments and Documentation

<!-- AI: Define commenting standards. Key principles:
- Explain "why" not "what"
- Avoid obvious comments
- Use doc comments for public APIs
- Keep comments up to date

Reference your documentation format:
- JavaScript/TypeScript: JSDoc
- Python: docstrings (Google, NumPy, or Sphinx style)
- Go: godoc comments
- Rust: rustdoc comments -->

### When to Comment

- Complex business logic that isn't self-evident
- Workarounds with links to issues/tickets
- Performance-critical code with non-obvious optimizations
- Public API functions and types

### When NOT to Comment

- Obvious code (`// increment counter` before `count++`)
- Commented-out code (delete it, use version control)
- TODO comments without issue numbers

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [17. Code Patterns](../planning/17-code-patterns.md) | Implementation patterns that follow these conventions |
| [15. File Architecture](../planning/15-file-architecture.md) | Folder structure conventions |
| [20. Documentation Strategy](../planning/20-documentation-strategy.md) | Comment and documentation standards |
| [19. CI/CD Pipeline](../planning/19-cicd-pipeline.md) | Automated linting and formatting |

---

## AI Agent Instructions

When working with this conventions document:

1. **Selecting Conventions**
   - Start with ecosystem defaults (PEP 8 for Python, gofmt for Go, etc.)
   - Customize based on team preferences and project needs
   - Prioritize consistency over personal preference

2. **Documenting Conventions**
   - Fill in all sections relevant to your tech stack
   - Delete sections for languages not used
   - Provide concrete examples for each convention

3. **Enforcing Conventions**
   - Configure linters and formatters to match these rules
   - Set up pre-commit hooks for automatic enforcement
   - Document tooling setup in [00-project-setup.md](../planning/00-project-setup.md)

### Quality Checklist
- [ ] All naming conventions documented with examples
- [ ] Code style settings match formatter config
- [ ] Git conventions defined (branches, commits)
- [ ] Comment guidelines established
- [ ] Tooling referenced for enforcement
- [ ] Unused language sections removed or marked as N/A
