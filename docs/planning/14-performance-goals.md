# 14 - Performance Goals

<!-- AI: This document defines performance targets, measurement strategies, and optimization approaches. Performance goals ensure a responsive user experience. Applicable to all project types. -->

## Performance Philosophy

<!-- AI: Establish performance principles for the project:

**Key Questions**:
- What does "fast" mean for this application?
- Which metrics matter most to users?
- What's the minimum acceptable performance?
- How will performance be monitored over time?

**Common Approaches**:
- **User-centric**: Focus on perceived performance
- **Data-driven**: Set targets based on analytics
- **Budget-based**: Define and enforce performance budgets
- **Continuous**: Monitor and improve over time
-->

**Philosophy**: [Describe the performance approach for this project]

**Principles**:
1. [First principle, e.g., "Response time under 100ms feels instant"]
2. [Second principle, e.g., "Test on slow devices, not developer machines"]
3. [Third principle, e.g., "Measure before optimizing"]

---

## Performance Metrics

<!-- AI: Define which metrics to track. Different application types have different key metrics.

**Web Application Metrics (Core Web Vitals)**:
- LCP (Largest Contentful Paint): Loading - <2.5s good, <4s needs improvement
- FID (First Input Delay): Interactivity - <100ms good, <300ms needs improvement
- CLS (Cumulative Layout Shift): Visual stability - <0.1 good, <0.25 needs improvement
- INP (Interaction to Next Paint): Responsiveness - <200ms good, <500ms needs improvement
- TTFB (Time to First Byte): Server response - <800ms good

**Desktop/Mobile App Metrics**:
- Cold start time
- Warm start time
- Memory usage
- CPU usage
- Frame rate / UI responsiveness
- Battery impact (mobile)

**Backend/API Metrics**:
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate
- Resource utilization
-->

### Key Performance Indicators

| Metric | Target | Critical Threshold | Measurement |
|--------|--------|-------------------|-------------|
| [Primary metric] | [Target] | [Unacceptable level] | [How measured] |
| [Secondary metric] | [Target] | [Unacceptable level] | [How measured] |
| [Secondary metric] | [Target] | [Unacceptable level] | [How measured] |

---

## Target-Setting Guidance

<!-- AI: Help set realistic, meaningful performance targets -->

### Industry Benchmarks

<!-- AI: Reference points for setting targets. Adjust based on user expectations and competitive landscape. -->

#### Web Applications

| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| Time to Interactive | <3s | <5s | <7s | >7s |
| First Contentful Paint | <1s | <1.8s | <3s | >3s |
| Largest Contentful Paint | <1.5s | <2.5s | <4s | >4s |
| First Input Delay | <50ms | <100ms | <300ms | >300ms |
| Cumulative Layout Shift | <0.05 | <0.1 | <0.25 | >0.25 |
| JavaScript bundle | <100KB | <200KB | <350KB | >350KB |
| Total page weight | <500KB | <1MB | <2MB | >2MB |

#### Desktop Applications

| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| Cold start | <1s | <2s | <5s | >5s |
| Warm start | <200ms | <500ms | <1s | >1s |
| Memory (idle) | <50MB | <100MB | <200MB | >200MB |
| CPU (idle) | <1% | <3% | <5% | >5% |
| UI response | <16ms | <33ms | <100ms | >100ms |

#### Mobile Applications

| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| Cold start | <1s | <2s | <4s | >4s |
| Screen transition | <300ms | <500ms | <1s | >1s |
| Memory usage | <100MB | <150MB | <250MB | >250MB |
| Battery impact | Minimal | Low | Medium | High |

#### Backend APIs

| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| Response time (p50) | <50ms | <100ms | <300ms | >300ms |
| Response time (p95) | <200ms | <500ms | <1s | >1s |
| Response time (p99) | <500ms | <1s | <2s | >2s |
| TTFB | <100ms | <200ms | <500ms | >500ms |
| Error rate | <0.1% | <0.5% | <1% | >1% |

### Setting Your Targets

<!-- AI: Guidance for choosing appropriate targets -->

**Consider**:
1. **User expectations**: What do users expect from similar apps?
2. **Competitive landscape**: What do competitors achieve?
3. **Device diversity**: Target the slowest supported device
4. **Network conditions**: Consider slow/unreliable networks
5. **Business impact**: How does performance affect metrics?

**Target Levels**:
- **Goal**: What you're striving for (aspirational)
- **Acceptable**: Minimum acceptable level (ship threshold)
- **Critical**: Below this requires immediate action (alert threshold)

---

## Startup Performance

<!-- AI: First impressions matter - startup time directly affects user perception -->

