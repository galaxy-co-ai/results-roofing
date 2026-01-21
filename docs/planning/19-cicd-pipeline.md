# 19 - CI/CD Pipeline

<!-- AI: This document defines the continuous integration and deployment strategy. CI/CD automates building, testing, and releasing the application. Applicable to all project types. -->

## CI/CD Philosophy

<!-- AI: Establish CI/CD principles for the project:

**Key Questions**:
- How fast should the feedback loop be?
- What must pass before merging?
- How automated should releases be?
- What's the deployment strategy?

**Common Approaches**:
- **Trunk-based**: Frequent small commits to main, feature flags
- **Git Flow**: Feature branches, release branches, hotfixes
- **GitHub Flow**: Feature branches, deploy on merge to main
- **Ship every commit**: Fully automated deployment
-->

**Philosophy**: [Describe the CI/CD approach for this project]

**Principles**:
1. [First principle, e.g., "Every commit is tested before merge"]
2. [Second principle, e.g., "Main branch is always deployable"]
3. [Third principle, e.g., "Failures block releases"]

---

## CI Platform Selection

<!-- AI: Choose and document the CI/CD platform -->

### Platform Comparison

<!-- AI: Compare common CI platforms:

**GitHub Actions**:
- Best for: GitHub-hosted projects
- Pros: Native GitHub integration, large marketplace, YAML config
- Cons: Limited minutes on free tier, learning curve for complex workflows
- Cost: Free for public repos, limited minutes for private

**GitLab CI**:
- Best for: GitLab-hosted projects, self-hosted needs
- Pros: Built into GitLab, powerful, self-hosted option
- Cons: Steeper learning curve, separate from code if not using GitLab
- Cost: Generous free tier, unlimited minutes on self-hosted

**CircleCI**:
- Best for: Complex build requirements, performance
- Pros: Fast, powerful caching, good Docker support
- Cons: Configuration complexity, cost at scale
- Cost: Free tier limited, per-credit pricing

**Azure DevOps**:
- Best for: Microsoft ecosystem, enterprise
- Pros: Full DevOps suite, good for .NET
- Cons: Complex, heavy for small projects
- Cost: Free tier, per-user pricing

**Jenkins**:
- Best for: Self-hosted, maximum control
- Pros: Extremely flexible, plugins for everything
- Cons: Maintenance burden, dated UI
- Cost: Free (self-hosted infrastructure costs)
-->

### Chosen Platform

**Platform**: [CI platform name]

**Rationale**: [Why this platform was chosen]

**Configuration Location**: [e.g., `.github/workflows/` for GitHub Actions]

---

## Build Pipeline

<!-- AI: Define the build process -->

### Trigger Events

<!-- AI: Define when pipelines run -->

| Event | Pipeline | Actions |
|-------|----------|---------|
| Push to main | CI + Deploy | Build, test, deploy to staging |
| Pull request | CI | Build, test, report status |
| Tag creation | Release | Build, test, create release artifacts |
| Schedule | Maintenance | Dependency audit, security scan |
| Manual | Deploy | Deploy to specified environment |

### Pipeline Stages

<!-- AI: Define the stages of your pipeline -->

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Lint    │ → │  Build   │ → │  Test    │ → │ Package  │ → │ Deploy   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

**Stage Details**:

| Stage | Purpose | Failure Action |
|-------|---------|----------------|
| Lint | Code quality checks | Block merge |
| Build | Compile/bundle | Block merge |
| Test | Run test suites | Block merge |
| Package | Create artifacts | Block release |
| Deploy | Release to environment | Rollback |

### Build Steps

<!-- AI: Document specific build steps. Adjust based on tech stack.

**Common Steps**:
1. Checkout code
2. Setup runtime (Node, Go, Rust, etc.)
3. Cache dependencies
4. Install dependencies
5. Run linting
6. Run type checking (if applicable)
7. Run tests
8. Build application
9. Upload artifacts
-->

**Example Pipeline (Generic)**:
```yaml
# Conceptual - adapt to your CI platform
steps:
  - checkout
  - setup-runtime: [language/version]
  - restore-cache: dependencies
  - install-dependencies
  - lint
  - type-check  # if applicable
  - test
  - build
  - save-cache: dependencies
  - upload-artifacts
```

---

## Build Matrix

<!-- AI: Define multi-platform and multi-version builds -->

### Cross-Platform Builds

<!-- AI: Document target platforms and their build requirements -->

| Platform | Runner | Build Command | Artifacts |
|----------|--------|---------------|-----------|
| Linux | ubuntu-latest | [Command] | [Output files] |
| macOS | macos-latest | [Command] | [Output files] |
| Windows | windows-latest | [Command] | [Output files] |

### Version Matrix

<!-- AI: For projects supporting multiple runtime versions -->

