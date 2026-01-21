# 22 - Release Management

<!-- AI: This document defines how versions are numbered, releases are cut, and users are informed. Consistent release management ensures predictable delivery. Applicable to all distributed applications and libraries. -->

## Release Philosophy

<!-- AI: Establish release principles for the project:

**Key Questions**:
- How often should releases happen?
- What's the process for emergency fixes?
- Who can approve and trigger releases?
- How are users notified of updates?

**Release Strategies**:
- **Continuous**: Ship on every merge to main
- **Scheduled**: Regular release cadence (weekly, monthly)
- **Feature-based**: Ship when features are ready
- **Milestone-based**: Ship at project milestones
-->

**Philosophy**: [Describe the release approach for this project]

**Principles**:
1. [First principle, e.g., "All releases are tagged in git"]
2. [Second principle, e.g., "Breaking changes require major version bump"]
3. [Third principle, e.g., "Every release has release notes"]

---

## Versioning

<!-- AI: How versions are numbered -->

### Version Scheme

<!-- AI: Semantic Versioning (semver) is recommended for most projects.

**Semantic Versioning (X.Y.Z)**:
- X (Major): Breaking changes
- Y (Minor): New features, backward compatible
- Z (Patch): Bug fixes, backward compatible

**Calendar Versioning (CalVer)**:
- YYYY.MM.DD or YYYY.MM.MICRO
- Good for regular release cadences

**Other Schemes**:
- Build numbers (simple incrementing)
- Git-based (hash or tag count)
-->

| Scheme | Format | Example |
|--------|--------|---------|
| [Semantic Versioning / CalVer / Custom] | [MAJOR.MINOR.PATCH / YYYY.MM.DD / Custom] | [1.2.3 / 2024.01.15 / v1-beta] |

### Version Increment Rules

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking changes | MAJOR | Removed feature, changed API |
| New features (backward compatible) | MINOR | Added feature, new option |
| Bug fixes | PATCH | Fixed crash, corrected behavior |
| Pre-release | Suffix | 1.2.3-beta.1, 1.2.3-rc.1 |

### Version Location

<!-- AI: Where is the version number stored/updated? -->

| Location | Update Method |
|----------|---------------|
| package.json / Cargo.toml / etc. | [Manual / Automated on release] |
| App UI (About screen) | [Read from package / Hardcoded] |
| User-Agent / API headers | [Injected at build time] |

---

## Changelog

<!-- AI: How changes are communicated -->

### Changelog Format

<!-- AI: Keep a Changelog format (keepachangelog.com) is recommended -->

**Location**: `CHANGELOG.md`

**Format**:
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- [New features]

### Changed
- [Changes to existing features]

### Fixed
- [Bug fixes]

### Removed
- [Removed features]

### Deprecated
- [Features to be removed in future]

