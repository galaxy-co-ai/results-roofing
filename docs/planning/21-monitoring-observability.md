# 21 - Monitoring & Observability

<!-- AI: This document defines how errors, performance, and usage are tracked in production. Good observability enables quick issue detection and resolution. Applicable to all deployed applications. -->

## Observability Philosophy

<!-- AI: Establish monitoring principles for the project:

**Key Questions**:
- What level of visibility do you need into production?
- How quickly do you need to know about issues?
- What's the balance between data collection and privacy?
- Who needs access to monitoring data?

**Three Pillars of Observability**:
- **Logs**: Record of events that happened
- **Metrics**: Numeric measurements over time
- **Traces**: Request flow across services
-->

**Philosophy**: [Describe the observability approach for this project]

**Principles**:
1. [First principle, e.g., "Know about issues before users report them"]
2. [Second principle, e.g., "Never log sensitive data"]
3. [Third principle, e.g., "Actionable alerts only - no noise"]

---

## Error Tracking

<!-- AI: How errors are captured and analyzed -->

### Error Reporting Service

<!-- AI: Choose based on tech stack and budget.

**Options**:
- **Sentry**: Popular, full-featured, good free tier
- **Bugsnag**: Similar to Sentry, good mobile support
- **Rollbar**: Strong JavaScript support
- **LogRocket**: Session replay + errors
- **Self-hosted**: Sentry can be self-hosted
-->

| Aspect | Decision |
|--------|----------|
| Service | [Sentry / Bugsnag / Rollbar / LogRocket / Self-hosted / None] |
| Environments tracked | [Production only / Production + Staging / All] |
| Source maps | [Uploaded on build / Not used] |

### What Gets Reported

<!-- AI: Define what errors are captured vs ignored -->

| Error Type | Captured? | Notes |
|------------|-----------|-------|
| Uncaught exceptions | Yes | Always capture |
| Handled errors | [Yes / No] | Capture if unexpected |
| Network failures | [Yes / No] | Capture with context |
| User-initiated cancellations | No | Not errors |
| Expected conditions | No | 404s, validation failures |

### Error Context

<!-- AI: What additional data is sent with errors? -->

**Always Include**:
- [ ] App version
- [ ] OS / Platform
- [ ] Error stack trace

**Include When Relevant**:
- [ ] User ID (anonymized if needed)
- [ ] Action that triggered error
- [ ] Relevant state snapshot
- [ ] Browser/device info (web)
- [ ] Memory usage (desktop/mobile)

### Sensitive Data Handling

<!-- AI: Reference doc 11 security considerations -->

**Never Log**:
- API keys / tokens
- Passwords
- Credit card numbers
- Personal identifiable information (PII) unless explicitly consented
- Session tokens
- [Add project-specific items]

**Scrubbing Rules**:
- Configure error service to scrub sensitive fields
- Use allowlists rather than denylists when possible

---

## Logging

<!-- AI: Application logging strategy -->

### Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| ERROR | Unexpected failures requiring attention | Failed API call, uncaught exception |
| WARN | Potential issues, recoverable | Retry succeeded, deprecated usage |
| INFO | Significant events | User action, feature used |
| DEBUG | Detailed troubleshooting | Request/response bodies, state changes |
| TRACE | Very detailed (usually disabled) | Function entry/exit, variable values |

### Log Storage

| Environment | Storage | Retention |
|-------------|---------|-----------|
| Development | [Console / File] | [Session only] |
| Staging | [File / Cloud service] | [X days] |
| Production | [Cloud service / File + rotation] | [X days] |

### Log Format

<!-- AI: Structured logging recommended for searchability -->

