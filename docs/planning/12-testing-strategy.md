# 12 - Testing Strategy

<!-- AI: This document defines the testing approach for the application. It covers test types, tools, coverage targets, and test organization. Applicable to all project types. -->

## Testing Philosophy

<!-- AI: Establish the guiding principles for testing in this project:

**Key Questions to Address**:
- What's the balance between testing speed and confidence?
- Who writes tests (developers, QA, both)?
- When are tests run (commit, PR, deploy)?
- What's the acceptable level of test debt?

**Common Philosophies**:
- **Test-Driven Development (TDD)**: Write tests first, then code
- **Behavior-Driven Development (BDD)**: Tests describe behavior in business terms
- **Risk-Based Testing**: Focus on highest-risk areas
- **Pragmatic Testing**: Test what matters, skip what doesn't
-->

**Philosophy**: [Describe the testing approach for this project]

**Principles**:
1. [First principle, e.g., "All new code must have tests"]
2. [Second principle, e.g., "Tests run on every PR"]
3. [Third principle, e.g., "Flaky tests are bugs"]

---

## Testing Pyramid

<!-- AI: The testing pyramid guides how to distribute testing effort:

```
           /\
          /  \      E2E Tests (Few, ~10%)
         /    \     - Slow, brittle, expensive
        /──────\    - Test critical user journeys
       /        \
      /          \  Integration Tests (Some, ~20%)
     /────────────\ - Medium speed and cost
    /              \- Test component interactions
   /                \
  /                  \ Unit Tests (Many, ~70%)
 /────────────────────\- Fast, cheap, stable
                        - Test isolated logic

**Why this shape?**:
- Unit tests are fast and reliable - run many
- Integration tests catch interaction bugs - run some
- E2E tests are slow and flaky - run few but critical
-->

### Test Distribution

<!-- AI: Define target distribution for this project. Adjust based on project type:
- UI-heavy apps: More integration/E2E, fewer unit tests
- Libraries: More unit tests, fewer E2E
- APIs: Balance of unit and integration
-->

| Test Type | Target % | Rationale |
|-----------|----------|-----------|
| Unit | [60-80%] | [Why this target] |
| Integration | [15-30%] | [Why this target] |
| E2E | [5-15%] | [Why this target] |

### Pyramid Anti-Patterns

<!-- AI: Common mistakes to avoid -->

**Ice Cream Cone** (inverted pyramid):
- Too many E2E tests, few unit tests
- Result: Slow, brittle test suite
- Fix: Push testing down the pyramid

**Hourglass**:
- Many E2E and unit tests, few integration tests
- Result: Components work alone, fail together
- Fix: Add integration tests for key interactions

**No Tests**:
- Just manual testing
- Result: Fear of refactoring, regression bugs
- Fix: Start with critical paths

---

## Unit Tests

<!-- AI: Tests for isolated pieces of code -->

### What to Unit Test

<!-- AI: Define what warrants unit testing -->

**Always Test**:
- Pure functions (deterministic, no side effects)
- Business logic / domain rules
- Data transformations
- Validation functions
- State management logic
- Complex algorithms

**Consider Testing**:
- Component rendering (basic cases)
- Hook logic (custom hooks)
- Error handling paths
- Edge cases and boundaries

**Skip Testing**:
- Simple getters/setters
- Direct library wrappers with no logic
- Trivial components (just props to render)
- Configuration constants

### Unit Test Guidelines

<!-- AI: How to write good unit tests -->

**Structure** (Arrange-Act-Assert):
```
// Arrange: Set up test data and conditions
// Act: Execute the code being tested
// Assert: Verify the result
```

**Naming Convention**: `[unit]_[scenario]_[expected]`
- Example: `calculateTotal_emptyCart_returnsZero`
- Example: `validateEmail_invalidFormat_returnsFalse`

**Best Practices**:
- One assertion concept per test (may have multiple `expect` calls)
- No test interdependence (each test runs in isolation)
- Test behavior, not implementation
- Use descriptive test names that explain what and why
- Keep tests simple - if test is complex, code might be too

### Coverage Targets

<!-- AI: Define coverage targets with rationale:

**Guidance on Setting Targets**:
- 100% coverage is rarely practical or valuable
- Focus on critical code paths, not coverage numbers
- Coverage measures lines hit, not quality of tests
- Consider branch coverage, not just line coverage

**Reasonable Targets by Code Type**:
- Core business logic: 80-90%
- UI components: 50-70%
- Utilities/helpers: 90%+
- Generated code: 0% (don't test)
- Glue code / config: Low priority
-->

| Code Category | Target | Rationale |
|---------------|--------|-----------|
| Business logic | [80-90%] | Critical for correctness |
| Utilities | [90%] | Heavily reused, must be reliable |
| Components | [50-70%] | Focus on logic, not rendering |
| API layer | [70-80%] | Contract adherence |
| Config/bootstrap | [Low] | Hard to test, changes rarely |

**Enforcement**:
- [ ] Coverage threshold in CI: [X%]
- [ ] Coverage trend tracking
- [ ] Coverage reports on PRs

---

## Integration Tests

<!-- AI: Tests for how components work together -->

### What to Integration Test

<!-- AI: Define integration test scope -->

**Test These Interactions**:
- Component + API (data fetching works)
- Component + Store (state management works)
- Multiple components together (feature flows)
- Service + Database (queries work)
- API + Authentication (auth flows work)

**Integration Test Boundaries**:
- Mock external services (APIs, databases for unit, real for integration)
- Use test database for data persistence tests
- Test realistic scenarios, not every permutation

### Integration Test Scenarios

<!-- AI: Define key integration scenarios. Format:

**Scenario Template**:
| Scenario | Components Involved | What's Verified |
|----------|---------------------|-----------------|
| [Name] | [Component A + B + C] | [Expected behavior] |
-->

| Scenario | Components | Verification |
|----------|------------|--------------|
| [Authentication flow] | [Login form + Auth service + Session store] | [User can log in, session persists] |
| [Data submission] | [Form + Validation + API + Database] | [Data saves correctly] |
| [Error handling] | [API call + Error boundary + Toast] | [Errors display appropriately] |

<!-- AI: Add project-specific integration scenarios -->

### Integration Test Guidelines

**Scope**: Test one integration at a time
- Good: "Component fetches and displays data"
- Bad: "User logs in, creates item, shares it" (that's E2E)

**Data**:
- Use factories/fixtures for test data
- Reset state between tests
- Use realistic but minimal data sets

**Speed**:
- Faster than E2E, slower than unit
- Target: Each test < 5 seconds
- Parallelize when possible

---

## E2E Tests

<!-- AI: Tests that simulate real user behavior -->

### What to E2E Test

<!-- AI: E2E tests are expensive - use strategically -->

**Test Critical User Journeys**:
- Core value proposition flows
- Revenue-critical paths (checkout, subscription)
- Security-critical paths (authentication)
- High-risk areas identified by bugs

**Do NOT E2E Test**:
- Every edge case (use unit tests)
- Styling and visual details (use visual regression)
- Performance (use dedicated performance tests)
- Every permutation of inputs

### Critical Paths

<!-- AI: Define the most important user journeys to test end-to-end.

**Guidance**:
- List 5-10 critical paths maximum
- Each should represent a complete user goal
- Prioritize by business value and risk
-->

| Priority | User Journey | Steps | Success Criteria |
|----------|--------------|-------|------------------|
| P0 | [Core action 1] | [Step summary] | [What proves it works] |
| P0 | [Core action 2] | [Step summary] | [What proves it works] |
| P1 | [Important action] | [Step summary] | [What proves it works] |

### E2E Test Guidelines

**Selectors**:
- Prefer data attributes: `data-testid="submit-button"`
- Avoid brittle selectors: CSS classes, deep DOM paths
- Never use: Generated IDs, nth-child

**Waiting**:
- Wait for conditions, not arbitrary time
- Use framework's built-in waiting (Playwright's auto-wait)
- Add explicit waits for animations/transitions

**Resilience**:
- Isolate tests (no shared state)
- Reset application state before each test
- Handle flaky tests: Retry logic, better waits, or demote to integration

---

## Test Tools by Stack

<!-- AI: Recommend tools based on project stack -->

### Tool Selection Criteria

<!-- AI: How to choose testing tools:

**Consider**:
- Language/framework compatibility
- Learning curve and documentation
- Community size and maintenance
- Speed and reliability
- IDE integration
- CI/CD integration
-->

### Web Frontend

| Test Type | Tool Options | Notes |
|-----------|--------------|-------|
| Unit | Vitest, Jest | Vitest faster for Vite projects |
| Component | Testing Library | Framework-agnostic, best practices |
| E2E | Playwright, Cypress | Playwright faster, Cypress better DX |
| Visual | Chromatic, Percy | Catch visual regressions |

### Backend (Node.js)

| Test Type | Tool Options | Notes |
|-----------|--------------|-------|
| Unit | Vitest, Jest, Mocha | Vitest recommended for modern projects |
| Integration | Supertest + test framework | Test HTTP endpoints |
| E2E | Playwright (if API + UI) | Or separate API tests |

### Backend (Go)

| Test Type | Tool Options | Notes |
|-----------|--------------|-------|
| Unit | Built-in `testing` | Standard, no dependencies |
| Mocking | testify, gomock | testify more popular |
| Integration | httptest | Built-in HTTP testing |
| Coverage | go test -cover | Built-in |

### Backend (Rust)

| Test Type | Tool Options | Notes |
|-----------|--------------|-------|
| Unit | Built-in `#[test]` | Standard, integrated |
| Integration | Same, separate files | tests/ directory |
| Mocking | mockall, mockito | mockall more feature-rich |
| Coverage | cargo-tarpaulin | Third-party but standard |