| Runtime | Versions Tested | Primary |
|---------|-----------------|---------|
| [Language] | [List versions] | [Default version] |
| [OS] | [List versions] | [Default version] |

### Matrix Strategy

<!-- AI: Configure matrix builds

**Options**:
- **Full matrix**: All combinations (slow, thorough)
- **Sparse matrix**: Representative combinations (faster)
- **Fail-fast**: Stop all on first failure (fast feedback)
- **Continue-on-error**: Complete all regardless (full picture)
-->

**Strategy**: [Full / Sparse / Fail-fast]

**Matrix Configuration**:
| Axis 1 | Axis 2 | Notes |
|--------|--------|-------|
| [Value] | [Value] | [Primary configuration] |
| [Value] | [Value] | [Secondary] |

---

## Test Automation

<!-- AI: How tests run in the pipeline -->

### Test Stages

| Stage | Tests | Timeout | Required |
|-------|-------|---------|----------|
| Unit | Fast, isolated tests | [X] min | Yes |
| Integration | Component interaction tests | [X] min | Yes |
| E2E | Full user flows | [X] min | [Yes/No] |
| Performance | Load/performance tests | [X] min | [Yes/No] |

### Coverage Requirements

**Minimum Coverage**: [X]%

**Coverage Tool**: [Tool name, e.g., Codecov, Coveralls, built-in]

**Coverage Enforcement**:
- [ ] PR blocked if coverage drops below threshold
- [ ] Coverage report posted to PR
- [ ] Coverage badge on README

### Test Parallelization

<!-- AI: How tests are parallelized for speed -->

**Strategy**: [How tests are split and parallelized]

- Unit tests: [Parallel/Sequential]
- Integration tests: [Parallel/Sequential]
- E2E tests: [Sharded across runners / Sequential]

---

## Release Process

<!-- AI: How releases are created and published -->

### Versioning Strategy

<!-- AI: Define version numbering approach

**Semantic Versioning (recommended)**:
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

**CalVer** (Calendar Versioning):
- Format: YYYY.MM.DD or YYYY.MM.MICRO
- Best for: Regular release cadences

**Other Schemes**:
- Build numbers (simple incrementing)
- Git commit hash (for development builds)
-->

**Scheme**: [Semantic Versioning / CalVer / Other]

**Format**: [X.Y.Z / YYYY.MM.DD / etc.]

**Pre-release Tags**: [alpha, beta, rc, etc.]

### Release Channels

| Channel | Source | Stability | Audience |
|---------|--------|-----------|----------|
| Dev/Nightly | main branch | Unstable | Developers |
| Beta | beta branch or tags | Testing | Early adopters |
| Stable | release tags | Stable | General users |

### Release Workflow

<!-- AI: Document the release process

**Automated Release Flow**:
1. Tag pushed (e.g., v1.2.3)
2. CI detects tag, triggers release workflow
3. Build for all platforms
4. Run full test suite
5. Create release notes
6. Publish artifacts
7. Notify stakeholders
-->

**Release Trigger**: [Tag push / Manual / Scheduled]

**Release Steps**:
1. [Version validation]
2. [Build all platforms]
3. [Run tests]
4. [Generate changelog]
5. [Create release]
6. [Upload artifacts]
7. [Notify]

### Release Artifacts

<!-- AI: What gets published on release -->

| Platform | Artifact | Location | Notes |
|----------|----------|----------|-------|
| [Platform] | [File type] | [Registry/location] | [Notes] |
| All | Source code | GitHub/GitLab | Auto-generated |
| All | Changelog | Release notes | [Auto/Manual] |

### Release Checklist

<!-- AI: Pre-release verification -->

- [ ] All tests passing on main
- [ ] No blocking issues in milestone
- [ ] Changelog updated
- [ ] Version bumped in code
- [ ] Release notes drafted
- [ ] Security vulnerabilities addressed
- [ ] Documentation updated
- [ ] Breaking changes documented

---

## Environment Strategy

<!-- AI: Define deployment environments -->

### Environments

| Environment | Purpose | Deployed From | URL |
|-------------|---------|---------------|-----|
| Development | Local dev | N/A | localhost |
| CI | Testing | PR/Push | N/A |
| Staging | Pre-production testing | main | [URL] |
| Production | Live users | Release tags | [URL] |

### Environment Promotion

```
Development → CI (automated) → Staging (automated) → Production (manual/gated)
```

**Promotion Rules**:
| From | To | Trigger | Gate |
|------|------|---------|------|
| Dev | CI | Push/PR | Automatic |
| CI | Staging | Merge to main | Tests pass |
| Staging | Production | Release | Manual approval |

### Environment-Specific Configuration

<!-- AI: How configuration differs by environment -->

