# 10 - Error Handling

<!-- AI: This document defines the error handling strategy for the application. It covers error categorization, user-facing messages, recovery strategies, and logging. Applicable to all project types. -->

## Error Handling Philosophy

<!-- AI: Establish the guiding principles for error handling in this project:

**Key Questions to Address**:
- Should errors fail loudly or silently degrade?
- What's the balance between technical accuracy and user friendliness?
- How much context should be logged vs. displayed?
- Should users be able to report errors directly?

**Common Philosophies**:
- **Fail-fast**: Expose errors immediately, prioritize correctness
- **Graceful degradation**: Keep working with reduced functionality
- **User-centric**: Never show technical details, always offer next steps
- **Debug-friendly**: Include rich context for developers
-->

**Philosophy**: [Describe the error handling approach for this project]

**Principles**:
1. [First guiding principle, e.g., "Users should never see stack traces"]
2. [Second principle, e.g., "All errors should be recoverable or reportable"]
3. [Third principle, e.g., "Log everything, display only what helps"]

---

## Error Categorization

<!-- AI: Define error categories relevant to your application. Good categorization helps with:
- Consistent handling across the codebase
- Appropriate user messaging
- Targeted monitoring and alerting
- Systematic recovery strategies

**Recommended Categories** (customize based on project):
- **Network**: Connectivity, timeouts, DNS, SSL
- **API/External**: Third-party services, rate limits, auth failures
- **Validation**: User input, data format, business rules
- **Application**: Logic errors, state corruption, unexpected conditions
- **Resource**: File system, memory, storage, permissions
- **Authentication**: Login, session, tokens, permissions
- **Configuration**: Missing config, invalid settings, environment issues
-->

### Error Category Definitions

<!-- AI: For each category, define:
- What errors belong in this category
- Default severity level
- Default recovery approach
- Whether user should be notified
-->

| Category | Description | Default Severity | User Notification |
|----------|-------------|------------------|-------------------|
| Network | Connectivity and timeout issues | Warning | Yes |
| API | External service failures | Error | Depends on impact |
| Validation | Invalid input or data | Warning | Yes |
| Application | Internal logic errors | Error | Generic message |
| Resource | File/memory/storage issues | Error | Yes |
| Authentication | Auth and permission failures | Warning | Yes |
| Configuration | Setup and config problems | Critical | Yes |

### Error Code Convention

<!-- AI: Define a consistent error code format. Options:

**Prefixed Codes** (recommended):
- Format: `{CATEGORY}{NUMBER}` e.g., NET001, API002, VAL010
- Benefits: Easy to search, category visible, unique

**Hierarchical Codes**:
- Format: `{DOMAIN}.{CATEGORY}.{SPECIFIC}` e.g., user.auth.token_expired
- Benefits: Namespaced, readable, extensible

**HTTP-inspired**:
- Format: Custom codes mapping to HTTP semantics (4xx = client, 5xx = server)
- Benefits: Familiar to web developers
-->

**Code Format**: [Define your error code format]

