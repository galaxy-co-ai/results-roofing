# Tech Decisions

Quick reference for technology choices in [PROJECT_NAME].

<!-- AI: This document records key technology decisions and their rationale. It serves as a lightweight Architecture Decision Record (ADR) log. Each decision should explain WHAT was chosen, WHY it was chosen, and what ALTERNATIVES were considered. -->

---

## How to Use This Document

<!-- AI: Explain how to use this decision log:
- Add decisions as they're made during project setup
- Keep entries concise but include enough context for future reference
- Link to detailed ADRs in doc 18 for complex decisions
- Update decisions if technology changes (mark old decision as superseded)
- Review during onboarding to understand project context -->

---

## Decision Template

<!-- AI: Use this template for each technology decision: -->

```markdown
## Category: Technology Name

**Decision**: What was chosen
**Date**: When the decision was made
**Status**: Active | Superseded | Deprecated

**Why**: Primary reasons for this choice (2-3 sentences)

**Alternatives Considered**:
- Alternative 1: Why not chosen
- Alternative 2: Why not chosen

**Trade-offs**: Known limitations or costs of this choice

**Revisit If**: Conditions that would trigger reconsideration
```

---

## Core Technology Decisions

<!-- AI: Document the fundamental technology choices for your project. Categories to consider:
- Language/Runtime
- Framework
- Build Tool
- Package Manager

For each, explain the decision using the template above. -->

### Language/Runtime

<!-- AI: Document your primary language choice. Example structure: -->

**Decision**: <!-- AI: e.g., TypeScript, Python 3.11, Go 1.21, Rust -->

**Why**: <!-- AI: 2-3 sentences explaining the choice -->

**Alternatives Considered**:
- <!-- AI: Alternative and why not chosen -->

**Trade-offs**: <!-- AI: Known limitations -->

---

### Framework/Platform

<!-- AI: Document your framework or platform choice. This varies by project type:
- Web SPA: React, Vue, Svelte, Angular
- Web SSR: Next.js, Nuxt, SvelteKit, Remix
- Desktop: Tauri, Electron, .NET MAUI
- Mobile: React Native, Flutter, SwiftUI, Kotlin
- Backend: Express, Fastify, FastAPI, Gin, Actix
- CLI: Commander, Cobra, Clap -->

**Decision**: <!-- AI: Your framework choice -->

**Why**: <!-- AI: 2-3 sentences explaining the choice -->

**Alternatives Considered**:
- <!-- AI: Alternative and why not chosen -->

**Trade-offs**: <!-- AI: Known limitations -->

---

### Build Tool

<!-- AI: Document your build tool choice:
- JavaScript/TypeScript: Vite, webpack, esbuild, Parcel
- Python: pip, Poetry, PDM
- Go: go build (standard)
- Rust: cargo (standard) -->

**Decision**: <!-- AI: Your build tool -->

**Why**: <!-- AI: 2-3 sentences explaining the choice -->

---

### Package Manager

<!-- AI: Document your package manager choice:
- JavaScript: npm, pnpm, yarn, bun
- Python: pip, Poetry, PDM, uv
- Go: go mod (standard)
- Rust: cargo (standard) -->

**Decision**: <!-- AI: Your package manager -->

**Why**: <!-- AI: 2-3 sentences explaining the choice -->

---

## Architecture Decisions

<!-- AI: Document significant architectural choices:
- State Management
- Data Storage
- API Design
- Authentication
- Deployment -->

### State Management

<!-- AI: How does the application manage state?
- Frontend: Redux, Zustand, Pinia, Signals, Context
- Backend: In-memory, Redis, Database
- Mobile: Local state, Redux, MobX -->

**Decision**: <!-- AI: Your state management approach -->

**Why**: <!-- AI: 2-3 sentences explaining the choice -->

**Alternatives Considered**:
- <!-- AI: Alternatives -->

---

### Data Storage

<!-- AI: How does the application persist data?
- SQL: PostgreSQL, MySQL, SQLite
- NoSQL: MongoDB, Redis, DynamoDB
- File-based: JSON, SQLite, Local Storage
- Cloud: Supabase, Firebase, PlanetScale -->

**Decision**: <!-- AI: Your storage solution -->

**Why**: <!-- AI: 2-3 sentences explaining the choice -->

**Alternatives Considered**:
- <!-- AI: Alternatives -->

---

### Styling Approach

