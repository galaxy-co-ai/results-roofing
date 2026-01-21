# Document Completion Checklist

How to know when a planning document is ready to support downstream work.

---

## Document Status Definitions

| Status | Meaning | Can Downstream Start? |
|--------|---------|----------------------|
| **Template** | Structure only, no project-specific content | No |
| **Draft** | Partially filled, key decisions pending | No |
| **Review** | Content complete, needs human approval | No |
| **Complete** | Approved and ready to reference | Yes |

---

## Universal Completion Criteria

Every planning doc must meet these criteria before marking "Complete":

### Content Requirements
- [ ] No `[TBD]` markers remain (or explicitly marked as "Deferred to Phase X")
- [ ] No placeholder text like `[Describe X here]`
- [ ] All tables have real data (not just headers)
- [ ] All decisions are justified (not just stated)

### Cross-Reference Requirements
- [ ] "Related Documents" section exists and links are accurate
- [ ] References to other docs use correct doc numbers
- [ ] No circular dependencies introduced

### Quality Requirements
- [ ] Another person (or fresh AI session) can understand without context
- [ ] Specific enough to act on (not vague platitudes)
- [ ] Consistent with decisions in other completed docs

---

## Per-Document Completion Criteria

### Foundation Docs

#### AGENT-GUIDE.md
- [ ] Project description filled in (What is [PROJECT_NAME]?)
- [ ] Core concept explained clearly
- [ ] Tech stack references point to correct docs
- [ ] Project path placeholder replaced

#### 00-project-setup.md
- [ ] All version numbers specified
- [ ] Bootstrap commands tested and working
- [ ] IDE settings configured
- [ ] All prerequisites listed

---

### Phase 1: Discovery (01-04)

#### 01-vision-and-goals.md
- [ ] Problem statement is specific (not generic)
- [ ] Vision statement describes end-state
- [ ] At least 3 measurable success criteria
- [ ] Non-goals explicitly stated (scope boundaries)
- [ ] Key differentiators identified

#### 02-user-personas.md
- [ ] At least 1 primary persona fully defined
- [ ] Pain points are specific (not "needs better UX")
- [ ] Use cases have frequency estimates
- [ ] Workflow expectations described
- [ ] Anti-personas defined (who this is NOT for)

#### 03-product-requirements.md
- [ ] All Must-Have requirements listed
- [ ] Requirements are testable (can verify done/not done)
- [ ] Dependencies identified with risk levels
- [ ] Constraints documented
- [ ] Out-of-scope items listed

#### 04-feature-breakdown.md
- [ ] All features have unique IDs
- [ ] Priority assigned to each (P0/P1/P2)
- [ ] MVP features clearly marked
- [ ] Feature dependencies mapped
- [ ] Effort estimates provided (S/M/L minimum)

---

### Phase 2A: UI/UX Design (05, 06, 13, 16)

#### 05-ui-ux-design.md
- [ ] Main layout documented (wireframe or description)
- [ ] User flows for primary actions defined
- [ ] Navigation structure clear
- [ ] Responsive behavior specified (if applicable)
- [ ] Key interactions described

#### 06-component-specs.md
- [ ] Component hierarchy documented
- [ ] Each component has: purpose, props, states, events
- [ ] Shared components identified
- [ ] Component naming consistent with conventions

#### 13-accessibility.md
- [ ] Target WCAG level specified
- [ ] Keyboard navigation defined
- [ ] Screen reader considerations listed
- [ ] Color contrast requirements met
- [ ] Focus management planned

#### 16-design-tokens.md
- [ ] Color palette complete (primary, semantic, neutral)
- [ ] Typography scale defined
- [ ] Spacing scale defined
- [ ] All tokens have usage guidelines

---

### Phase 2B: Technical Design (07-09, 15)

#### 07-technical-architecture.md
- [ ] Tech stack fully specified (no [TBD] tools)
- [ ] System diagram shows all major components
- [ ] Data flow documented
- [ ] Key architectural decisions justified
- [ ] Build/deploy process outlined

#### 08-data-models.md
- [ ] All entities/models defined
- [ ] Relationships documented
- [ ] Validation rules specified
- [ ] Persistence strategy chosen
- [ ] Migration strategy considered

#### 09-api-contracts.md
- [ ] All endpoints/commands documented
- [ ] Request/response formats specified
- [ ] Error codes defined
- [ ] Authentication approach documented
- [ ] Rate limiting considered (if applicable)

#### 15-file-architecture.md
- [ ] Folder structure complete
- [ ] Naming conventions documented
- [ ] Import patterns defined
- [ ] File placement rules clear

---

### Phase 2C: Code Standards (17)

#### 17-code-patterns.md
- [ ] Reference patterns for each major code type
- [ ] Anti-patterns documented with alternatives
- [ ] Examples are runnable (not pseudocode)
- [ ] Patterns align with tech stack choices

---

### Phase 2D: Quality Planning (10-14, 19-23)

#### 10-error-handling.md
- [ ] Error categories defined
- [ ] User-facing messages written
- [ ] Recovery strategies specified
- [ ] Logging approach documented

#### 11-security-considerations.md
- [ ] Sensitive data inventory complete
- [ ] Protection methods specified per data type
- [ ] Input validation rules defined
- [ ] Authentication/authorization planned

#### 12-testing-strategy.md
- [ ] Test types defined (unit, integration, e2e)
- [ ] Coverage targets set
- [ ] Testing tools chosen
- [ ] Critical paths identified for e2e

#### 14-performance-goals.md
- [ ] Numerical targets specified
- [ ] Measurement methods defined
- [ ] Optimization strategies identified
- [ ] Monitoring approach planned

#### 19-cicd-pipeline.md
- [ ] CI platform chosen
- [ ] Build triggers defined
- [ ] Test automation integrated
- [ ] Release process documented

#### 20-documentation-strategy.md
- [ ] Code documentation standards set
- [ ] User documentation scope defined
- [ ] Documentation tools chosen

#### 21-monitoring-observability.md
- [ ] Error tracking approach defined
- [ ] Logging strategy documented
- [ ] Alerting rules specified (if applicable)

#### 22-release-management.md
- [ ] Versioning scheme chosen
- [ ] Changelog format defined
- [ ] Release checklist created

#### 23-configuration-management.md
- [ ] All config options documented
- [ ] Default values specified
- [ ] Feature flags defined (if applicable)

---

## Marking a Doc Complete

1. Run through the universal criteria checklist
2. Run through the doc-specific checklist
3. Update `progress-tracker.md` status to "Complete"
4. Log completion in doc 18 (Decision Log) if major decisions were made

---

## Handling Incomplete Items

If you cannot complete a section:

1. **Defer explicitly**: Change `[TBD]` to `[Deferred: reason, revisit in Phase X]`
2. **Document blocker**: Add to Blockers section in progress-tracker.md
3. **Don't block downstream**: If 80%+ complete and remainder is non-critical, mark as "Complete*" with note

---

## AI Agent Instructions

When checking document completion:

1. Read the doc fully before assessing
2. Use this checklist systematically (don't skip items)
3. Report completion percentage: "Doc 07 is ~70% complete, missing: [list]"
4. Suggest specific actions to reach completion
5. Don't mark complete unless ALL criteria met