### Backend (Python)

| Test Type | Tool Options | Notes |
|-----------|--------------|-------|
| Unit | pytest | De facto standard |
| Mocking | unittest.mock, pytest-mock | Built-in is sufficient |
| Integration | pytest + httpx/requests | Test HTTP clients |
| Coverage | pytest-cov | Uses coverage.py |

### Mobile

| Platform | Tool Options | Notes |
|----------|--------------|-------|
| React Native | Jest + Testing Library | Same as React web |
| Flutter | flutter_test | Built-in framework |
| iOS (Swift) | XCTest | Built-in, Xcode integrated |
| Android (Kotlin) | JUnit + Espresso | Standard Android testing |

### Desktop

| Platform | Tool Options | Notes |
|----------|--------------|-------|
| Electron | Playwright, Spectron | Playwright recommended |
| Tauri | Playwright + WebDriver | Web view + native |

### CLI

| Language | Tool Options | Notes |
|----------|--------------|-------|
| Node.js | Vitest, Jest + child_process | Test CLI as subprocess |
| Go | Built-in testing | Test commands as functions |
| Rust | Built-in + assert_cmd | assert_cmd for CLI testing |

---

## Test Organization

<!-- AI: How to structure tests in the codebase -->

### File Structure

<!-- AI: Common patterns for organizing test files -->

