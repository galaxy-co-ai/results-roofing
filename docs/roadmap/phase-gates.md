# Phase Gates

Checkpoints that must be passed before advancing to the next development phase.

---

## Why Phase Gates?

- **Prevent rework**: Building on incomplete foundations causes rewrites
- **Ensure alignment**: Confirm human and AI are on the same page
- **Create save points**: Clear milestones for handoffs and progress tracking
- **Enable parallelization**: Know when team members can start independent work

---

## Phase Gate Overview

```
Phase 0 ──► Gate 0 ──► Phase 1 ──► Gate 1 ──► Phase 2 ──► Gate 2 ──► Phase 3 ──► Gate 3 ──► Phase 4+
(Setup)              (Discovery)             (Design)              (Planning)             (Execution)
```

---

## Gate 0: Ready to Discover

**Entering**: Phase 1 (Discovery)
**Required docs**: 00
**Approval**: Self (no human review needed)

### Checklist
- [ ] Project folder structure created
- [ ] Git repository initialized
- [ ] Development environment working (can run basic commands)
- [ ] This documentation framework copied and placeholders replaced
- [ ] Doc 00 completed with actual versions and commands

### Verification
```bash
# These should work without errors
cd [PROJECT_PATH]
git status
[your-package-manager] --version
```

### Failure Recovery
If blocked: Document missing tools/access in progress-tracker.md blockers section.

---

## Gate 1: Ready to Design

**Entering**: Phase 2 (Design)
**Required docs**: 01, 02, 03, 04
**Approval**: Human review required

### Checklist
- [ ] Vision and goals defined (doc 01 complete)
- [ ] User personas created (doc 02 complete)
- [ ] Product requirements documented (doc 03 complete)
- [ ] Features broken down and prioritized (doc 04 complete)
- [ ] MVP scope clearly defined
- [ ] Human has reviewed and approved Phase 1 docs

### Human Review Questions
Present these to the user before proceeding:

1. "Does the vision statement in doc 01 match your intent?"
2. "Are the personas in doc 02 representative of your actual users?"
3. "Are there any requirements missing from doc 03?"
4. "Is the MVP feature set in doc 04 the right scope?"

### Verification
- All Phase 1 docs marked "Complete" in progress-tracker.md
- No unresolved `[TBD]` markers in docs 01-04
- Human has explicitly approved (document in session log)

### Failure Recovery
If requirements change: Update docs 01-04, re-request approval. Do NOT proceed to Phase 2 with unapproved changes.

---

## Gate 2: Ready to Plan Sprints

**Entering**: Phase 3 (Sprint Planning)
**Required docs**: 05-17 (all design docs)
**Approval**: Human review of architecture decisions

### Checklist

#### UI/UX Complete (2A)
- [ ] Doc 05 (UI/UX Design) complete
- [ ] Doc 06 (Component Specs) complete
- [ ] Doc 13 (Accessibility) complete
- [ ] Doc 16 (Design Tokens) complete

#### Technical Design Complete (2B)
- [ ] Doc 07 (Technical Architecture) complete
- [ ] Doc 08 (Data Models) complete
- [ ] Doc 09 (API Contracts) complete
- [ ] Doc 15 (File Architecture) complete

#### Code Standards Complete (2C)
- [ ] Doc 17 (Code Patterns) complete

#### Quality Planning Complete (2D)
- [ ] Doc 10 (Error Handling) complete
- [ ] Doc 11 (Security) complete
- [ ] Doc 12 (Testing Strategy) complete
- [ ] Doc 14 (Performance Goals) complete
- [ ] Doc 19 (CI/CD Pipeline) complete
- [ ] Doc 20 (Documentation Strategy) complete
- [ ] Doc 21 (Monitoring) complete
- [ ] Doc 22 (Release Management) complete
- [ ] Doc 23 (Configuration) complete

#### Cross-Cutting
- [ ] Doc 18 (Decision Log) has all major decisions documented
- [ ] All docs cross-reference correctly

### Human Review Questions
Present these to the user:

1. "Does the technical architecture in doc 07 align with your expectations?"
2. "Are you comfortable with the tech stack choices?"
3. "Do the component specs in doc 06 cover all needed UI elements?"
4. "Are the performance targets in doc 14 realistic?"

### Verification
- All Phase 2 docs marked "Complete" in progress-tracker.md
- Architecture decisions logged in doc 18
- Human has explicitly approved technical direction

### Failure Recovery
If architecture needs to change: Update affected docs, trace downstream impacts using DEPENDENCIES.md, re-request approval.

---

## Gate 3: Ready to Execute

**Entering**: Phase 4 (Execution)
**Required docs**: Sprint 01 defined
**Approval**: Human review of first sprint scope

### Checklist
- [ ] sprint-overview.md has sprint roadmap
- [ ] Sprint 01 document created from template
- [ ] Sprint 01 tasks are specific and actionable
- [ ] Sprint 01 has clear acceptance criteria
- [ ] CI/CD pipeline configured (at minimum: can build and run tests)
- [ ] Development environment fully working

### Human Review Questions
Present these to the user:

1. "Does Sprint 01 scope feel achievable?"
2. "Are the acceptance criteria clear enough to verify completion?"
3. "Is there anything blocking you from starting development?"

### Verification
- Sprint 01 doc exists and is complete
- `progress-tracker.md` shows Sprint 01 as "Ready"
- Human has approved sprint scope

### Failure Recovery
If sprint scope is wrong: Adjust sprint doc, do NOT start coding until approved.

---

## Ongoing Gates (During Execution)

### Sprint Completion Gate

Before starting Sprint N+1:

- [ ] All Sprint N tasks completed (or explicitly deferred with reason)
- [ ] Sprint N acceptance criteria verified
- [ ] progress-tracker.md updated
- [ ] Handoff message generated
- [ ] Human notified of completion
- [ ] Sprint N+1 doc created and approved

### Release Gate

Before any release:

- [ ] All planned features complete
- [ ] All tests passing
- [ ] Performance targets met (doc 14)
- [ ] Security checklist passed (doc 11)
- [ ] Documentation updated (doc 20)
- [ ] Changelog updated (doc 22)
- [ ] Human has approved release

---

## Emergency Procedures

### Requirement Change Mid-Sprint
1. Stop current work
2. Document change request in decision log (doc 18)
3. Assess impact on current sprint and future sprints
4. Get human approval for revised scope
5. Update affected sprint docs
6. Resume work

### Blocked by External Dependency
1. Document blocker in progress-tracker.md
2. Identify workaround or alternative approach
3. If no workaround: pause affected tasks, continue unblocked work
4. Escalate to human with options

### Architecture Needs to Change
1. Stop related development work
2. Document reason for change in decision log
3. Update architecture docs (07, 15, potentially others)
4. Trace downstream impacts using DEPENDENCIES.md
5. Get human approval before resuming

---

## AI Agent Instructions

### At Each Gate
1. Announce: "Ready to pass Gate X. Running checklist..."
2. Go through each checklist item explicitly
3. Report: "Gate X checklist: X/Y items complete"
4. If incomplete: List specific missing items and actions needed
5. If complete: Request human approval before proceeding

### Gate Passage Format
```
## Gate [X] Check

### Status: [READY / NOT READY]

### Checklist Results
- [x] Item 1
- [x] Item 2
- [ ] Item 3 - Missing: [specific detail]

### Human Approval Needed
[Questions to ask the user]

### Recommendation
[Proceed / Address items first]
```

### Never Skip Gates
Even if the human says "just start coding":
1. Explain why the gate exists
2. Offer to fast-track (fill docs quickly) rather than skip
3. Document any scope limitations from skipping in decision log

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [Progress Tracker](./progress-tracker.md) | Track gate status |
| [Sprint Overview](./sprint-overview.md) | Phase and sprint timeline |
| [DEPENDENCIES.md](../planning/DEPENDENCIES.md) | Document dependency graph |
| [DOC-COMPLETION-CHECKLIST.md](../planning/DOC-COMPLETION-CHECKLIST.md) | Criteria for doc completion |