### Startup Metrics

| Phase | Target | Description |
|-------|--------|-------------|
| Cold start | [Target]s | First launch, nothing cached |
| Warm start | [Target]s | App was recently used, data cached |
| Hot start | [Target]ms | App in background, brought forward |
| First render | [Target]ms | Something visible on screen |
| Interactive | [Target]s | User can interact with core features |

### Startup Optimization Strategies

**General**:
- Defer non-critical initialization
- Show skeleton/loading states early
- Prioritize above-the-fold content
- Cache aggressively for warm starts

**Web Applications**:
- Code splitting (load only what's needed)
- Server-side rendering (SSR) for initial HTML
- Preload critical resources
- Inline critical CSS

**Desktop Applications**:
- Lazy load secondary features
- Use native splash screens
- Defer heavy operations to after UI shown
- Consider background pre-launching

**Mobile Applications**:
- Minimize app binary size
- Defer network requests after UI ready
- Use efficient serialization for cached data
- Implement progressive loading

---

## Runtime Performance

<!-- AI: Performance during normal application use -->

### Memory Usage

<!-- AI: Memory management is critical for long-running applications -->

| State | Target | Notes |
|-------|--------|-------|
| Idle | [Target] MB | Baseline memory footprint |
| Active | [Target] MB | Normal usage |
| Peak | [Target] MB | Maximum allowed |
| Growth/hour | [Target] MB | Memory leak detection |

**Memory Optimization**:
- Profile memory usage regularly
- Identify and fix memory leaks
- Implement proper cleanup on unmount/destroy
- Use object pooling for frequently created objects
- Limit cache sizes, implement eviction
- Avoid unnecessary object creation in loops

### CPU Usage

| State | Target | Notes |
|-------|--------|-------|
| Idle | <[X]% | Should be near zero when not active |
| Normal operation | <[X]% | Regular usage |
| Peak (acceptable) | <[X]% | Brief spikes during heavy operations |

**CPU Optimization**:
- Debounce/throttle expensive operations
- Use Web Workers / background threads for heavy work
- Avoid unnecessary re-renders (frontend)
- Batch DOM updates
- Use efficient algorithms

### Frame Rate / UI Responsiveness

| Context | Target | Notes |
|---------|--------|-------|
| Animations | 60 fps | Smooth animations |
| Scrolling | 60 fps | Smooth scrolling |
| Input response | <100ms | Immediate feedback |

**UI Performance Optimization**:
- Avoid layout thrashing
- Use CSS transforms over layout changes
- Implement virtual scrolling for long lists
- Optimize images and assets
- Profile and eliminate jank

---

## Response Latency

<!-- AI: Time for operations to complete -->

### User Actions

| Operation | Target | Rationale |
|-----------|--------|-----------|
| Button click feedback | <50ms | Feels instant |
| Navigation | <300ms | Quick transition |
| Form submission | <1s | Reasonable wait |
| Search results | <500ms | Don't interrupt flow |
| Data load (small) | <500ms | Perceived fast |
| Data load (large) | <2s + progress | Show loading indicator |

### API Response Times

| Endpoint Type | p50 | p95 | p99 |
|---------------|-----|-----|-----|
| Health/status | <10ms | <50ms | <100ms |
| Simple read | <50ms | <200ms | <500ms |
| Complex query | <200ms | <500ms | <1s |
| Write operation | <100ms | <300ms | <1s |
| Bulk operation | <1s | <5s | <10s |

### Network Considerations

<!-- AI: Network performance varies widely -->

**Targets by Network**:
| Connection | Expected Latency | Target Experience |
|------------|------------------|-------------------|
| Fast (4G/WiFi) | <100ms | Full experience |
| Moderate (3G) | 100-500ms | Optimized experience |
| Slow (2G) | >500ms | Core functionality |
| Offline | N/A | Offline mode (if applicable) |

---

## Performance Budget

<!-- AI: Limits that cannot be exceeded -->

### Resource Budgets

<!-- AI: Define size limits for assets. These become CI/CD gates.

**Setting Budgets**:
- Start with industry benchmarks
- Measure current state
- Set realistic reduction targets
- Enforce in CI pipeline
-->

| Resource Type | Budget | Current | Notes |
|---------------|--------|---------|-------|
| JavaScript (compressed) | [X] KB | [X] KB | Per-route or total |
| CSS (compressed) | [X] KB | [X] KB | Per-route or total |
| Images (per page) | [X] KB | [X] KB | Average |
| Fonts | [X] KB | [X] KB | Total |
| Total initial load | [X] KB | [X] KB | All critical resources |
| Third-party scripts | [X] KB | [X] KB | Analytics, ads, etc. |

### Time Budgets

| Milestone | Budget | Current |
|-----------|--------|---------|
| Time to First Byte | [X]ms | [X]ms |
| First Contentful Paint | [X]s | [X]s |
| Time to Interactive | [X]s | [X]s |
| Full page load | [X]s | [X]s |

### Budget Enforcement

**Automated Checks**:
- [ ] Build fails if JS bundle exceeds limit
- [ ] PR blocked if performance regresses beyond threshold
- [ ] Alerts when production metrics degrade

**Tools for Budget Enforcement**:
- Bundlewatch / Size Limit (bundle size)
- Lighthouse CI (performance scores)
- SpeedCurve / Calibre (real user monitoring)

---

## Optimization Strategies

<!-- AI: Common optimization techniques by category -->

### Frontend Optimization

**Loading Performance**:
| Technique | Impact | Effort | When to Use |
|-----------|--------|--------|-------------|
| Code splitting | High | Medium | Multiple routes/features |
| Lazy loading | High | Low | Below-fold content |
| Tree shaking | Medium | Low | Modern bundlers |
| Compression (gzip/brotli) | High | Low | All text resources |
| CDN | High | Medium | Static assets |
| Preloading | Medium | Low | Critical resources |
| Service worker caching | High | High | Repeat visitors |

**Runtime Performance**:
| Technique | Impact | Effort | When to Use |
|-----------|--------|--------|-------------|
| Memoization | Medium | Low | Expensive computations |
| Virtual scrolling | High | Medium | Long lists (>100 items) |
| Debouncing/throttling | Medium | Low | Frequent events |
| Web Workers | High | High | Heavy computation |
| requestAnimationFrame | Medium | Low | Animations |
| Layout optimization | Medium | Medium | Complex UIs |

### Backend Optimization

| Technique | Impact | Effort | When to Use |
|-----------|--------|--------|-------------|
| Database indexing | High | Medium | Slow queries |
| Query optimization | High | Medium | N+1 queries, slow queries |
| Caching (Redis, etc.) | High | Medium | Repeated expensive operations |
| Connection pooling | Medium | Low | Database connections |
| Async processing | High | Medium | Non-blocking operations |
| Load balancing | High | High | High traffic |
| Database read replicas | High | High | Read-heavy workloads |

### Asset Optimization

| Asset Type | Techniques |
|------------|------------|
| Images | Compression, WebP/AVIF, responsive images, lazy loading |
| Fonts | Subsetting, WOFF2, font-display: swap |
| JavaScript | Minification, code splitting, tree shaking |
| CSS | Minification, critical CSS, unused CSS removal |
| Video | Compression, adaptive streaming, poster images |

---

## Measurement Tools

<!-- AI: Tools for measuring performance by platform -->

### Web Applications

| Tool | Type | Use For |
|------|------|---------|
| Lighthouse | Audit | Overall performance score |
| Chrome DevTools | Profiling | Detailed analysis |
| WebPageTest | Testing | Real-world conditions |
| Core Web Vitals | Monitoring | Field data from users |
| SpeedCurve | Monitoring | Continuous tracking |

### Desktop Applications

| Tool | Platform | Use For |
|------|----------|---------|
| Activity Monitor | macOS | Memory, CPU |
| Task Manager | Windows | Memory, CPU |
| Instruments | macOS | Deep profiling |
| Windows Performance Analyzer | Windows | Deep profiling |
| Chrome DevTools | Electron/Tauri | Web view profiling |

### Mobile Applications

| Tool | Platform | Use For |
|------|----------|---------|
| Xcode Instruments | iOS | CPU, Memory, Energy |
| Android Studio Profiler | Android | CPU, Memory, Network |
| Firebase Performance | Cross-platform | Real user metrics |
| Flipper | React Native | Network, layout |

### Backend/API

| Tool | Type | Use For |
|------|------|---------|
| APM (DataDog, New Relic) | Monitoring | End-to-end tracing |
| pprof | Profiling | Go applications |
| perf | Profiling | Linux systems |
| Clinic.js | Profiling | Node.js |
| EXPLAIN | Query analysis | Database queries |

---

## Performance by Platform

<!-- AI: Platform-specific performance considerations -->

### Web SPA

**Key Metrics**: Core Web Vitals (LCP, FID, CLS)

**Common Issues**:
- Large JavaScript bundles
- Hydration blocking interactivity
- Layout shifts from async content
- Third-party script impact

**Optimization Focus**:
- Code splitting and lazy loading
- Server-side rendering / streaming
- Efficient state management
- Asset optimization

### Web SSR

**Key Metrics**: TTFB, FCP, LCP

**Common Issues**:
- Server response time
- Hydration mismatch
- Blocking data fetches
- Cache invalidation

**Optimization Focus**:
- Response streaming
- Incremental static regeneration
- Edge caching
- Efficient data fetching

### Desktop Applications

**Key Metrics**: Startup time, memory, CPU

**Common Issues**:
- Slow startup
- Memory leaks
- Background CPU usage
- Large install size

**Optimization Focus**:
- Lazy feature loading
- Memory management
- Efficient IPC
- Asset bundling

### Mobile Applications

**Key Metrics**: Startup time, memory, battery

**Common Issues**:
- App size affecting install rates
- Background battery drain
- Memory pressure crashes
- Slow animations

**Optimization Focus**:
- App thinning / on-demand resources
- Background task optimization
- Memory footprint reduction
- 60fps animations

### Backend APIs

**Key Metrics**: Response time, throughput, error rate

**Common Issues**:
- Slow database queries
- N+1 query problems
- Missing indexes
- Resource exhaustion

**Optimization Focus**:
- Query optimization
- Caching strategy
- Connection management
- Horizontal scaling

---

## Monitoring and Alerting

<!-- AI: Ongoing performance monitoring -->

### Metrics to Track

**Real User Monitoring (RUM)**:
- Page load times by geography
- Core Web Vitals percentiles
- Custom timing marks
- Error rates correlated with performance

**Synthetic Monitoring**:
- Scheduled performance tests
- Consistent baseline measurement
- Regression detection

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| [Metric 1] | [Value] | [Value] | [Response] |
| [Metric 2] | [Value] | [Value] | [Response] |
| [Metric 3] | [Value] | [Value] | [Response] |

### Performance Review Cadence

| Review | Frequency | Focus |
|--------|-----------|-------|
| Dashboard check | Daily | Anomalies, trends |
| Performance review | Weekly | Week-over-week changes |
| Deep dive | Monthly | Root cause analysis |
| Budget review | Quarterly | Adjust targets |

---

## Implementation Checklist

<!-- AI: Pre-launch performance checklist -->

### Before Launch
- [ ] Performance budgets defined
- [ ] Key metrics identified
- [ ] Monitoring in place
- [ ] Baseline measured
- [ ] Performance tests in CI

### Optimization
- [ ] Assets optimized (images, fonts, code)
- [ ] Caching strategy implemented
- [ ] Critical path optimized
- [ ] Load testing completed

### Monitoring
- [ ] RUM implemented
- [ ] Alerts configured
- [ ] Dashboard created
- [ ] Review process established

---

## Related Documents

<!-- AI: Link to related documents. Ensure bidirectional linking. -->

| Document | Relationship |
|----------|--------------|
| [07 - Technical Architecture](./07-technical-architecture.md) | Architecture decisions affecting performance |
| [21 - Monitoring & Observability](./21-monitoring-observability.md) | Performance monitoring setup |
| [12 - Testing Strategy](./12-testing-strategy.md) | Performance testing approach |
| [19 - CI/CD Pipeline](./19-cicd-pipeline.md) | Performance budget enforcement |

---

## AI Agent Instructions

<!-- AI: Instructions for AI agents working with this document -->

### When Populating This Document

1. **Identify application type**: Web, desktop, mobile, backend - metrics differ
2. **Set realistic targets**: Use industry benchmarks as starting point
3. **Prioritize metrics**: Not all metrics matter equally for every app
4. **Define budgets**: Size and time budgets that can be enforced
5. **Choose measurement tools**: Select tools appropriate for the platform

### When Implementing Performance

1. **Measure first**: Profile before optimizing
2. **Focus on critical path**: Optimize what users experience most
3. **Set budgets in CI**: Automate performance regression prevention
4. **Monitor continuously**: Set up dashboards and alerts
5. **Review regularly**: Performance degrades without attention

### Common Mistakes to Avoid

- **Premature optimization**: Optimizing without profiling data
- **Wrong metrics**: Focusing on metrics that don't affect users
- **One-time effort**: Not monitoring performance over time
- **Developer-only testing**: Testing on fast machines/networks
- **Ignoring third parties**: Analytics, ads, etc. affect performance
- **Missing budgets**: No enforcement allows performance regression

### Quality Checklist

Before marking this document complete:
- [ ] Key metrics identified for application type
- [ ] Realistic targets set with benchmarks
- [ ] Performance budgets defined
- [ ] Measurement tools selected
- [ ] Optimization strategies documented
- [ ] Monitoring and alerting planned
- [ ] Related Documents links are bidirectional
