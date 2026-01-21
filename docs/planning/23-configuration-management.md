# 23 - Configuration Management

<!-- AI: This document defines how application settings, feature flags, and user preferences are managed. Good configuration management enables flexibility and maintainability. Applicable to all project types. -->

## Configuration Philosophy

<!-- AI: Establish configuration principles for the project:

**Key Questions**:
- What should be configurable vs. hardcoded?
- Where does configuration live?
- How do users change settings?
- How does configuration differ between environments?

**Common Approaches**:
- **Convention over configuration**: Sensible defaults, minimal config
- **Highly configurable**: Many options for customization
- **Environment-driven**: Config varies by environment
- **User-driven**: Users customize their experience
-->

**Philosophy**: [Describe the configuration approach for this project]

**Principles**:
1. [First principle, e.g., "App should work without any configuration"]
2. [Second principle, e.g., "Secrets never in config files"]
3. [Third principle, e.g., "Validate config at startup"]

---

## Configuration Categories

<!-- AI: Different types of configuration -->

### Environment Configuration

<!-- AI: Settings that change between environments (dev/staging/prod) -->

| Setting | Development | Staging | Production |
|---------|-------------|---------|------------|
| API endpoint | [localhost:3000] | [staging.api.com] | [api.com] |
| Debug logging | [Enabled] | [Enabled] | [Disabled] |
| Error reporting | [Disabled] | [Enabled] | [Enabled] |
| Feature flags | [All enabled] | [Selected] | [Stable only] |
| [Add project-specific] | | | |

### Application Defaults

<!-- AI: Settings with sensible defaults that users might change -->

| Setting | Default | Options/Range | Notes |
|---------|---------|---------------|-------|
| Theme | [System] | System, Light, Dark | Follows OS preference |
| Language | [System locale] | [Supported locales] | Auto-detect or manual |
| [Add project-specific] | | | |

### User Preferences

<!-- AI: Settings that are purely user preference, stored locally -->

| Setting | Storage | Synced? | Notes |
|---------|---------|---------|-------|
| Window size/position | Local only | No | Per-device |
| Recent files/projects | Local only | No | Per-device |
| UI preferences | [Local / Cloud] | [Yes / No] | [Notes] |
| [Add project-specific] | | | |

---

## Configuration Storage

<!-- AI: Where configuration is stored -->

### Storage Locations

| Config Type | Location | Format |
|-------------|----------|--------|
| Environment vars | .env file / System env / CI secrets | KEY=value |
| App defaults | Config file / Hardcoded | JSON / YAML / TOML |
| User preferences | OS config dir / App data dir / LocalStorage | JSON |
| Secrets | Keychain / Credential Manager / Environment | Encrypted |

### Configuration File Locations

<!-- AI: Platform-specific paths -->

| Platform | Config Path |
|----------|-------------|
| Windows | `%APPDATA%\[PROJECT_NAME]\config.json` |
| macOS | `~/Library/Application Support/[PROJECT_NAME]/config.json` |
| Linux | `~/.config/[PROJECT_NAME]/config.json` |
| Web (browser) | LocalStorage / IndexedDB |

### Configuration Precedence

<!-- AI: Order of priority when settings are defined in multiple places -->

**Priority (highest to lowest)**:
1. Command-line arguments
2. Environment variables
3. User config file
4. Project config file
5. System config file
6. Built-in defaults

---

## Feature Flags

<!-- AI: How features are toggled on/off -->

### Feature Flag Strategy

| Aspect | Decision |
|--------|----------|
| Feature flag system | [Built-in / LaunchDarkly / Unleash / Flagsmith / None] |
| Flag storage | [Environment vars / Remote config / Hardcoded] |
| Per-user flags | [Supported / Not supported] |
| A/B testing | [Supported / Not supported] |

### Feature Flag Types

| Type | Use Case | Example |
|------|----------|---------|
| Release | Gate unfinished features | `ENABLE_NEW_EDITOR` |
| Ops | Control operational behavior | `ENABLE_DEBUG_LOGGING` |
| Experiment | A/B testing | `VARIANT_CHECKOUT_FLOW` |
| Permission | Feature access control | `ENABLE_ADMIN_TOOLS` |

### Current Feature Flags

<!-- AI: Document all feature flags in use -->

| Flag | Description | Default | Environments |
|------|-------------|---------|--------------|
| [ENABLE_FEATURE_X] | [What it does] | false | All |
| [ENABLE_DEBUG_PANEL] | Shows debug info | false | Dev only |
| [Add project-specific] | | | |

### Feature Flag Lifecycle

1. **Introduction**: Add flag with default OFF
2. **Development**: Enable for developers
3. **Testing**: Enable in staging
4. **Rollout**: Enable for percentage of users
5. **Graduation**: Remove flag, feature becomes permanent
6. **Cleanup**: Remove flag code after 100% rollout

---

## Configuration Validation

<!-- AI: How configuration is validated -->

### Validation Rules

| Setting | Validation | On Failure |
|---------|------------|------------|
| API endpoint | Valid URL | Error + fallback / Fatal |
| Theme | Enum match | Default to system |
| Numeric settings | Range check | Clamp to valid range |
| File paths | Exists check | Error message |
| [Add project-specific] | | |

### Invalid Configuration Handling

| Severity | Behavior |
|----------|----------|
| Missing optional | Use default |
| Missing required | Error message + exit / Prompt user |
| Invalid value | Use default + log warning |
| Corrupted file | Reset to defaults + backup corrupt file |