<!-- AI: How is the UI styled?
- CSS-in-JS: styled-components, Emotion, Stitches
- Utility-first: Tailwind, UnoCSS
- Component libraries: shadcn/ui, Radix, Material UI
- Plain CSS: CSS Modules, Sass, vanilla CSS -->

**Decision**: <!-- AI: Your styling approach -->

**Why**: <!-- AI: 2-3 sentences explaining the choice -->

**Alternatives Considered**:
- <!-- AI: Alternatives -->

---

## Infrastructure Decisions

<!-- AI: Document deployment and infrastructure choices -->

### Hosting/Deployment

<!-- AI: Where is the application deployed?
- Static: Vercel, Netlify, Cloudflare Pages
- Container: Docker, Kubernetes
- Serverless: AWS Lambda, Vercel Functions
- PaaS: Railway, Render, Fly.io
- Self-hosted: VPS, bare metal -->

**Decision**: <!-- AI: Your hosting choice -->

**Why**: <!-- AI: 2-3 sentences explaining the choice -->

---

### CI/CD Platform

<!-- AI: Which CI/CD platform is used?
- GitHub Actions, GitLab CI, CircleCI, Azure DevOps -->

**Decision**: <!-- AI: Your CI/CD platform -->

**Why**: <!-- AI: 2-3 sentences explaining the choice -->

---

## Decision Criteria Framework

<!-- AI: Use these criteria when evaluating technology options: -->

When making technology decisions, evaluate options against these criteria:

| Criterion | Questions to Ask |
|-----------|------------------|
| **Team Expertise** | Does the team have experience? What's the learning curve? |
| **Ecosystem** | Is there good documentation? Active community? Quality libraries? |
| **Performance** | Does it meet performance requirements? |
| **Maintainability** | Will this be easy to maintain long-term? |
| **Security** | What's the security track record? Active maintenance? |
| **Cost** | Licensing costs? Infrastructure costs? |
| **Longevity** | Is this technology stable? Risk of abandonment? |
| **Integration** | Does it integrate well with other chosen technologies? |

### Red Flags to Watch For

- No updates in 12+ months (for actively developed projects)
- Single maintainer with no succession plan
- Rapidly changing API without stable releases
- Poor or outdated documentation
- No clear migration path from current version
- Vendor lock-in without exit strategy

---

## Superseded Decisions

<!-- AI: When a technology decision changes, move the old entry here with explanation. Example:

### [Superseded] Original State Management Choice
**Original Decision**: Redux
**Superseded By**: Zustand
**Date**: 2024-03-15
**Reason**: Reduced boilerplate, simpler mental model, sufficient for project needs
-->

<!-- AI: Add superseded decisions here as the project evolves -->

---

## Pending Decisions

<!-- AI: Track decisions that haven't been finalized yet -->

| Decision | Options Under Consideration | Deadline | Owner |
|----------|----------------------------|----------|-------|
| <!-- AI: What needs to be decided --> | <!-- AI: Options being evaluated --> | <!-- AI: When decision needed --> | <!-- AI: Who decides --> |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [18. Technical Constraints](../planning/18-technical-constraints.md) | Detailed ADRs and constraint documentation |
| [07. Technical Architecture](../planning/07-technical-architecture.md) | How decisions shape overall architecture |
| [00. Project Setup](../planning/00-project-setup.md) | Setup instructions for chosen technologies |
| [Glossary](./glossary.md) | Definitions of technical terms |

---

## AI Agent Instructions

When working with this tech decisions document:

1. **Recording Decisions**
   - Document decisions as they're made during project setup
   - Include rationale - future you needs to know WHY
   - List alternatives to show due diligence
   - Note trade-offs honestly

2. **Evaluating Options**
   - Use the Decision Criteria Framework for systematic evaluation
   - Consider team expertise heavily - the "best" tool is useless if no one knows it
   - Prefer boring technology for core infrastructure
   - Save cutting-edge choices for non-critical features

3. **Updating Decisions**
   - When changing technology, move old decision to Superseded section
   - Explain why the change was made
   - Update dependent documents (00-project-setup, 07-architecture)

### Quality Checklist
- [ ] All major technology choices documented
- [ ] Each decision includes rationale (WHY)
- [ ] Alternatives considered for significant decisions
- [ ] Trade-offs acknowledged honestly
- [ ] No [TBD] entries without pending decision tracking
- [ ] Superseded decisions preserved with context