**Co-located Tests** (recommended for unit tests):
```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx    # Unit test next to component
  utils/
    format.ts
    format.test.ts
```

**Separate Test Directory** (for integration/E2E):
```
tests/
  unit/              # If not co-located
  integration/
    api.test.ts
    auth.test.ts
  e2e/
    checkout.spec.ts
    login.spec.ts
  fixtures/
    users.json
    products.json
```

### Naming Conventions

| Type | File Pattern | Example |
|------|--------------|---------|
| Unit | `*.test.{ext}` or `*.spec.{ext}` | `utils.test.ts` |
| Integration | `*.integration.test.{ext}` | `api.integration.test.ts` |
| E2E | `*.e2e.{ext}` or `*.spec.{ext}` | `checkout.e2e.ts` |

### Test Fixtures and Factories

<!-- AI: How to manage test data -->

**Fixtures**: Static test data
```
fixtures/
  users.json        # Static user data
  products.json     # Static product data
```

**Factories**: Dynamic test data generation
```
factories/
  userFactory.ts    # Creates user with defaults + overrides
  productFactory.ts
```

**Best Practices**:
- Use factories for entities with many fields
- Use fixtures for complex, realistic data
- Keep test data minimal but realistic
- Document non-obvious test data choices

---

## Mocking Strategy

<!-- AI: How to handle dependencies in tests -->

### When to Mock

**Mock**:
- External services (APIs, databases in unit tests)
- Time/dates
- Random values
- Network requests
- File system (in unit tests)

**Don't Mock**:
- The code you're testing
- Simple utility functions
- Internal collaborators (usually)

### Mock Types

<!-- AI: Different types of test doubles -->

| Type | Purpose | Example |
|------|---------|---------|
| **Stub** | Returns predetermined values | `getUser()` returns fixed user |
| **Mock** | Verifies interactions | Assert `save()` was called |
| **Spy** | Tracks calls to real implementation | Log real function calls |
| **Fake** | Simplified working implementation | In-memory database |

### API Mocking

<!-- AI: Strategies for mocking HTTP APIs -->

**Options**:
| Strategy | When to Use | Tools |
|----------|-------------|-------|
| Function mocks | Unit tests | Jest/Vitest mock |
| HTTP interceptors | Integration tests | MSW, nock, Polly |
| Mock servers | E2E tests | MSW, Mockoon |
| Contract tests | API boundaries | Pact |

**Mock Server Example (MSW)**:
```typescript
// handlers.ts
export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ id: 1, name: 'Test User' }))
  }),
]
```

---

## Test Scenarios Template

<!-- AI: Template for documenting test scenarios -->

### Scenario: [Feature/Flow Name]