### Validation Timing

- [ ] At startup (before app loads)
- [ ] When config changes
- [ ] Lazy (when setting is first used)

---

## Configuration Migration

<!-- AI: Handling config format changes between versions -->

### Version Compatibility

| Scenario | Strategy |
|----------|----------|
| New setting added | Use default for existing users |
| Setting renamed | Migrate old to new, remove old |
| Setting removed | Ignore old setting, clean up |
| Format changed | Run migration on first load of new version |
| Type changed | Convert if possible, else default |

### Migration Implementation

**Config Version Tracking**:
- Store version in config: `{ "version": 2, ... }`
- Migration functions run in sequence: v1 -> v2 -> v3
- Backup config before migration

**Migration Example**:
```
// Pseudocode
function migrate(config):
  while config.version < CURRENT_VERSION:
    migrations[config.version](config)
    config.version++
  return config
```

---

## Secrets Management

<!-- AI: How sensitive configuration is handled -->

### Secret Types

| Secret | Storage | Access |
|--------|---------|--------|
| API keys (user-provided) | OS Keychain / Encrypted config | On-demand |
| Auth tokens | Memory / Secure storage | Session only |
| Encryption keys | OS Keychain | On-demand |
| [Add project-specific] | | |

### Secret Storage by Platform

| Platform | Recommended Storage |
|----------|---------------------|
| Windows | Credential Manager / DPAPI |
| macOS | Keychain |
| Linux | libsecret / gnome-keyring / KWallet |
| Web | Not recommended (use backend) |
| CI/CD | Platform secrets (GitHub Secrets, etc.) |

### Security Requirements

<!-- AI: Reference doc 11 for full security details -->

- [ ] Secrets never logged
- [ ] Secrets never in config files (use secure storage)
- [ ] Secrets cleared from memory when not needed
- [ ] Secrets not included in error reports
- [ ] Secrets not committed to git

---

## Settings UI

<!-- AI: User-facing configuration interface -->

### Exposed Settings

| Setting | Location in UI | User Skill Level |
|---------|----------------|------------------|
| Theme | Settings > Appearance | All users |
| Language | Settings > General | All users |
| [Advanced setting] | Settings > Advanced | Power users |
| [Developer setting] | Hidden / Dev tools | Developers |

### Hidden Settings

| Setting | How to Access | Reason Hidden |
|---------|---------------|---------------|
| Debug logging | Environment variable | Developer only |
| Experimental features | Feature flag | Not ready for users |
| Performance tuning | Config file | Advanced users only |

### Settings UI Patterns

**Good Practices**:
- Group related settings
- Provide sensible defaults
- Show what values mean (not just options)
- Allow reset to defaults
- Validate input immediately
- Save automatically or prompt to save

**Accessibility**:
- All settings keyboard accessible
- Settings announced by screen readers
- Respect system accessibility settings

---

## Environment Variable Reference

<!-- AI: Complete list of environment variables -->

### Required Variables

<!-- AI: Must be set for app to function -->

| Variable | Description | Example |
|----------|-------------|---------|
| [Add project-specific required vars] | | |

### Optional Variables

<!-- AI: Customize behavior but have defaults -->

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` / `APP_ENV` | Environment name | development |
| `LOG_LEVEL` | Logging verbosity | info |
| `DEBUG` | Enable debug mode | false |
| [Add project-specific] | | |

### Environment File Template

**`.env.example`** (committed to repo):
```bash
# Required
# API_KEY=your-api-key

# Optional
LOG_LEVEL=info
DEBUG=false
```

---

## Related Documents

<!-- AI: Link to related documents. Ensure bidirectional linking. -->

| Document | Relationship |
|----------|--------------|
| [07 - Technical Architecture](./07-technical-architecture.md) | Architecture decisions affecting config |
| [08 - Data Models](./08-data-models.md) | Preference data models |
| [11 - Security Considerations](./11-security-considerations.md) | Secret management |
| [10 - Error Handling](./10-error-handling.md) | Config validation errors |
| [19 - CI/CD Pipeline](./19-cicd-pipeline.md) | Environment-specific configuration |

---

## AI Agent Instructions

<!-- AI: Instructions for AI agents working with this document -->

### When Populating This Document

1. **Identify configuration needs**: What should be configurable?
2. **Choose storage for each type**: Env vars, files, secrets, etc.
3. **Define validation**: How is each setting validated?
4. **Plan for migration**: How will config evolve?
5. **Reference security doc**: Understand secret handling requirements

### When Implementing Configuration

1. **Provide sensible defaults**: App should work without config
2. **Validate early**: Check config at startup
3. **Use appropriate storage**: Secrets in secure storage, not files
4. **Document all settings**: This doc should list everything
5. **Handle migration**: Version your config format

### Common Mistakes to Avoid

- **Hardcoded secrets**: Always use environment variables or secure storage
- **No defaults**: App fails without config instead of using defaults
- **Late validation**: Config error discovered deep in app instead of at startup
- **No migration**: Breaking users when config format changes
- **Over-configuration**: Too many settings confuse users
- **Hidden required config**: Required settings that aren't documented

### Quality Checklist

Before marking this document complete:
- [ ] Configuration categories defined
- [ ] Storage locations specified per category
- [ ] Feature flag strategy documented
- [ ] Validation rules defined
- [ ] Migration strategy documented
- [ ] Secret handling documented
- [ ] Environment variables listed
- [ ] Related Documents links are bidirectional