### Security
- [Security fixes]

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release
```

### Changelog Maintenance

| Approach | When | Notes |
|----------|------|-------|
| Updated with each PR | Recommended | Changes documented as made |
| Updated before release | Alternative | Batch changelog updates |
| Auto-generated from commits | Requires discipline | Needs conventional commits |

### Commit Message Convention

<!-- AI: If using auto-generated changelogs, commit format matters -->

| Type | Changelog Section | Example |
|------|-------------------|---------|
| feat: | Added | `feat: add dark mode toggle` |
| fix: | Fixed | `fix: resolve crash on startup` |
| docs: | [Not included] | `docs: update README` |
| chore: | [Not included] | `chore: update dependencies` |
| perf: | Changed | `perf: improve loading time` |
| refactor: | [Not included] | `refactor: simplify auth logic` |
| BREAKING CHANGE: | Added (major bump) | `feat!: change API response format` |

---

## Release Process

<!-- AI: Steps to create a release -->

### Release Checklist

#### Pre-Release

- [ ] All planned features complete
- [ ] All tests passing on main
- [ ] No critical/high bugs in milestone
- [ ] Changelog updated
- [ ] Version number bumped
- [ ] Documentation updated (if applicable)
- [ ] Security audit passed (for major releases)
- [ ] Performance regression check passed

#### Release

- [ ] Create release branch/tag
- [ ] Build release artifacts
- [ ] Sign artifacts (if applicable)
- [ ] Run smoke tests on built artifacts
- [ ] Upload to distribution channels
- [ ] Create GitHub/GitLab release

#### Post-Release

- [ ] Verify distribution channels have new version
- [ ] Monitor error reports for new issues
- [ ] Announce release (if applicable)
- [ ] Update roadmap/planning docs
- [ ] Close milestone

### Release Triggers

<!-- AI: What initiates a release? -->

| Trigger | Release Type |
|---------|--------------|
| Git tag push (vX.Y.Z) | Automatic production release |
| Manual workflow dispatch | On-demand release |
| Merge to release branch | Automatic staging release |
| Scheduled (cron) | [Not used / Weekly / etc.] |

### Release Approval

| Release Type | Approval Required | Approvers |
|--------------|-------------------|-----------|
| Patch | [None / Single reviewer] | [Who] |
| Minor | [None / Single reviewer] | [Who] |
| Major | [Required] | [Who] |
| Hotfix | [Fast-track / Post-release review] | [Who] |

---

## Distribution Channels

<!-- AI: Where users get the software -->

### Release Channels

| Channel | Audience | Update Frequency | Stability |
|---------|----------|------------------|-----------|
| Stable | All users | On release | Stable |
| Beta | Opt-in testers | Pre-release versions | Testing |
| Nightly | Developers | Every merge to main | Unstable |

### Distribution Platforms

<!-- AI: Platform-specific distribution methods -->

| Platform | Distribution Method |
|----------|---------------------|
| Windows | [MSI / EXE / Microsoft Store / Chocolatey / Direct download] |
| macOS | [DMG / App Store / Homebrew / Direct download] |
| Linux | [AppImage / deb / rpm / Snap / Flatpak / AUR] |
| Web | [Automatic / CDN] |
| npm/crates/pip | [Package registry publish] |
| Docker | [Docker Hub / GitHub Container Registry] |

---

## Update Mechanism

<!-- AI: How users receive updates -->

### Auto-Updates

| Aspect | Decision |
|--------|----------|
| Auto-update enabled | [Yes / No / User opt-in] |
| Update check frequency | [On launch / Daily / Weekly / Manual only] |
| Update mechanism | [Built-in updater / System package manager / Manual] |
| Silent vs. prompted | [Silent / Prompt before download / Prompt before install] |
| Rollback capability | [Yes / No] |

### Update Notification

- [ ] In-app notification
- [ ] System notification
- [ ] Email to registered users
- [ ] Social media / blog post
- [ ] None (silent updates)

### Update Considerations

**User Experience**:
- Don't interrupt active work
- Allow deferring updates
- Show what's new after update
- Provide rollback option if possible

**Technical**:
- Handle update during first run after download
- Support incremental updates (deltas) if possible
- Verify downloaded update integrity
- Handle failed updates gracefully

---

## Rollback Procedure

<!-- AI: Reverting a problematic release -->

### When to Rollback

- Critical bug affecting >X% of users
- Security vulnerability discovered
- Data corruption risk
- Major functionality broken
- Performance regression unacceptable

### Rollback Decision Matrix

| Issue Severity | User Impact | Action |
|----------------|-------------|--------|
| Critical | Wide | Immediate rollback |
| Critical | Limited | Hotfix preferred, rollback if needed |
| High | Wide | Hotfix within 24h or rollback |
| High | Limited | Hotfix in next release |
| Medium/Low | Any | Fix in next regular release |

### Rollback Process

1. **Identify**: Confirm the issue and scope
2. **Decide**: Rollback vs. hotfix forward
3. **Communicate**: Alert team and stakeholders
4. **Execute**: Revert to previous tag/release
5. **Distribute**: Publish previous version to all channels
6. **Monitor**: Verify issue is resolved
7. **Document**: Post-mortem and update process if needed

---

## Release Communication

<!-- AI: How releases are announced -->

### Announcement Channels

- [ ] GitHub/GitLab Releases page
- [ ] Project website/blog
- [ ] Email newsletter
- [ ] Social media (Twitter, etc.)
- [ ] Discord / Slack community
- [ ] In-app notification

### Release Notes Template

```markdown
# [PROJECT_NAME] vX.Y.Z

## Highlights
[1-3 sentence summary of most important changes]

## What's New
- [Feature 1]
- [Feature 2]

## Bug Fixes
- [Fix 1]
- [Fix 2]

## Breaking Changes
- [If any - be specific about migration]

## Upgrade Notes
[Special instructions if needed]

## Contributors
[Thank contributors if applicable]
```

### Announcement Timing

| Release Type | Announcement |
|--------------|--------------|
| Major | Blog post + all channels |
| Minor | Release notes + key channels |
| Patch | Release notes only |
| Hotfix | Release notes + notify affected users |

---

## Related Documents

<!-- AI: Link to related documents. Ensure bidirectional linking. -->

| Document | Relationship |
|----------|--------------|
| [19 - CI/CD Pipeline](./19-cicd-pipeline.md) | Release automation |
| [12 - Testing Strategy](./12-testing-strategy.md) | Pre-release testing |
| [20 - Documentation Strategy](./20-documentation-strategy.md) | User docs updates |
| [21 - Monitoring & Observability](./21-monitoring-observability.md) | Post-release monitoring |

---

## AI Agent Instructions

<!-- AI: Instructions for AI agents working with this document -->

### When Populating This Document

1. **Choose versioning scheme**: SemVer for most projects
2. **Define release cadence**: Based on project needs
3. **Plan distribution**: Where will users get updates?
4. **Document rollback**: Always have a plan to revert
5. **Reference CI/CD doc**: Releases should be automated

### When Preparing Releases

1. **Verify tests pass**: Never release with failing tests
2. **Update changelog**: Document user-facing changes
3. **Bump version**: According to change type
4. **Create tag**: Use consistent tag format
5. **Monitor after release**: Watch for new errors

### Common Mistakes to Avoid

- **Manual releases**: Automate everything possible
- **Missing changelog**: Users need to know what changed
- **Untested artifacts**: Test built artifacts, not just code
- **No rollback plan**: Always have a way back
- **Silent failures**: Monitor releases closely
- **Inconsistent versions**: Version should be in one place

### Quality Checklist

Before marking this document complete:
- [ ] Version scheme chosen
- [ ] Changelog format defined
- [ ] Release process documented
- [ ] Distribution channels listed
- [ ] Update mechanism planned
- [ ] Rollback procedure documented
- [ ] Communication plan established
- [ ] Related Documents links are bidirectional
