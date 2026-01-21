# 20 - Documentation Strategy

<!-- AI: This document defines how code, APIs, and user-facing features are documented. Good documentation enables maintainability and user success. Applicable to all project types. -->

## Documentation Philosophy

<!-- AI: Establish documentation principles for the project:

**Key Questions**:
- Who are the documentation audiences (developers, users, operators)?
- What level of detail is appropriate for each?
- How is documentation kept in sync with code?
- Where does documentation live?

**Common Approaches**:
- **Code as documentation**: Self-documenting code, minimal comments
- **Docs alongside code**: README in each directory, inline docs
- **Separate docs site**: Comprehensive external documentation
- **Living documentation**: Auto-generated from code/tests
-->

**Philosophy**: [Describe the documentation approach for this project]

**Principles**:
1. [First principle, e.g., "Code should be self-documenting where possible"]
2. [Second principle, e.g., "Document the why, not just the what"]
3. [Third principle, e.g., "Keep docs close to the code they describe"]

---

## Code Documentation

<!-- AI: How source code is documented -->

### Inline Comments

<!-- AI: Define when comments are required vs optional. Reference the coding style from doc 17. -->

| Scenario | Requirement |
|----------|-------------|
| Public functions/methods | [Required / JSDoc / Docstring - choose one] |
| Complex algorithms | [Required with explanation of approach] |
| Workarounds/hacks | [Required with reason and ticket reference] |
| Obvious code | [Not required - code should be self-documenting] |

### Documentation Style by Language

<!-- AI: Specify documentation format for each language used.