| Setting | Development | Staging | Production |
|---------|-------------|---------|------------|
| Debug mode | On | On | Off |
| Logging level | Debug | Info | Warn |
| API endpoint | localhost | staging.example.com | api.example.com |
| Feature flags | All on | Selected | Controlled |

---

## Secret Management

<!-- AI: How secrets are handled in CI/CD -->

### Secret Categories

| Category | Examples | Storage | Rotation |
|----------|----------|---------|----------|
| API keys | Third-party services | CI secrets | [Frequency] |
| Deploy keys | SSH keys for deployment | CI secrets | [Frequency] |
| Signing keys | Code signing certificates | CI secrets | [Frequency] |
| Cloud credentials | AWS/GCP/Azure keys | CI secrets | [Frequency] |

### Secret Storage

<!-- AI: Where secrets are stored

**Platform Options**:
- **GitHub Secrets**: Encrypted, org/repo level, easy
- **GitLab CI Variables**: Built-in, file or variable type
- **HashiCorp Vault**: Enterprise-grade, dynamic secrets
- **AWS Secrets Manager**: Good for AWS deployments
- **1Password / Doppler**: Team-friendly secret management
-->

**Primary Storage**: [CI secrets / Vault / Cloud provider]

**Access Control**:
- Who can view secrets: [Roles]
- Who can modify secrets: [Roles]
- Audit logging: [Yes/No]

### Secret Handling Rules

**Do**:
- Store secrets in CI's secret storage
- Use environment-specific secrets
- Rotate secrets regularly
- Audit secret access

**Don't**:
- Print secrets in logs
- Commit secrets to repository
- Share secrets across environments
- Use production secrets in CI

---

## Caching Strategy

<!-- AI: Caching speeds up builds significantly -->

### Cache Types

| What | Key | Restore Keys | Benefit |
|------|-----|--------------|---------|
| Dependencies | lockfile hash | Previous lockfile hashes | Skip install |
| Build cache | Source hash | Previous source hashes | Incremental build |
| Docker layers | Dockerfile hash | Previous builds | Faster container builds |

### Cache Configuration

**Dependencies Cache**:
```yaml
# Conceptual - adapt to platform
cache:
  key: deps-${{ hashFiles('**/lockfile') }}
  paths:
    - node_modules/      # or vendor/, target/, etc.
  restore-keys:
    - deps-
```

### Cache Invalidation

| Event | Action |
|-------|--------|
| Lockfile change | Cache miss, rebuild |
| CI config change | Consider invalidating |
| Major version upgrade | Manual invalidation |
| Build issues | Manual invalidation |

---

## Security Scanning

<!-- AI: Automated security checks in CI -->

### Scan Types

| Scan | Tool Options | When | Blocking |
|------|--------------|------|----------|
| Dependency audit | npm audit, cargo audit, govulncheck | Every build | [Yes/No] |
| SAST (Static) | Semgrep, CodeQL, SonarQube | PR, nightly | [Yes/No] |
| Secret detection | Gitleaks, truffleHog | Every push | Yes |
| Container scan | Trivy, Snyk | Build images | [Yes/No] |
| License check | FOSSA, license-checker | PR | [Yes/No] |

### Security Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Critical vulnerabilities | 0 | Block release |
| High vulnerabilities | [N] | Block release / Alert |
| Medium vulnerabilities | [N] | Alert |
| Secrets detected | 0 | Block push |

---

## Notifications and Monitoring

<!-- AI: How build status is communicated -->

### Build Notifications

| Event | Channel | Recipients |
|-------|---------|------------|
| Build failure | [Slack/Email/etc.] | PR author, team |
| Deploy success | [Slack/Email/etc.] | Team |
| Deploy failure | [Slack/Email/etc.] | Team, on-call |
| Security alert | [Slack/Email/etc.] | Security team |

### Status Badges

<!-- AI: Badges for README -->

**Recommended Badges**:
- Build status
- Test coverage
- Latest version
- License
- Security status

**Badge Sources**:
- shields.io (generic)
- CI platform badges
- Codecov/Coveralls (coverage)

### Health Monitoring

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Build duration | CI analytics | +50% from baseline |
| Test duration | CI analytics | +30% from baseline |
| Failure rate | CI analytics | >10% of builds |
| Queue time | CI analytics | >5 minutes |

---

## Rollback Strategy

<!-- AI: How to recover from bad deployments -->

### Automatic Rollback

**Trigger Conditions**:
- Health check fails after deploy
- Error rate spikes
- Key metrics degrade

**Rollback Process**:
1. Detect failure (health check/monitoring)
2. Automatically deploy previous version
3. Alert team
4. Preserve logs for investigation

### Manual Rollback

**When Needed**:
- Subtle bugs not caught by health checks
- Feature needs to be reverted
- Security issue discovered