**Structured Format (JSON)**:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "ERROR",
  "message": "API request failed",
  "context": {
    "endpoint": "/api/users",
    "status": 500,
    "duration_ms": 234
  },
  "correlation_id": "abc-123"
}
```

**Human-Readable (Development)**:
```
[2024-01-15 10:30:00] ERROR: API request failed (endpoint=/api/users, status=500)
```

### Logging Best Practices

**Do**:
- Use structured logging in production
- Include correlation IDs for request tracing
- Log at appropriate levels
- Include relevant context

**Don't**:
- Log sensitive data (see above)
- Log at DEBUG level in production by default
- Create log entries for every function call
- Log user input without sanitization

---

## Analytics & Telemetry

<!-- AI: Usage tracking and analytics -->

### Usage Analytics

| Aspect | Decision |
|--------|----------|
| Enabled | [Yes / No / Opt-in only] |
| Service | [Amplitude / Mixpanel / PostHog / Plausible / Self-hosted / None] |
| User consent | [Required before tracking / Opt-out available / N/A] |

### Events Tracked

<!-- AI: If analytics enabled, what do you track? -->

| Event | Purpose |
|-------|---------|
| App opened | Usage frequency |
| Feature X used | Feature adoption |
| Error encountered | User impact of errors |
| Conversion event | Business metrics |
| [Add project-specific events] | [Purpose] |

### Privacy Compliance

- [ ] Analytics can be disabled by user
- [ ] No PII in analytics events
- [ ] Compliant with GDPR / CCPA (if applicable)
- [ ] Privacy policy documents data collection
- [ ] Data retention limits configured

---

## Performance Monitoring

<!-- AI: Tracking application performance in production -->

### Metrics Tracked

<!-- AI: Reference doc 14 performance goals -->

| Metric | Target | Monitoring |
|--------|--------|------------|
| App startup time | [From doc 14] | [How measured] |
| Memory usage | [From doc 14] | [How measured] |
| API response time | [From doc 14] | [How measured] |
| Error rate | [From doc 14] | [How measured] |
| [Add project-specific] | | |

### Real User Monitoring (RUM)

<!-- AI: Performance data from actual users -->

| Aspect | Decision |
|--------|----------|
| Enabled | [Yes / No] |
| Service | [Sentry Performance / DataDog RUM / Custom / None] |
| Sampling rate | [100% / X%] |

### Synthetic Monitoring

<!-- AI: Scheduled checks from known locations -->

| Aspect | Decision |
|--------|----------|
| Enabled | [Yes / No] |
| Service | [Pingdom / UptimeRobot / Custom / None] |
| Check frequency | [Every X minutes] |
| Locations | [List of regions] |

---

## Alerting

<!-- AI: How issues are communicated -->

### Alert Channels

- [ ] Email
- [ ] Slack / Discord / Teams
- [ ] PagerDuty / Opsgenie / VictorOps
- [ ] SMS
- [ ] In-app notification
- [ ] None (check dashboard manually)

### Alert Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| Error spike (>X errors/hour) | High | Immediate notification |
| New error type | Medium | Daily digest |
| Performance degradation | Medium | Daily digest |
| Service down | Critical | Immediate page |
| Security event | Critical | Immediate page |

### Alert Best Practices

**Avoid Alert Fatigue**:
- Only alert on actionable conditions
- Group related alerts
- Set appropriate thresholds (not too sensitive)
- Review and tune alerts regularly

**On-Call Considerations** (if applicable):
- Define escalation paths
- Document response procedures
- Rotate on-call fairly
- Track alert frequency and resolution time

---

## Dashboards

<!-- AI: Visualization of system health -->

### Dashboard Types

| Dashboard | Audience | Contents |
|-----------|----------|----------|
| Operations | Dev team | Error rates, latency, system health |
| Business | Stakeholders | Usage metrics, adoption, conversion |
| On-call | On-call engineer | Current alerts, recent deployments |

### Dashboard Tools

| Tool | Use Case |
|------|----------|
| Grafana | Metrics visualization, flexible |
| DataDog | All-in-one APM + dashboards |
| Built-in (Sentry, etc.) | Service-specific dashboards |
| Custom | Project-specific needs |

### Key Dashboard Elements

**Operations Dashboard**:
- Current error rate
- Response time percentiles
- Active alerts
- Recent deployments
- System resource usage

---

## Health Checks

<!-- AI: Automated checks for system health -->

### Health Check Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| /health | Basic liveness | 200 OK if running |
| /health/ready | Readiness for traffic | 200 if can serve requests |
| /health/deep | Full dependency check | Status of all dependencies |

### Health Check Frequency

| Check | Interval | Timeout |
|-------|----------|---------|
| Load balancer | [Every X seconds] | [X seconds] |
| External monitoring | [Every X minutes] | [X seconds] |
| Deep health check | [Every X minutes] | [X seconds] |

---

## Related Documents

<!-- AI: Link to related documents. Ensure bidirectional linking. -->

| Document | Relationship |
|----------|--------------|
| [10 - Error Handling](./10-error-handling.md) | Error definitions and logging levels |
| [11 - Security Considerations](./11-security-considerations.md) | Sensitive data in logs |
| [14 - Performance Goals](./14-performance-goals.md) | Performance targets to monitor |
| [12 - Testing Strategy](./12-testing-strategy.md) | Testing monitoring integration |
| [19 - CI/CD Pipeline](./19-cicd-pipeline.md) | Alerting on deployment failures |

---

## AI Agent Instructions

<!-- AI: Instructions for AI agents working with this document -->

### When Populating This Document

1. **Choose services for the stack**: Match monitoring tools to platform
2. **Reference error handling doc**: Log levels and error categories come from doc 10
3. **Reference security doc**: Understand what data is sensitive
4. **Reference performance doc**: Know what metrics to track
5. **Consider privacy**: Document what data is collected and why

### When Implementing Monitoring

1. **Start with errors**: Error tracking is the minimum viable observability
2. **Add structured logging**: Make logs searchable and useful
3. **Configure alerts carefully**: Too many alerts = alert fatigue
4. **Test monitoring**: Verify errors reach the monitoring service
5. **Document events**: Update this doc when adding tracked events

### Common Mistakes to Avoid

- **Logging sensitive data**: PII, credentials, tokens in logs
- **Alert fatigue**: Too many alerts, team ignores them
- **Missing context**: Errors without useful debugging info
- **No correlation**: Can't trace requests across components
- **Over-logging**: Logs are expensive to store and search
- **Under-monitoring**: Find out about issues from users

### Quality Checklist

Before marking this document complete:
- [ ] Error tracking service chosen
- [ ] Log levels and format defined
- [ ] Sensitive data handling documented
- [ ] Analytics approach decided (including privacy)
- [ ] Performance metrics defined
- [ ] Alert rules and channels configured
- [ ] Dashboards planned
- [ ] Related Documents links are bidirectional