**Common Formats**:
- JavaScript/TypeScript: JSDoc
- Python: Docstrings (Google/NumPy/Sphinx style)
- Rust: rustdoc (/// comments)
- Go: GoDoc (comments before declarations)
- Java/Kotlin: Javadoc/KDoc
-->

| Language | Format | Example |
|----------|--------|---------|
| [Primary language] | [Format] | [Link or inline example] |
| [Secondary language] | [Format] | [Link or inline example] |

### Documentation Template

<!-- AI: Provide a template for documenting functions/methods -->

```
[Insert example of properly documented function in your primary language]

Example (TypeScript/JSDoc):
/**
 * Brief description of what the function does.
 *
 * @param paramName - Description of the parameter
 * @returns Description of return value
 * @throws Error - When this error is thrown
 *
 * @example
 * ```ts
 * const result = functionName('input');
 * ```
 */
```

### What NOT to Document

- Code that explains itself (obvious operations)
- Commented-out code (delete it, use git history)
- Change logs in files (use git commits)
- Trivial getters/setters
- Implementation details that may change

---

## API Documentation

<!-- AI: How APIs are documented -->

### Internal APIs

<!-- AI: How are internal APIs (IPC commands, internal functions) documented? -->

| Approach | Tool/Format |
|----------|-------------|
| IPC Commands | [Reference doc 09 / Inline / Generated] |
| Internal modules | [README per module / Inline / None] |
| Service interfaces | [Interface definitions / Inline docs] |

### External APIs (if applicable)

<!-- AI: If your app exposes APIs to external consumers -->

| API Type | Tool | Output |
|----------|------|--------|
| REST API | [OpenAPI/Swagger / Postman / None] | [Interactive docs / Static] |
| GraphQL | [GraphQL Playground / GraphiQL / None] | [Schema docs] |
| SDK/Library | [TypeDoc / rustdoc / Sphinx / None] | [API reference] |

### API Documentation Requirements

**For Each Endpoint/Method**:
- Description of purpose
- Request/response format with examples
- Authentication requirements
- Error responses
- Rate limits (if applicable)

---

## User Documentation

<!-- AI: Documentation for end users -->

### Documentation Scope

<!-- AI: What user-facing documentation will exist? -->

- [ ] README (basic usage)
- [ ] Getting started guide
- [ ] Feature documentation
- [ ] FAQ / Troubleshooting
- [ ] Keyboard shortcuts reference
- [ ] Configuration reference
- [ ] API reference (if applicable)
- [ ] Migration guides (between versions)

### Documentation Location

| Type | Location |
|------|----------|
| Quick start | [README.md / docs/ / External site] |
| Full docs | [docs/ folder / GitHub Wiki / Dedicated site] |
| In-app help | [Built-in / Link to external / None] |
| Changelog | [CHANGELOG.md / Releases page] |

### Documentation Platforms

<!-- AI: What tools generate or host documentation? -->

**Static Site Generators**:
| Tool | Best For |
|------|----------|
| Docusaurus | React projects, versioned docs |
| VitePress | Vue projects, fast build |
| MkDocs | Python projects, Material theme |
| GitBook | Collaborative editing |
| Astro Starlight | Modern, fast, flexible |

**Hosting**:
| Platform | Notes |
|----------|-------|
| GitHub Pages | Free, integrates with repo |
| Vercel | Preview deployments, fast |
| Netlify | Similar to Vercel |
| ReadTheDocs | Auto-builds from repo |

---

## README Standards

<!-- AI: What should be in the project README -->

### Required Sections

1. **Project name and description** - What is this?
2. **Installation** - How do I get started?
3. **Basic usage** - Show me a quick example
4. **Documentation link** - Where do I learn more?
5. **Contributing** - How do I help?
6. **License** - What can I do with this?

### Optional Sections

- Features list
- Screenshots/demos
- Prerequisites
- Configuration
- FAQ
- Related projects
- Acknowledgments

---

## Documentation Maintenance

<!-- AI: Keeping documentation current -->

### When to Update Docs

| Trigger | Required Update |
|---------|-----------------|
| New feature | User docs + code docs |
| API change | API docs + changelog |
| Bug fix | Troubleshooting if relevant |
| Config change | README + config reference |
| Breaking change | Migration guide |
| Deprecation | Mark as deprecated, add alternatives |

### Documentation Review

- [ ] Docs reviewed in PRs alongside code
- [ ] Periodic documentation audits (frequency: [monthly / quarterly / per release])
- [ ] User feedback incorporated
- [ ] Broken links checked

### Documentation Quality Checklist

- [ ] Accurate (matches current behavior)
- [ ] Complete (covers all features)
- [ ] Clear (understandable by target audience)
- [ ] Consistent (same style throughout)
- [ ] Up-to-date (reflects latest version)

---

## Generated Documentation

<!-- AI: Documentation auto-generated from code -->

### Auto-Generated Docs

| Source | Generator | Output |
|--------|-----------|--------|
| TypeScript types | [TypeDoc / None] | API reference |
| OpenAPI spec | [Swagger UI / Redoc / None] | REST API docs |
| Database schema | [dbdocs / None] | Data model docs |
| CLI help | [--help output / None] | Command reference |

### Generation Triggers

- [ ] On build
- [ ] On release
- [ ] Manual only
- [ ] PR preview

### Keeping Generated Docs in Sync

- [ ] Generated docs committed to repo
- [ ] Generated docs in CI artifacts
- [ ] Generated docs deployed automatically

---

## Related Documents

<!-- AI: Link to related documents. Ensure bidirectional linking. -->

| Document | Relationship |
|----------|--------------|
| [17 - Code Patterns](./17-code-patterns.md) | Code style and commenting conventions |
| [09 - API Contracts](./09-api-contracts.md) | API documentation needs |
| [22 - Release Management](./22-release-management.md) | Changelog and release notes |
| [19 - CI/CD Pipeline](./19-cicd-pipeline.md) | Documentation deployment |

---

## AI Agent Instructions

<!-- AI: Instructions for AI agents working with this document -->

### When Populating This Document

1. **Identify audiences**: Who reads documentation (developers, users, operators)?
2. **Choose tools**: Match documentation tools to tech stack
3. **Set standards**: Define what "good enough" documentation looks like
4. **Plan maintenance**: How will docs stay current?
5. **Reference related docs**: Link to code patterns and API contracts

### When Writing Documentation

1. **Write for the reader**: Consider their knowledge level
2. **Show, don't tell**: Include examples
3. **Keep it DRY**: Link to existing docs rather than repeat
4. **Test your docs**: Follow your own instructions
5. **Update as you code**: Don't leave docs for later

### Common Mistakes to Avoid

- **Outdated docs**: Worse than no docs
- **Too much detail**: Document intent, not obvious implementation
- **No examples**: Examples are the most-read part of docs
- **Assuming knowledge**: Define terms, link to prerequisites
- **Ignoring maintenance**: Docs need ongoing attention

### Quality Checklist

Before marking this document complete:
- [ ] Documentation philosophy defined
- [ ] Code documentation standards set
- [ ] API documentation approach chosen
- [ ] User documentation scope defined
- [ ] Documentation platform selected (if applicable)
- [ ] Maintenance process documented
- [ ] Related Documents links are bidirectional