**Rollback Steps**:
1. Identify last good version/commit
2. Trigger deployment of that version
3. Verify rollback successful
4. Communicate to stakeholders
5. Investigate root cause

### Rollback Testing

- [ ] Test rollback procedure quarterly
- [ ] Document rollback commands
- [ ] Ensure rollback doesn't require forward-only migrations

---

## Pipeline Templates by Platform

<!-- AI: Ready-to-adapt CI configurations -->

### GitHub Actions Template

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup [Runtime]
        uses: actions/setup-[runtime]@v4
        with:
          [runtime]-version: '[version]'

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: [cache-path]
          key: deps-${{ hashFiles('[lockfile]') }}

      - name: Install dependencies
        run: [install-command]

      - name: Lint
        run: [lint-command]

      - name: Test
        run: [test-command]

      - name: Build
        run: [build-command]
```

### GitLab CI Template

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build

variables:
  [VARIABLE]: [value]

cache:
  paths:
    - [cache-path]

lint:
  stage: lint
  script:
    - [lint-command]

test:
  stage: test
  script:
    - [test-command]
  coverage: '/Coverage: \d+%/'

build:
  stage: build
  script:
    - [build-command]
  artifacts:
    paths:
      - [output-path]
```

### CircleCI Template

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build:
    docker:
      - image: [base-image]
    steps:
      - checkout
      - restore_cache:
          keys:
            - deps-{{ checksum "[lockfile]" }}
      - run: [install-command]
      - save_cache:
          key: deps-{{ checksum "[lockfile]" }}
          paths:
            - [cache-path]
      - run: [lint-command]
      - run: [test-command]
      - run: [build-command]

workflows:
  build-and-test:
    jobs:
      - build
```

---

## Implementation Checklist

<!-- AI: Setup checklist for CI/CD -->

### Initial Setup
- [ ] CI platform chosen and configured
- [ ] Repository connected to CI
- [ ] Secrets configured
- [ ] Basic pipeline running

### Build Pipeline
- [ ] All build steps defined
- [ ] Caching configured
- [ ] Build matrix set up (if needed)
- [ ] Artifacts uploaded

### Testing
- [ ] Unit tests in pipeline
- [ ] Integration tests in pipeline
- [ ] Coverage reporting configured
- [ ] Test parallelization configured

### Security
- [ ] Dependency scanning enabled
- [ ] Secret detection enabled
- [ ] Security gates defined

### Release
- [ ] Release workflow configured
- [ ] Versioning automated
- [ ] Changelog generation set up
- [ ] Artifact publishing configured

### Monitoring
- [ ] Notifications configured
- [ ] Status badges added
- [ ] Build metrics tracked

---

## Related Documents

<!-- AI: Link to related documents. Ensure bidirectional linking. -->

| Document | Relationship |
|----------|--------------|
| [12 - Testing Strategy](./12-testing-strategy.md) | Test configuration for CI |
| [22 - Release Management](./22-release-management.md) | Release process details |
| [11 - Security Considerations](./11-security-considerations.md) | Security scanning requirements |
| [14 - Performance Goals](./14-performance-goals.md) | Performance budget enforcement |
| [23 - Configuration Management](./23-configuration-management.md) | Environment configuration |

---

## AI Agent Instructions

<!-- AI: Instructions for AI agents working with this document -->

### When Populating This Document

1. **Choose platform based on hosting**: GitHub repo = GitHub Actions, etc.
2. **Start simple**: Basic build/test pipeline, add complexity as needed
3. **Reference test strategy**: Align pipeline stages with doc 12
4. **Consider all platforms**: Multi-platform builds if needed
5. **Security from start**: Include secret detection and dependency scanning

### When Implementing CI/CD

1. **Get basic pipeline working first**: Lint, test, build
2. **Add caching early**: Dramatically speeds up builds
3. **Make failures loud**: Notifications on failure
4. **Keep builds fast**: Target <10 minutes for PR builds
5. **Document secrets**: List what secrets are needed and why

### Common Mistakes to Avoid

- **Slow builds**: Not caching, running unnecessary steps
- **Flaky builds**: Tests pass locally but fail in CI
- **Secret leaks**: Printing secrets in logs, committing secrets
- **Missing gates**: No coverage enforcement, no security scanning
- **Manual releases**: Releases should be automated from tags
- **No rollback plan**: Deploying without ability to roll back

### Quality Checklist

Before marking this document complete:
- [ ] CI platform chosen with rationale
- [ ] Build pipeline stages defined
- [ ] Build matrix documented (if multi-platform)
- [ ] Test stages and coverage requirements set
- [ ] Release workflow documented
- [ ] Secret management approach defined
- [ ] Caching strategy documented
- [ ] Related Documents links are bidirectional