**Description**: [What this scenario tests]

**Preconditions**:
- [Condition 1, e.g., "User is logged in"]
- [Condition 2, e.g., "Product exists in inventory"]

**Test Cases**:

| ID | Case | Input | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| TC01 | [Happy path] | [Valid input] | [Success result] | P0 |
| TC02 | [Error case] | [Invalid input] | [Error message] | P1 |
| TC03 | [Edge case] | [Boundary value] | [Expected behavior] | P2 |

**Data Requirements**:
- [What test data is needed]
- [Any special setup required]

---

## Manual Testing

<!-- AI: Tests that can't or shouldn't be automated -->

### When to Test Manually

- Exploratory testing (finding unexpected issues)
- Usability assessment
- Visual review
- New feature validation before automation
- Edge cases too rare to automate

### Manual Testing Checklist

<!-- AI: Pre-release manual testing checklist -->

**Installation/Setup**:
- [ ] Fresh install works on all supported platforms
- [ ] Upgrade from previous version works
- [ ] Uninstall is clean (no leftover files)

**Core Functionality**:
- [ ] [Core feature 1] works as expected
- [ ] [Core feature 2] works as expected
- [ ] [Core feature 3] works as expected

**UI/UX**:
- [ ] Layout is correct on all screen sizes
- [ ] Dark/light mode works correctly
- [ ] Animations are smooth
- [ ] Loading states display appropriately
- [ ] Error states display correctly

**Accessibility**:
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Color contrast is sufficient

**Edge Cases**:
- [ ] Offline behavior works correctly
- [ ] Slow network shows appropriate feedback
- [ ] Large data sets don't break UI

---

## CI/CD Integration

<!-- AI: How tests run in the pipeline -->

### Test Execution Strategy

| Stage | Tests Run | Blocking? | Timing |
|-------|-----------|-----------|--------|
| Pre-commit | Unit tests (fast) | Yes | < 1 min |
| PR | All unit + integration | Yes | < 10 min |
| Merge | Full suite including E2E | Yes | < 30 min |
| Nightly | Full suite + slow tests | No | Overnight |

### Parallelization

<!-- AI: How to speed up test execution -->

- Split tests across multiple runners
- Run independent test files in parallel
- Shard E2E tests across machines
- Use test caching where possible

### Flaky Test Management

**Detection**:
- Track test failure rates
- Flag tests that fail inconsistently
- Quarantine flaky tests from blocking builds

**Resolution**:
- Fix the root cause (timing, state, ordering)
- If unfixable, convert to manual or delete
- Don't retry as a permanent solution

---

## Related Documents

<!-- AI: Link to related documents. Ensure bidirectional linking. -->

| Document | Relationship |
|----------|--------------|
| [17 - Code Patterns](./17-code-patterns.md) | Testing patterns and examples |
| [19 - CI/CD Pipeline](./19-cicd-pipeline.md) | Test execution in pipeline |
| [10 - Error Handling](./10-error-handling.md) | Testing error scenarios |
| [11 - Security Considerations](./11-security-considerations.md) | Security testing |
| [14 - Performance Goals](./14-performance-goals.md) | Performance testing |

---

## AI Agent Instructions

<!-- AI: Instructions for AI agents working with this document -->

### When Populating This Document

1. **Start from features**: Reference doc 04 to identify what needs testing
2. **Identify risk areas**: Focus test coverage on high-risk, high-value code
3. **Choose tools for the stack**: Use the tool recommendations by platform
4. **Define critical paths**: E2E tests should cover business-critical flows
5. **Set realistic coverage**: Don't aim for 100%, aim for confidence

### When Implementing Tests

1. **Write tests early**: Test as you code, not after
2. **Follow the pyramid**: Most tests should be unit tests
3. **Name tests clearly**: Test name should explain what and why
4. **Keep tests fast**: Slow tests get skipped
5. **Fix flaky tests immediately**: They erode trust in the suite

### Common Mistakes to Avoid

- **Testing implementation**: Tests break on refactor
- **Too many E2E tests**: Slow, flaky suite
- **Mocking everything**: Tests pass but code fails
- **Ignoring flaky tests**: "It works on my machine"
- **Chasing coverage numbers**: 100% coverage, 0% confidence
- **No assertions**: Tests that can't fail

### Quality Checklist

Before marking this document complete:
- [ ] Testing philosophy defined
- [ ] Test distribution targets set
- [ ] Tools chosen for the stack
- [ ] Unit test guidelines documented
- [ ] Critical E2E paths identified
- [ ] CI/CD integration planned
- [ ] Mocking strategy defined
- [ ] Related Documents links are bidirectional