**Example**: [e.g., `VAL001` = Validation error #1]

---

## Error Definitions

<!-- AI: Define specific errors your application handles. For each error category, list the known error conditions with their codes, messages, and handling. -->

### Network Errors

<!-- AI: List network-related errors. Consider:
- Connection failures (server unreachable)
- Timeouts (request took too long)
- DNS resolution failures
- SSL/TLS certificate errors
- Proxy issues
-->

| Code | Internal Message | User-Facing Message | Severity | Recovery |
|------|------------------|---------------------|----------|----------|
| NET001 | Connection refused | Unable to connect. Please check your internet connection. | Warning | Retry button |
| NET002 | Request timeout | Request timed out. Please try again. | Warning | Auto-retry |
| NET003 | DNS lookup failed | Unable to reach the server. Please try again later. | Error | Retry button |
| NET004 | SSL certificate error | Secure connection failed. Please contact support. | Error | None (report) |

<!-- AI: Add project-specific network errors -->

### API/External Service Errors

<!-- AI: List errors from external APIs and services. Consider:
- Authentication failures (invalid/expired keys)
- Rate limiting
- Invalid requests (bad parameters)
- Service unavailable (5xx responses)
- Response parsing failures
-->

| Code | Internal Message | User-Facing Message | Severity | Recovery |
|------|------------------|---------------------|----------|----------|
| API001 | Invalid API key | Service authentication failed. Please check your settings. | Error | Open settings |
| API002 | Rate limit exceeded | Too many requests. Please wait a moment. | Warning | Show countdown |
| API003 | Service unavailable | Service temporarily unavailable. Please try again later. | Warning | Retry later |
| API004 | Invalid response format | Received unexpected data. Please try again. | Error | Retry |

<!-- AI: Add project-specific API errors -->

### Validation Errors

<!-- AI: List input validation errors. Consider:
- Required fields missing
- Format violations (email, phone, etc.)
- Range violations (min/max)
- Business rule violations
- Type mismatches
-->

| Code | Internal Message | User-Facing Message | Severity | Recovery |
|------|------------------|---------------------|----------|----------|
| VAL001 | Required field missing | This field is required. | Warning | Highlight field |
| VAL002 | Invalid email format | Please enter a valid email address. | Warning | Highlight field |
| VAL003 | Value out of range | Value must be between {min} and {max}. | Warning | Highlight field |
| VAL004 | Invalid characters | This field contains invalid characters. | Warning | Highlight field |

<!-- AI: Add project-specific validation errors -->

### Application Errors

<!-- AI: List internal application errors. Consider:
- State corruption
- Unexpected null/undefined
- Logic errors
- Resource exhaustion
- Initialization failures
-->

| Code | Internal Message | User-Facing Message | Severity | Recovery |
|------|------------------|---------------------|----------|----------|
| APP001 | State corruption detected | Something went wrong. The application will restart. | Critical | Auto-restart |
| APP002 | Unexpected condition | An unexpected error occurred. Please try again. | Error | Retry |
| APP003 | Feature unavailable | This feature is currently unavailable. | Warning | Disable feature |
| APP004 | Initialization failed | Failed to start. Please restart the application. | Critical | Manual restart |

<!-- AI: Add project-specific application errors -->

### Resource Errors

<!-- AI: List resource-related errors. Consider:
- File not found
- Permission denied
- Disk full
- Memory exhausted
- Database connection issues
-->

| Code | Internal Message | User-Facing Message | Severity | Recovery |
|------|------------------|---------------------|----------|----------|
| RES001 | File not found | The requested file could not be found. | Warning | Show file picker |
| RES002 | Permission denied | Access denied. Please check your permissions. | Error | Show help |
| RES003 | Storage full | Storage is full. Please free up space. | Error | Show cleanup |
| RES004 | Database connection failed | Unable to access data. Please try again. | Error | Retry |

<!-- AI: Add project-specific resource errors -->

### Authentication Errors

<!-- AI: List authentication and authorization errors. Consider:
- Invalid credentials
- Session expired
- Insufficient permissions
- Account locked
- Token refresh failures
-->

| Code | Internal Message | User-Facing Message | Severity | Recovery |
|------|------------------|---------------------|----------|----------|
| AUTH001 | Invalid credentials | Invalid username or password. | Warning | Clear + refocus |
| AUTH002 | Session expired | Your session has expired. Please log in again. | Warning | Redirect to login |
| AUTH003 | Insufficient permissions | You don't have permission to perform this action. | Warning | Show help |
| AUTH004 | Account locked | Account temporarily locked. Please try again later. | Warning | Show countdown |

<!-- AI: Add project-specific auth errors -->

---

## User-Facing Error Messages

<!-- AI: Define guidelines for writing error messages that users will see. Good error messages:
1. Explain what happened (without technical jargon)
2. Explain why it happened (if known and helpful)
3. Suggest what to do next (action-oriented)
4. Are concise but complete
-->

### Message Writing Guidelines

**Do**:
- Use plain language (no jargon, codes, or technical terms)
- Be specific about what went wrong
- Offer a clear next step or action
- Be apologetic without being excessive
- Keep messages under 2 sentences when possible

**Don't**:
- Show stack traces, error codes, or technical details to users
- Blame the user ("You entered invalid data")
- Use vague messages ("An error occurred")
- Use alarming language ("FATAL", "CRITICAL", "FAILURE")
- Include information that doesn't help the user

### Message Templates

<!-- AI: Define reusable message patterns for consistency -->

**Temporary Failure (Will Retry)**:
> "Unable to [action]. Retrying automatically..."

**Temporary Failure (Manual Retry)**:
> "Unable to [action]. Please try again."

**Permanent Failure (Action Required)**:
> "[What happened]. Please [specific action]."

**Validation Error**:
> "Please [correct the issue]. [Specific guidance if needed]."

**Permission Error**:
> "You don't have permission to [action]. [Who to contact or what to do]."

**Unknown Error**:
> "Something went wrong. Please try again, or contact support if the problem continues."

### Localization Considerations

<!-- AI: If supporting multiple languages:
- All user-facing messages should be externalized (not hardcoded)
- Use placeholders for dynamic values
- Consider cultural differences in tone
- Test message length in all supported languages
-->

**Localization Approach**: [Describe how error messages will be localized, or "Not applicable" for single-language apps]

---

## Error Display Patterns

<!-- AI: Define how errors are displayed to users. Different error types warrant different display patterns. -->

### Display Pattern Selection

| Error Type | Display Pattern | Duration | User Action |
|------------|-----------------|----------|-------------|
| Transient (will auto-resolve) | Toast notification | 3-5 seconds | Optional dismiss |
| Actionable (user can fix) | Inline/field error | Until fixed | Fix the issue |
| Blocking (cannot proceed) | Modal dialog | Until acknowledged | Acknowledge/retry |
| Critical (app-wide impact) | Full-screen | Until resolved | Restart/contact support |
| Background (non-blocking) | Status indicator | While active | None required |

### Toast Notifications

<!-- AI: Configure toast/snackbar notifications for transient errors -->

**Configuration**:
- Position: [Top-right / Bottom-right / Bottom-center / Top-center]
- Duration: [Default duration in seconds]
- Max visible: [Number of toasts visible at once]
- Stacking: [Stack / Replace / Queue]

**Actions** (optional):
- Dismiss button: [Yes / No]
- Retry button: [For retriable errors]
- Details link: [For errors with more info]

### Inline Errors

<!-- AI: For form validation and field-level errors -->

**Display**:
- Position: [Below field / Above field / Tooltip]
- Styling: [Border color, icon, text color]
- Timing: [On blur / On submit / Real-time]

**Accessibility**:
- Use `aria-describedby` to associate error with field
- Use `aria-invalid="true"` on invalid fields
- Announce errors to screen readers using live regions

### Modal Dialogs

<!-- AI: For errors requiring user acknowledgment -->

**Use When**:
- User cannot proceed without addressing the error
- Action is required (not just informational)
- Error has significant consequences

**Structure**:
- Title: Clear indication of the problem
- Body: Explanation and impact
- Actions: Primary action (fix/retry), Secondary action (dismiss/cancel)

### Full-Screen Errors

<!-- AI: For critical failures that prevent app use -->

**Use When**:
- Application cannot function
- Critical initialization failure
- Unrecoverable state corruption

**Content**:
- Clear explanation of what happened
- What the user should do (restart, contact support, etc.)
- Error reference code for support (optional)
- Ability to copy error details or report issue

---

## Recovery Strategies

<!-- AI: Define how the application recovers from different error types. Recovery strategies reduce user friction and improve resilience. -->

### Automatic Recovery

<!-- AI: Actions the application takes without user intervention -->

#### Auto-Retry

<!-- AI: For transient failures that may succeed on retry -->

**Configuration**:
- Max attempts: [Number, e.g., 3]
- Initial delay: [Milliseconds, e.g., 1000]
- Backoff strategy: [None / Linear / Exponential]
- Backoff multiplier: [For exponential, e.g., 2]
- Max delay: [Cap on delay, e.g., 30000ms]
- Jitter: [Add randomness to prevent thundering herd]

**Apply To**:
- Network timeouts
- Rate limit errors (with appropriate delay)
- Temporary server errors (5xx)
- Connection drops

**Do Not Apply To**:
- Authentication failures (will never succeed)
- Validation errors (need user input)
- Permission errors (need different credentials)
- Client errors (4xx except 429)

#### Circuit Breaker

<!-- AI: For preventing cascade failures when a service is down -->

**Configuration**:
- Failure threshold: [Number of failures to open circuit]
- Reset timeout: [Time before attempting again]
- Half-open requests: [Number of test requests when half-open]

**States**:
1. **Closed**: Normal operation, requests flow through
2. **Open**: Service appears down, fail fast without trying
3. **Half-Open**: Testing if service recovered

#### State Recovery

<!-- AI: For recovering from corrupted or inconsistent state -->

**Strategies**:
- **Reload from source**: Re-fetch data from server/storage
- **Reset to default**: Clear to known-good state
- **Rollback**: Revert to last known-good state
- **Partial recovery**: Recover what's possible, clear the rest

### User-Initiated Recovery

<!-- AI: Recovery actions that require user involvement -->

#### Retry Mechanisms

**Retry Button**:
- Display after automatic retries exhausted
- Show what will be retried
- Indicate if previous attempts were made

**Refresh/Reload**:
- Full page/view refresh for broader issues
- Clear indication of what will be reset

#### Data Recovery

**Saved Drafts**:
- Auto-save user input periodically
- Recover unsaved work after crashes
- Prompt to restore on next session

**Export/Backup**:
- Allow users to export their data
- Provide recovery instructions

### Graceful Degradation

<!-- AI: How the app continues functioning with reduced capability -->

| Failure | Degraded Behavior | User Communication |
|---------|-------------------|--------------------|
| [Specific service down] | [What still works] | [How user is informed] |
| [Feature unavailable] | [Alternative or disabled] | [UI indication] |
| [Offline mode] | [What's available offline] | [Offline indicator] |

---

## Logging Strategy

<!-- AI: Define what errors are logged, at what level, and where. Good logging enables debugging and monitoring without overwhelming storage or exposing sensitive data. -->

### Log Levels

<!-- AI: Define when to use each log level. Consistency across the codebase is key.

**Standard Levels** (most frameworks support these):
- **TRACE/VERBOSE**: Very detailed, usually disabled in production
- **DEBUG**: Detailed information for debugging
- **INFO**: Notable events in normal operation
- **WARN**: Potential issues that don't stop operation
- **ERROR**: Failures that affect functionality
- **FATAL/CRITICAL**: Application cannot continue
-->

| Level | When to Use | Examples | Production |
|-------|-------------|----------|------------|
| DEBUG | Detailed diagnostic info | Request/response bodies, state changes | Usually off |
| INFO | Notable normal events | User actions, successful operations | On |
| WARN | Potential issues | Deprecated usage, slow queries, retries | On |
| ERROR | Operation failures | API errors, validation failures, exceptions | On |
| FATAL | Application cannot continue | Startup failures, unrecoverable state | On |

### What to Log

<!-- AI: Define what information to capture for different event types -->

#### For All Errors

**Always Include**:
- Timestamp (ISO 8601 format)
- Error code (your defined codes)
- Error message (internal, not user-facing)
- Severity/level
- Component/module source

**Include When Available**:
- Request ID / Correlation ID (for tracing)
- User ID (anonymized if needed)
- Session ID
- Environment (dev/staging/prod)

#### For Network/API Errors

- URL/endpoint called
- HTTP method
- Response status code
- Request duration
- Request ID from external service

#### For Validation Errors

- Field(s) that failed
- Validation rule that failed
- Provided value (sanitized - no passwords!)

#### For Application Errors

- Stack trace (in development/staging)
- Application state summary
- Recent user actions (if available)

### What NOT to Log

<!-- AI: Sensitive data that should never appear in logs -->

**Never Log**:
- Passwords or secrets
- Full credit card numbers
- Personal identification numbers (SSN, etc.)
- Authentication tokens (log last 4 chars at most)
- Health or financial data (unless required and encrypted)

**Sanitization Rules**:
- Mask credentials: `password: "[REDACTED]"`
- Truncate tokens: `token: "...xyz123"`
- Hash identifiers if needed for correlation

### Log Format

<!-- AI: Define consistent log format across the application -->

**Structured Logging** (recommended for production):
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "ERROR",
  "code": "API001",
  "message": "External API authentication failed",
  "component": "api-client",
  "context": {
    "endpoint": "/v1/users",
    "status": 401,
    "duration_ms": 234
  },
  "correlation_id": "abc-123-def"
}
```

**Human-Readable** (for development):
```
[2024-01-15 10:30:00] ERROR [api-client] API001: External API authentication failed (endpoint=/v1/users, status=401)
```

### Log Storage & Retention

<!-- AI: Configure where logs go and how long they're kept -->

| Environment | Destination | Retention | Notes |
|-------------|-------------|-----------|-------|
| Development | Console/File | Session | Verbose output |
| Staging | File/Service | 7-14 days | Match production format |
| Production | Logging service | 30-90 days | Structured, searchable |

**Log Rotation** (for file-based):
- Max file size: [e.g., 10MB]
- Max files: [e.g., 5]
- Compression: [Yes/No]

---

## Error Monitoring & Alerting

<!-- AI: How errors are monitored and when alerts are triggered -->

### Error Tracking Integration

<!-- AI: Document integration with error tracking services like Sentry, Bugsnag, Rollbar, etc. -->

**Service**: [Error tracking service or "None - manual monitoring"]

**Configuration**:
- Capture uncaught exceptions: Yes
- Capture unhandled promise rejections: Yes
- Source maps: [Enabled for stack traces]
- Environment tagging: [dev/staging/prod]

### Alert Thresholds

<!-- AI: Define when errors should trigger alerts -->

| Condition | Threshold | Alert Level | Action |
|-----------|-----------|-------------|--------|
| Error rate spike | [e.g., >5% of requests] | Warning | Investigate |
| Critical errors | Any occurrence | Critical | Immediate response |
| New error type | First occurrence | Info | Review and categorize |
| Error rate sustained | [e.g., >1% for 5 min] | Warning | Investigate |

---

## Error Handling by Platform

<!-- AI: Platform-specific error handling considerations -->

### Web Applications

**Browser-Specific**:
- Global error handler: `window.onerror`
- Promise rejections: `window.onunhandledrejection`
- React/Vue error boundaries for component failures
- Service worker error handling for PWAs

**Considerations**:
- Network errors common (users go offline)
- Browser differences in error objects
- CORS errors have limited detail for security

### Desktop Applications

**Platform-Specific**:
- Crash reporters for native crashes
- IPC error handling between processes
- File system permission handling
- Native dialog for critical errors

**Considerations**:
- Offline-first, network errors expected
- More control over error display
- Need graceful handling of system events (sleep, shutdown)

### Mobile Applications

**Platform-Specific**:
- Crash reporting (Crashlytics, Sentry)
- Background task error handling
- Push notification for error resolution
- Deep link error handling

**Considerations**:
- Unreliable network is the norm
- Battery considerations for retries
- App store requirements for crash handling

### Backend Services

**Platform-Specific**:
- Global exception handlers in framework
- Middleware for consistent error responses
- Health check endpoint error reporting
- Graceful shutdown on fatal errors

**Considerations**:
- Error responses must not leak internal details
- Correlation IDs for distributed tracing
- Different error formats for different clients (API vs HTML)

### CLI Applications

**Platform-Specific**:
- Exit codes for scripting integration
- Stderr for errors, stdout for output
- Verbose mode for debugging
- Color coding for error severity

**Considerations**:
- No UI for error display
- Must be scriptable (parseable output)
- Interactive vs non-interactive mode differences

---

## Implementation Checklist

<!-- AI: Checklist for implementing error handling in the codebase -->

### Setup
- [ ] Global error handler configured
- [ ] Logging framework integrated
- [ ] Error tracking service connected (if applicable)
- [ ] Error code constants defined
- [ ] User-facing message strings externalized

### Per Feature
- [ ] All error states identified
- [ ] Error codes assigned
- [ ] User messages written
- [ ] Recovery strategy defined
- [ ] Logging added
- [ ] Error display implemented
- [ ] Tests for error scenarios

### Monitoring
- [ ] Alert thresholds configured
- [ ] Dashboard for error rates
- [ ] Regular error review process

---

## Related Documents

<!-- AI: Link to related documents. Ensure bidirectional linking. -->

| Document | Relationship |
|----------|--------------|
| [17 - Code Patterns](./17-code-patterns.md) | Error handling code patterns and examples |
| [21 - Monitoring & Observability](./21-monitoring-observability.md) | Error monitoring and alerting setup |
| [09 - API Contracts](./09-api-contracts.md) | API error response formats |
| [08 - Data Models](./08-data-models.md) | Validation error definitions |
| [05 - UI/UX Design](./05-ui-ux-design.md) | Error display UI patterns |
| [13 - Accessibility](./13-accessibility.md) | Accessible error announcements |

---

## AI Agent Instructions

<!-- AI: Instructions for AI agents working with this document -->

### When Populating This Document

1. **Start from user flows**: Reference doc 05 to identify where errors can occur
2. **Categorize by source**: Network, API, validation, application, resource, auth
3. **Write user messages carefully**: Follow the guidelines - be helpful, not technical
4. **Define recovery for every error**: Users should always have a next step
5. **Be consistent with codes**: Establish a pattern and stick to it

### When Implementing Error Handling

1. **Create error constants/enums first**: Define all error codes centrally
2. **Build error utilities**: Helper functions for creating, logging, displaying errors
3. **Implement global handlers**: Catch-all for uncaught exceptions
4. **Add per-feature handling**: Handle expected errors at the appropriate level
5. **Connect monitoring**: Integrate with error tracking early

### Common Mistakes to Avoid

- **Generic messages**: "An error occurred" tells users nothing
- **Technical leakage**: Stack traces, SQL errors, or internal codes shown to users
- **Missing recovery**: Errors without a suggested next action
- **Inconsistent handling**: Same error type handled differently in different places
- **Silent failures**: Errors caught but not logged or reported
- **Over-alerting**: Every error triggers an alert (alert fatigue)

### Quality Checklist

Before marking this document complete:
- [ ] All known error types categorized
- [ ] User-facing messages follow guidelines
- [ ] Recovery strategy defined for each error type
- [ ] Logging levels assigned consistently
- [ ] Log format documented
- [ ] Platform-specific considerations addressed
- [ ] Related Documents links are bidirectional
