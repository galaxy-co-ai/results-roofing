# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at Results Roofing. If you discover a security vulnerability, please follow these steps:

### Do NOT

- Open a public GitHub issue for security vulnerabilities
- Post details about the vulnerability in public forums
- Exploit the vulnerability beyond what's necessary to demonstrate it

### Do

1. **Email us directly** at security@resultsroofing.com (or contact the repository maintainers)
2. **Include details** about the vulnerability:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Assessment**: We will assess the vulnerability and its impact
- **Resolution**: We will work on a fix and coordinate disclosure
- **Credit**: We will credit you in our release notes (if desired)

## Security Best Practices for Contributors

### Environment Variables

- Never commit `.env.local` or any file containing secrets
- Use `.env.example` as a template (it contains only placeholder values)
- Rotate any credentials that may have been accidentally exposed

### Authentication

- This project uses Clerk for authentication
- Never bypass authentication checks
- Always validate user permissions on the server side

### Data Handling

- Sanitize all user input
- Use parameterized queries (Drizzle ORM handles this)
- Never log sensitive data (PII, payment info, credentials)

### Dependencies

- Keep dependencies up to date
- Review security advisories for dependencies
- Use `npm audit` regularly

### Code Review

- All changes go through PR review
- Security-sensitive changes require additional review
- Use the security checklist in PR reviews

## Security Checklist for PRs

When reviewing PRs, consider:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user-provided data
- [ ] Proper authentication/authorization checks
- [ ] No sensitive data in logs or error messages
- [ ] SQL injection prevention (using ORM properly)
- [ ] XSS prevention (proper output encoding)
- [ ] CSRF protection where applicable
- [ ] Secure headers configured
- [ ] Rate limiting on sensitive endpoints

## Known Security Considerations

### Payment Processing
- All payment processing is handled by Stripe
- We never store full credit card numbers
- PCI compliance is maintained through Stripe's infrastructure

### Personal Data
- Customer data is stored in encrypted databases
- Access is controlled through Clerk authentication
- Data retention policies are documented in privacy policy

### Third-Party Integrations
- All integrations use secure API connections (HTTPS)
- API keys are stored as environment variables
- Webhook signatures are validated

## Security Headers

This application configures the following security headers via Next.js:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (configured in `next.config.mjs`)

## Contact

For security concerns, please contact the maintainers directly rather than opening a public issue.
