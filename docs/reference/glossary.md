# Glossary

Project-specific terminology and definitions for [PROJECT_NAME].

<!-- AI: This glossary defines terms used throughout the project documentation and codebase. It serves as a shared vocabulary for the team and helps onboard new contributors quickly. -->

---

## How to Use This Document

<!-- AI: Explain glossary usage:
- Add terms as they emerge during development
- Include both technical and domain-specific terminology
- Link to this glossary from other docs when using jargon
- Keep definitions concise but complete
- Update definitions as understanding evolves -->

---

## Project Terms

<!-- AI: Define project-specific terminology here. These are terms unique to YOUR project that wouldn't be found in standard references.

For each term, provide:
- The term as it appears in discussions/code
- A clear, concise definition
- Optionally: origin, context, or examples

Categories to consider:
- Domain concepts (business logic terms)
- UI elements (screens, components, panels)
- User-facing features
- Internal architecture concepts
- Project-specific abbreviations -->

| Term | Definition |
|------|------------|
| **[PROJECT_NAME]** | <!-- AI: Brief description of this project --> |
| <!-- AI: Add domain-specific terms here --> | <!-- AI: Definition --> |

---

## Domain Terms

<!-- AI: Define terms from your project's domain (e.g., e-commerce, healthcare, finance). These are terms that someone unfamiliar with the domain would need explained.

Example domains and terms:
- E-commerce: SKU, Cart, Checkout, Fulfillment
- Healthcare: Patient, Provider, Encounter, Claim
- Finance: Transaction, Ledger, Reconciliation, Settlement
- Education: Course, Enrollment, Syllabus, Assessment -->

| Term | Definition |
|------|------------|
| <!-- AI: Add domain terms as you identify them --> | <!-- AI: Definition --> |

---

## Technical Terms

<!-- AI: Define technical terms that may not be obvious to all team members. Focus on:
- Stack-specific concepts
- Architecture patterns used in this project
- Integration points and protocols
- Framework-specific terminology

Only include terms that are actually used in this project. Don't create a generic programming dictionary. -->

| Term | Definition |
|------|------------|
| <!-- AI: Add stack-specific technical terms --> | <!-- AI: Definition --> |

### Common Technical Patterns

<!-- AI: If your project uses specific patterns, define them here. Examples: -->

| Term | Definition |
|------|------------|
| **IPC** | Inter-Process Communication - messages between separate processes |
| **RPC** | Remote Procedure Call - calling functions on remote systems |
| **ORM** | Object-Relational Mapping - database abstraction layer |
| **DTO** | Data Transfer Object - structured data for passing between layers |
| **DI** | Dependency Injection - pattern for providing dependencies to components |

---

## UI/UX Terms

<!-- AI: Define terms for UI components and user experience concepts specific to your project. Include:
- Named screens or views
- Custom components
- Navigation concepts
- User workflow terminology -->

| Term | Definition |
|------|------------|
| <!-- AI: Add UI-specific terms --> | <!-- AI: Definition --> |

---

## Document Abbreviations

Standard abbreviations used in project documentation.

| Abbreviation | Full Name |
|--------------|-----------|
| **PRD** | Product Requirements Document |
| **A11y** | Accessibility |
| **UI/UX** | User Interface / User Experience |
| **MVP** | Minimum Viable Product |
| **ADR** | Architecture Decision Record |
| **API** | Application Programming Interface |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **SPA** | Single Page Application |
| **SSR** | Server-Side Rendering |

---

## Status Terms

Standard status indicators used in documentation.

| Term | Meaning |
|------|---------|
| **TBD** | To Be Determined - decision pending |
| **WIP** | Work In Progress - actively being developed |
| **P0** | Highest priority - critical/blocking |
| **P1** | High priority - important for next milestone |
| **P2** | Medium priority - planned but not urgent |
| **P3** | Low priority - nice to have |
| **Draft** | Initial version, not yet reviewed |
| **Review** | Pending review/approval |
| **Approved** | Reviewed and accepted |
| **Deprecated** | Scheduled for removal, don't use in new code |
| **N/A** | Not Applicable |

---

## Priority Definitions

<!-- AI: Define what priority levels mean for YOUR project. Customize based on team SLAs and processes. -->

| Priority | Response Time | Description |
|----------|---------------|-------------|
| **P0** | <!-- AI: e.g., Immediate --> | <!-- AI: Define what qualifies as P0 --> |
| **P1** | <!-- AI: e.g., Same day --> | <!-- AI: Define what qualifies as P1 --> |
| **P2** | <!-- AI: e.g., This sprint --> | <!-- AI: Define what qualifies as P2 --> |
| **P3** | <!-- AI: e.g., Backlog --> | <!-- AI: Define what qualifies as P3 --> |

---

## Version and Release Terms

| Term | Definition |
|------|------------|
| **Major** | Breaking changes, significant new features |
| **Minor** | New features, backward compatible |
| **Patch** | Bug fixes, backward compatible |
| **RC** | Release Candidate - final testing before release |
| **Alpha** | Early testing, incomplete features |
| **Beta** | Feature complete, under testing |
| **GA** | General Availability - production release |
| **LTS** | Long Term Support - extended maintenance period |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [Conventions](./conventions.md) | Naming conventions that may introduce new terms |
| [Tech Decisions](./tech-decisions.md) | Technical choices that may introduce terminology |
| [01. Vision and Goals](../planning/01-vision-and-goals.md) | Domain context and project terminology |
| [03. Product Requirements](../planning/03-product-requirements.md) | Feature names and priority definitions |

---

## AI Agent Instructions

When working with this glossary:

1. **Adding New Terms**
   - Add terms when they first appear in documentation
   - Prefer precise definitions over lengthy explanations
   - Include context for ambiguous terms
   - Cross-reference related terms

2. **Organizing Terms**
   - Place terms in the most relevant section
   - Domain terms: business/industry concepts
   - Technical terms: implementation concepts
   - UI/UX terms: interface elements

3. **Maintaining Consistency**
   - Use glossary terms consistently across all documentation
   - Update definitions when understanding changes
   - Remove terms that are no longer used
   - Link to this glossary when using jargon elsewhere

### Quality Checklist
- [ ] All project-specific terms defined
- [ ] Domain terminology explained for non-experts
- [ ] Technical terms limited to those actually used
- [ ] Priority levels customized for project workflow
- [ ] No orphaned terms (defined but never used)
- [ ] No undefined jargon in other documents
