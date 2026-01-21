# Document Dependencies

This graph shows which docs must be complete before others can start.

```
00 Project Setup ─────────────────────────────────┐
       │                                          │
01 Vision ──► 02 Personas ──► 03 PRD ──► 04 Features
                                              │
                    ┌─────────────────────────┴──────────────────┐
                    ▼                                            ▼
            05 UI/UX Design                              07 Tech Architecture
                    │                                            │
        ┌───────────┼───────────┐                    ┌───────────┼───────────┐
        ▼           ▼           ▼                    ▼           ▼           ▼
   16 Design    06 Component   13 A11y         08 Data     09 API      15 File
   Tokens       Specs                          Models      Contracts   Architecture
        │           │                              │           │           │
        └───────────┴──────────────────────────────┴───────────┴───────────┘
                                        │
                                        ▼
                              17 Code Patterns (needs all above)
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              10 Error            11 Security         12 Testing
              Handling                                Strategy
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
           14 Performance         19 CI/CD           23 Config
              Goals               Pipeline           Management
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
           20 Documentation      21 Monitoring       22 Release
              Strategy           Observability       Management
                                        │
                                        ▼
                              18 Decision Log (ongoing)
```

## Dependency Rules

### Can Start Immediately
- **00-project-setup.md** - No dependencies

### Requires 00
- **01-vision-and-goals.md** - Needs project to exist

### Linear Chain (Complete in Order)
```
01 Vision → 02 Personas → 03 PRD → 04 Features
```

### Branches After 04 (Can Parallelize)
After 04 is complete, two branches can proceed in parallel:

**UI Branch:**
- 05 UI/UX Design
- Then: 06 Component Specs, 16 Design Tokens, 13 Accessibility

**Technical Branch:**
- 07 Technical Architecture
- Then: 08 Data Models, 09 API Contracts, 15 File Architecture

### Convergence Point
**17 Code Patterns** requires ALL of these complete:
- 06 Component Specs
- 08 Data Models
- 09 API Contracts
- 15 File Architecture
- 16 Design Tokens

### Quality Docs (After 17)
These can be done in parallel after 17:
- 10 Error Handling
- 11 Security Considerations
- 12 Testing Strategy

### Operations Docs (After Quality Docs)
These can be done in parallel after 10, 11, 12:
- **14 Performance Goals** - Needs 10, 11, 12
- **19 CI/CD Pipeline** - Needs 12 (Testing Strategy)
- **23 Configuration Management** - Needs 07, 08, 11

### Final Planning Docs (After Operations)
These can be done in parallel after 14, 19, 23:
- **20 Documentation Strategy** - Needs 17, 09
- **21 Monitoring & Observability** - Needs 10, 12, 14
- **22 Release Management** - Needs 12, 19

### Ongoing
- **18 Decision Log** - Updated throughout all phases

## Quick Reference: What Can I Work On?

| If This Is Done | You Can Start |
|-----------------|---------------|
| Nothing | 00 Project Setup |
| 00 | 01 Vision |
| 01 | 02 Personas |
| 02 | 03 PRD |
| 03 | 04 Features |
| 04 | 05 UI/UX Design, 07 Tech Architecture |
| 05 | 06 Components, 16 Design Tokens, 13 A11y |
| 07 | 08 Data Models, 09 API Contracts, 15 File Arch |
| 06 + 08 + 09 + 15 + 16 | 17 Code Patterns |
| 17 | 10 Error, 11 Security, 12 Testing |
| 10 + 11 + 12 | 14 Performance, 19 CI/CD, 23 Config |
| 14 + 19 + 23 | 20 Documentation, 21 Monitoring, 22 Release |

## Document Count

- **Foundation**: 2 docs (AGENT-GUIDE, DEPENDENCIES)
- **Planning**: 24 docs (00-23)
- **Roadmap**: 3 docs (progress-tracker, phase-gates, sprint-overview)
- **Reference**: 4 docs (conventions, glossary, tech-decisions, troubleshooting)

**Total**: 33 structured documents
