# Sprint [XX]: [Name]

## Sprint Goal

[One sentence describing what this sprint achieves and why it matters]

---

## Dependencies

### Prerequisites
- Sprint [XX-1] complete
- Docs required: [List doc numbers, e.g., 07, 08, 17]

### Blocked By
- [ ] [Any external dependencies or blockers]

### Blocks
- Sprint [XX+1]: [How this sprint enables future work]

---

## Tasks

### Task 1: [Name]
- [ ] **Complete**
- **Files**: `src/path/to/file.tsx`
- **Action**: Create | Modify | Delete

**Steps**:
1. [Specific instruction]
2. [Specific instruction]

**Expected outcome**: [What should work when done]
**Reference**: See doc [XX] for [relevant pattern]

---

### Task 2: [Name]
- [ ] **Complete**
- **Files**: `src/path/to/file.tsx`
- **Action**: Create | Modify | Delete

**Steps**:
1. [Specific instruction]
2. [Specific instruction]

**Expected outcome**: [What should work when done]

---

### Task 3: [Name]
- [ ] **Complete**
- **Files**: `src/path/to/file.tsx`
- **Action**: Create | Modify | Delete

**Steps**:
1. [Specific instruction]
2. [Specific instruction]

---

## Acceptance Criteria

### Functional Requirements
- [ ] [Feature X works as specified]
- [ ] [User can perform action Y]
- [ ] [Data persists correctly]

### Technical Requirements
- [ ] No TypeScript/compilation errors
- [ ] No console errors in browser/runtime
- [ ] Code follows patterns in doc 17
- [ ] Tests pass (if applicable)

### Manual Verification
```bash
# Run these commands to verify sprint completion
[your-build-command]     # No build errors
[your-test-command]      # Tests pass (if applicable)
[your-dev-command]       # App starts correctly
```

---

## Handoff Notes

### What Was Done
- [x] Task 1: [Brief description of completion]
- [x] Task 2: [Brief description of completion]
- [ ] Task 3: [If incomplete, explain why]

### Key Files Changed
| File | Change Type | Description |
|------|-------------|-------------|
| `src/example.tsx` | Created | [Brief description] |
| `src/other.ts` | Modified | [Brief description] |

### Decisions Made
- [Any architectural or implementation decisions - log in doc 18]

### Known Issues
- [Any bugs, technical debt, or concerns for future sprints]

### Next Sprint Setup
- [ ] Progress tracker updated
- [ ] Decision log updated (if applicable)
- [ ] Handoff message generated

---

## Handoff Message Template

Copy this to start the next session:

```
===============================================================
                    SPRINT [XX] COMPLETE
===============================================================

## Summary
**Status**: Complete | Partial | Blocked
**Sprint**: [XX] - [Name]

## What Was Done
- [x] Task 1: Brief description
- [x] Task 2: Brief description

## What's Not Done (if any)
- [ ] Task X: Reason deferred

## Key Files Changed
- `src/path/file.tsx` - Description of change

## Current State
[One sentence: what the app does now]

## Blockers (if any)
[Brief description or "None"]

===============================================================
        COPY BELOW THIS LINE TO START NEXT SESSION
===============================================================

Continue [PROJECT_NAME] development.

Location: [PROJECT_PATH]
Last completed: Sprint [XX] - [Name]
Starting now: Sprint [XX+1] - [Name]

Read docs/planning/AGENT-GUIDE.md first (contains full project context
and instructions). Then load progress-tracker.md and begin Sprint [XX+1].

Verify before starting:
cd [PROJECT_PATH] && [your dev command]

Expected: [What should happen]
```
