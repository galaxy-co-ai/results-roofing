# 11 - Security Considerations

<!-- AI: This document defines the security strategy for the application. It covers data protection, authentication, input validation, common vulnerabilities, and security best practices. Applicable to all project types. -->

## Security Philosophy

<!-- AI: Establish the guiding security principles for this project:

**Key Questions to Address**:
- What's the threat model? (Who might attack and why?)
- What data is most valuable or sensitive?
- What's the acceptable risk level?
- What compliance requirements apply?

**Common Philosophies**:
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimal access rights for users and components
- **Secure by Default**: Safe defaults, explicit opt-in for risky features
- **Zero Trust**: Verify everything, trust nothing by default
-->

**Philosophy**: [Describe the security approach for this project]

**Principles**:
1. [First guiding principle, e.g., "Never trust user input"]
2. [Second principle, e.g., "Encrypt all sensitive data at rest and in transit"]
3. [Third principle, e.g., "Log all security-relevant events"]

---

## Threat Model

<!-- AI: Document the threats relevant to this application. Consider:
- Who are potential attackers? (External hackers, malicious users, insiders)
- What do they want? (Data theft, service disruption, reputation damage)
- What's their capability? (Opportunistic vs. targeted attacks)
- What's the impact if they succeed?
-->

### Threat Actors

<!-- AI: Identify who might attack this system -->

| Actor | Motivation | Capability | Likelihood |
|-------|------------|------------|------------|
| Opportunistic attackers | Easy targets, automated scans | Low | High |
| Malicious users | Abuse features, steal data | Medium | Medium |
| Competitors | Business intelligence | Medium | Low |
| Nation-state actors | Espionage | High | Very Low (unless high-value target) |

### Assets to Protect

<!-- AI: List what needs protection, in priority order -->

| Asset | Value | Impact if Compromised |
|-------|-------|----------------------|
| [User credentials] | Critical | Account takeover, data breach |
| [Personal data] | High | Privacy violation, legal liability |
| [Business data] | High | Competitive disadvantage |
| [API keys/secrets] | Critical | Service abuse, cost exposure |
| [System availability] | Medium | User frustration, revenue loss |

### Attack Vectors

<!-- AI: Identify how attacks might occur -->

| Vector | Description | Mitigation Summary |
|--------|-------------|-------------------|
| Network | Man-in-the-middle, sniffing | TLS everywhere |
| Input | Injection, XSS, malformed data | Validation, sanitization |
| Authentication | Credential stuffing, brute force | Rate limiting, MFA |
| Dependencies | Supply chain attacks | Dependency auditing |
| Configuration | Misconfigurations, exposed secrets | Secure defaults, secret management |

---

## Data Protection

<!-- AI: Document how sensitive data is protected at rest, in transit, and in use -->

### Sensitive Data Inventory

<!-- AI: Catalog all sensitive data in the system. Be thorough - missing items are security gaps.

**Sensitivity Levels**:
- **Critical**: Credentials, secrets, payment data (highest protection)
- **High**: PII, personal data, health/financial info
- **Medium**: User-generated content, preferences
- **Low**: Public data, anonymous analytics
-->

| Data Type | Examples | Sensitivity | Storage Location | Protection |
|-----------|----------|-------------|------------------|------------|
| Credentials | Passwords, API keys | Critical | [Location] | Hashed/encrypted |
| Personal Info | Email, name, address | High | [Location] | Encrypted |
| User Content | [Project-specific] | Medium | [Location] | Access control |
| Preferences | Settings, theme | Low | [Location] | None required |

### Data at Rest

<!-- AI: How is stored data protected?

**Encryption Options**:
- **Full disk encryption**: OS-level, protects against physical theft
- **Database encryption**: Transparent data encryption (TDE)
- **Field-level encryption**: Encrypt specific sensitive fields
- **Application-level encryption**: Encrypt before storage
-->

**Encryption Strategy**:
- Method: [Encryption approach]
- Algorithm: [e.g., AES-256-GCM]
- Key Management: [How are keys stored and rotated?]

**Storage Locations**:
| Location | Data Types | Encryption | Access Control |
|----------|------------|------------|----------------|
| [Database/file/etc.] | [What's stored] | [Yes/No, method] | [Who can access] |

### Data in Transit

<!-- AI: How is data protected when transmitted? -->

**Transport Security**:
- Protocol: TLS 1.2+ required (TLS 1.3 preferred)
- Certificate Validation: [Strict / Trust system store / Custom CA]
- Certificate Pinning: [Yes/No - if yes, describe pin rotation strategy]

**API Security**:
- All external APIs: HTTPS only
- Internal services: [HTTPS / mTLS / Other]
- WebSocket: WSS (secure WebSocket)

### Data Retention & Disposal

<!-- AI: How long is data kept and how is it disposed? -->

| Data Type | Retention Period | Disposal Method |
|-----------|------------------|-----------------|
| [Type] | [Duration] | [Secure deletion, anonymization] |

---

## Authentication

<!-- AI: Document how users and services authenticate -->

### Authentication Methods

<!-- AI: Choose and configure authentication approach:

**Options**:
- **Username/Password**: Traditional, requires good password policy
- **OAuth/OIDC**: Delegate to identity provider (Google, GitHub, etc.)
- **Magic Links**: Passwordless via email
- **Passkeys/WebAuthn**: Passwordless via biometrics/hardware
- **API Keys**: For service-to-service or developer access
- **Certificates**: mTLS for service authentication
-->

**Primary Method**: [Authentication approach]

**Configuration**:
| Setting | Value | Rationale |
|---------|-------|-----------|
| Session duration | [Duration] | [Why this duration] |
| Refresh token lifetime | [Duration] | [Why this duration] |
| Remember me duration | [Duration] | [Why this duration] |

### Password Policy

<!-- AI: If using passwords, define the policy. Skip for passwordless. -->

| Requirement | Value | Rationale |
|-------------|-------|-----------|
| Minimum length | [8-16] | [Balance security and usability] |
| Complexity | [Requirements] | [Letter + number + special or length-based] |
| History | [Previous N passwords] | [Prevent reuse] |
| Expiration | [Days or Never] | [NIST recommends no expiration] |

**Password Storage**:
- Algorithm: [bcrypt / Argon2id / scrypt]
- Work factor: [Cost parameter]
- Salt: [Unique per password]

### Multi-Factor Authentication

<!-- AI: Document MFA requirements and options -->

**MFA Requirement**: [Required / Optional / Required for sensitive actions]

**Supported Methods**:
- [ ] TOTP (Authenticator apps)
- [ ] SMS (Not recommended, but widely supported)
- [ ] Email codes
- [ ] Hardware keys (WebAuthn/FIDO2)
- [ ] Push notifications

### Session Management

<!-- AI: How are sessions created, maintained, and invalidated? -->

**Session Storage**: [JWT / Server-side sessions / Cookies]

**Security Controls**:
- Session ID generation: [Cryptographically secure random]
- Session fixation prevention: [New ID on login]
- Concurrent sessions: [Limit per user]
- Inactivity timeout: [Duration]
- Absolute timeout: [Max session duration]

**Session Invalidation**:
- On logout: Clear session completely
- On password change: Invalidate all other sessions
- On suspicious activity: [Optional] force re-authentication

---

## Authorization

<!-- AI: Document how access control is enforced -->

### Authorization Model

<!-- AI: Choose and document access control model:

**Models**:
- **RBAC (Role-Based)**: Users have roles, roles have permissions
- **ABAC (Attribute-Based)**: Policies based on attributes
- **ACL (Access Control Lists)**: Per-resource permissions
- **ReBAC (Relationship-Based)**: Access based on relationships
-->

**Model**: [RBAC / ABAC / ACL / Custom]

**Implementation**: [Where authorization checks happen - middleware, service layer, etc.]

### Roles and Permissions

<!-- AI: Define roles and their permissions -->

| Role | Description | Permissions |
|------|-------------|-------------|
| [Admin] | [Full system access] | [All] |
| [User] | [Standard access] | [List permissions] |
| [Guest] | [Limited access] | [List permissions] |

### Resource-Level Authorization

<!-- AI: How is access controlled per resource? -->

| Resource | Access Rules |
|----------|--------------|
| [Resource type] | [Who can read/write/delete] |

### Permission Checking

<!-- AI: How and where are permissions verified? -->

**Enforcement Points**:
- [ ] API endpoints (middleware/guards)
- [ ] UI components (conditional rendering)
- [ ] Database queries (row-level security)
- [ ] Business logic (service layer)

**Principle**: Always verify on the server. Client-side checks are for UX only.

---

## Input Validation

<!-- AI: Document how user input is validated and sanitized -->

### Validation Strategy

<!-- AI: Define the overall validation approach:

**Principles**:
- Validate early, validate often
- Reject invalid input, don't try to fix it
- Use allowlists over denylists when possible
- Validate on server even if validated on client
-->

**Approach**: [Describe validation strategy]

### Validation by Data Type

<!-- AI: Define validation rules for common data types -->

#### String Fields

| Field Type | Max Length | Pattern | Sanitization |
|------------|------------|---------|--------------|
| Username | 50 | `[a-zA-Z0-9_-]` | Lowercase |
| Email | 254 | RFC 5322 pattern | Normalize |
| Password | 128 | [Min complexity] | Never log |
| Display name | 100 | Unicode letters/spaces | Trim, escape |
| Free text | [Limit] | None | HTML escape for display |
| URL | 2048 | Valid URL, allowed schemes | Validate scheme |
| Phone | 20 | E.164 format | Normalize |

#### Numeric Fields

| Field Type | Min | Max | Precision | Notes |
|------------|-----|-----|-----------|-------|
| ID | 1 | 2^53-1 | Integer | No negative IDs |
| Currency | 0 | [Limit] | 2 decimal | Use integer cents |
| Quantity | 0 | [Limit] | Integer | Non-negative |
| Percentage | 0 | 100 | 2 decimal | Validate range |

#### Date/Time Fields

| Field Type | Format | Validation |
|------------|--------|------------|
| Date | ISO 8601 | Valid date, reasonable range |
| Timestamp | ISO 8601 with TZ | Valid, not too far future/past |
| Duration | ISO 8601 duration | Valid, within limits |

#### File Uploads

| Check | Validation |
|-------|------------|
| File size | Max [size] bytes |
| File type | Allowlist of MIME types |
| File extension | Must match MIME type |
| Content | Scan/validate file content, not just extension |
| Filename | Sanitize, remove path components |

### Input Sanitization

<!-- AI: How to clean input for safe use -->

**For Display (XSS Prevention)**:
- HTML encode: `<` -> `&lt;`, `>` -> `&gt;`, etc.
- Use framework's auto-escaping (React, Vue, etc.)
- For rich text: Use sanitization library (DOMPurify, bleach)

**For Database (Injection Prevention)**:
- Use parameterized queries / prepared statements
- Never concatenate user input into queries
- Use ORM with proper escaping

**For Shell Commands (Command Injection)**:
- Avoid shell commands with user input entirely
- If unavoidable: Use libraries that don't invoke shell
- Escape and validate strictly

**For File Paths (Path Traversal)**:
- Reject paths with `..` or absolute paths
- Use allowlist of directories
- Validate final path is within allowed directory

---

## Common Vulnerabilities (OWASP Top 10)

<!-- AI: Address the most common security vulnerabilities. Reference: https://owasp.org/Top10/ -->

### A01: Broken Access Control

**Risk**: Users accessing resources they shouldn't

**Mitigations**:
- [ ] Deny by default, require explicit grants
- [ ] Implement server-side authorization for all requests
- [ ] Use resource-based authorization (check ownership)
- [ ] Disable directory listing
- [ ] Log access control failures, alert on patterns

**Implementation Notes**: [Project-specific notes]

### A02: Cryptographic Failures

**Risk**: Exposure of sensitive data due to weak or missing encryption

**Mitigations**:
- [ ] Classify data and protect accordingly
- [ ] Use strong algorithms (AES-256, RSA-2048+, SHA-256+)
- [ ] Generate keys properly (CSPRNG)
- [ ] Rotate keys periodically
- [ ] Don't store passwords in plaintext (use Argon2id/bcrypt)

**Implementation Notes**: [Project-specific notes]

### A03: Injection

**Risk**: Untrusted data interpreted as commands

**Mitigations**:
- [ ] Use parameterized queries / ORMs
- [ ] Validate and sanitize all input
- [ ] Escape output for the correct context
- [ ] Use LIMIT in queries to prevent mass disclosure

**Implementation Notes**: [Project-specific notes]

### A04: Insecure Design

**Risk**: Missing or ineffective security controls by design

**Mitigations**:
- [ ] Use threat modeling during design
- [ ] Implement secure design patterns
- [ ] Unit and integration test security controls
- [ ] Limit resource consumption (rate limiting)

**Implementation Notes**: [Project-specific notes]

### A05: Security Misconfiguration

**Risk**: Insecure default settings or incomplete configuration

**Mitigations**:
- [ ] Remove unused features and frameworks
- [ ] Disable verbose error messages in production
- [ ] Review cloud/container security settings
- [ ] Implement security headers (CSP, HSTS, etc.)
- [ ] Automate configuration verification

**Implementation Notes**: [Project-specific notes]

### A06: Vulnerable Components

**Risk**: Using components with known vulnerabilities

**Mitigations**:
- [ ] Inventory all dependencies
- [ ] Monitor for CVEs (Dependabot, Snyk, etc.)
- [ ] Update dependencies regularly
- [ ] Remove unused dependencies
- [ ] Prefer well-maintained components

**Implementation Notes**: [Project-specific notes]

### A07: Authentication Failures

**Risk**: Identity, authentication, or session management flaws

**Mitigations**:
- [ ] Implement MFA where possible
- [ ] Don't use default credentials
- [ ] Implement weak password checks
- [ ] Use secure session management
- [ ] Rate limit authentication attempts

**Implementation Notes**: [Project-specific notes]

### A08: Data Integrity Failures

**Risk**: Code and data integrity assumptions violated

**Mitigations**:
- [ ] Verify digital signatures on updates
- [ ] Use integrity verification for dependencies
- [ ] Implement CI/CD pipeline security
- [ ] Don't deserialize untrusted data without validation

**Implementation Notes**: [Project-specific notes]

### A09: Security Logging and Monitoring Failures

**Risk**: Breaches not detected due to insufficient logging

**Mitigations**:
- [ ] Log authentication events (success and failure)
- [ ] Log authorization failures
- [ ] Log input validation failures
- [ ] Ensure logs can't be forged/tampered
- [ ] Implement alerting for suspicious patterns

**Implementation Notes**: [Project-specific notes]

### A10: Server-Side Request Forgery (SSRF)

**Risk**: Server makes requests to unintended destinations

**Mitigations**:
- [ ] Validate and sanitize all URL input
- [ ] Use allowlist for permitted destinations
- [ ] Block requests to internal networks
- [ ] Don't accept raw URLs from users if possible

**Implementation Notes**: [Project-specific notes]

---

## API Key & Secret Management

<!-- AI: Document how API keys and other secrets are handled -->

### Secret Categories

| Secret Type | Examples | Storage | Rotation |
|-------------|----------|---------|----------|
| API Keys | Third-party service keys | [Location] | [Frequency] |
| Database Credentials | Connection strings | [Location] | [Frequency] |
| Encryption Keys | Data encryption keys | [Location] | [Frequency] |
| Signing Keys | JWT secrets, webhook secrets | [Location] | [Frequency] |

### Storage Methods

<!-- AI: Choose appropriate storage based on environment:

**Options by Platform**:
- **Web/Backend**: Environment variables, secret manager (Vault, AWS Secrets Manager)
- **Desktop**: OS keychain (Keychain on macOS, Credential Manager on Windows)
- **Mobile**: Secure storage (Keychain/Keystore)
- **CLI**: Environment variables, config file with restricted permissions
-->

**Primary Method**: [Secret storage approach]

**Configuration**:
- Development: [How secrets are managed locally]
- CI/CD: [How secrets are injected in pipelines]
- Production: [How secrets are managed in production]

### Secret Handling Rules

**Never**:
- Hardcode secrets in source code
- Log secrets (even partially)
- Include secrets in error messages
- Commit secrets to version control
- Expose secrets to frontend code

**Always**:
- Use environment variables or secret managers
- Rotate secrets periodically
- Audit secret access
- Use different secrets per environment

---

## Security Headers

<!-- AI: Document HTTP security headers for web applications -->

### Recommended Headers

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | [CSP policy] | Prevent XSS, data injection |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` | Force HTTPS |
| X-Content-Type-Options | `nosniff` | Prevent MIME sniffing |
| X-Frame-Options | `DENY` or `SAMEORIGIN` | Prevent clickjacking |
| Referrer-Policy | `strict-origin-when-cross-origin` | Control referrer info |
| Permissions-Policy | [Policy] | Control browser features |

### Content Security Policy

<!-- AI: Define CSP policy - be restrictive, relax as needed -->

```
default-src 'self';
script-src 'self' [trusted-scripts];
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self' [api-domains];
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**CSP Notes**: [Project-specific CSP adjustments and rationale]

---

## Security by Platform

<!-- AI: Platform-specific security considerations -->

### Web Applications

- Enable HTTPS everywhere (use HSTS)
- Implement CSRF protection
- Set secure cookie attributes (Secure, HttpOnly, SameSite)
- Use Content Security Policy
- Implement subresource integrity for CDN assets

### Desktop Applications

- Store secrets in OS keychain
- Sign application binaries
- Implement auto-update with signature verification
- Sandbox file system access
- Validate IPC messages between processes

### Mobile Applications

- Use platform secure storage (Keychain/Keystore)
- Implement certificate pinning
- Obfuscate sensitive logic (not security by obscurity, but raises bar)
- Don't log sensitive data
- Implement app integrity checks

### Backend Services

- Run with minimal privileges
- Use network segmentation
- Implement rate limiting
- Validate all input at service boundaries
- Use service mesh for internal authentication (mTLS)

### CLI Applications

- Don't store secrets in plain text config files
- Use OS credential storage or environment variables
- Validate input from stdin and arguments
- Be careful with command output (may be logged)
- Support secure configuration file permissions

---

## Security Checklist

<!-- AI: Pre-deployment security checklist -->

### Pre-Launch

**Authentication & Authorization**:
- [ ] Authentication mechanism implemented and tested
- [ ] Authorization checks on all protected resources
- [ ] Session management secure (timeouts, invalidation)
- [ ] Password policy enforced (if applicable)
- [ ] MFA available (if applicable)

**Data Protection**:
- [ ] Sensitive data encrypted at rest
- [ ] All communications over TLS
- [ ] Secrets not in source code
- [ ] Data retention policy implemented

**Input Handling**:
- [ ] All input validated on server
- [ ] Output encoding for XSS prevention
- [ ] Parameterized queries for database
- [ ] File upload validation

**Configuration**:
- [ ] Debug mode disabled in production
- [ ] Verbose errors disabled
- [ ] Security headers configured
- [ ] Unnecessary features disabled

**Monitoring**:
- [ ] Security events logged
- [ ] Log monitoring in place
- [ ] Alerting configured

### Ongoing

**Regular Tasks**:
- [ ] Dependency updates (weekly/monthly)
- [ ] Security advisory monitoring
- [ ] Access review (quarterly)
- [ ] Secret rotation (as scheduled)
- [ ] Penetration testing (annually or after major changes)

---

## Incident Response

<!-- AI: Brief incident response plan for security events -->

### Detection

**Indicators of Compromise**:
- Unusual authentication patterns (many failures, unusual locations)
- Unexpected data access or exfiltration
- System/configuration changes
- Alerts from security monitoring

### Response Steps

1. **Contain**: Stop the immediate threat (block IP, disable account, etc.)
2. **Assess**: Determine scope and impact
3. **Notify**: Inform stakeholders and users if required
4. **Remediate**: Fix the vulnerability
5. **Recover**: Restore normal operation
6. **Learn**: Document and improve defenses

### Contacts

| Role | Contact | When to Notify |
|------|---------|----------------|
| Security Lead | [Contact] | All security incidents |
| Legal | [Contact] | Data breach, compliance issue |
| PR/Communications | [Contact] | Public-facing incidents |

---

## Related Documents

<!-- AI: Link to related documents. Ensure bidirectional linking. -->

| Document | Relationship |
|----------|--------------|
| [23 - Configuration Management](./23-configuration-management.md) | Secret management, environment configuration |
| [10 - Error Handling](./10-error-handling.md) | Secure error messages, no sensitive data exposure |
| [08 - Data Models](./08-data-models.md) | Data sensitivity classification |
| [09 - API Contracts](./09-api-contracts.md) | API authentication and authorization |
| [21 - Monitoring & Observability](./21-monitoring-observability.md) | Security event logging and alerting |
| [12 - Testing Strategy](./12-testing-strategy.md) | Security testing approach |

---

## AI Agent Instructions

<!-- AI: Instructions for AI agents working with this document -->

### When Populating This Document

1. **Start from data inventory**: List all sensitive data from doc 08
2. **Identify entry points**: Where can attackers interact with the system?
3. **Apply defense in depth**: Multiple layers, not single points of failure
4. **Be specific**: Generic advice doesn't help - tailor to this project
5. **Reference standards**: OWASP, NIST, industry best practices

### When Implementing Security

1. **Don't roll your own crypto**: Use established libraries
2. **Implement authentication early**: Retrofitting is harder
3. **Test security controls**: Include in automated testing
4. **Review dependencies**: Check for vulnerabilities before adding
5. **Fail securely**: Errors should deny access, not grant it

### Common Mistakes to Avoid

- **Security by obscurity**: Hiding code doesn't make it secure
- **Client-side only validation**: Always validate on server
- **Trusting user input**: Assume all input is malicious
- **Storing secrets in code**: Use environment variables or secret managers
- **Ignoring dependencies**: Third-party code has vulnerabilities too
- **Logging sensitive data**: Never log passwords, tokens, or PII

### Quality Checklist

Before marking this document complete:
- [ ] All sensitive data identified and classified
- [ ] Authentication method chosen and configured
- [ ] Authorization model defined
- [ ] Input validation rules specified
- [ ] OWASP Top 10 addressed
- [ ] Secret management documented
- [ ] Platform-specific considerations covered
- [ ] Related Documents links are bidirectional
