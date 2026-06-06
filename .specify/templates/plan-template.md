# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: NestJS / Node.js

**Primary Dependencies**: TypeORM, class-validator, class-transformer, @nestjs/swagger

**Storage**: PostgreSQL (UUID primary keys)

**Testing**: Jest (Unit & Integration)

**Target Platform**: Backend API

**Project Type**: Web-service (NestJS Modules)

**Performance Goals**: [e.g., <200ms p95 response time]

**Constraints**: REST conventions, UUIDs only, Bcrypt hashing, AI request logging

**Scale/Scope**: Herfa Platform (Customer/Provider Marketplace)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] P1: Database schema defined?
- [ ] P2: Clean Architecture followed (Controller -> Service -> Repository)?
- [ ] P3: Dedicated NestJS module planned?
- [ ] P4/P6: DTOs & Swagger decorators included?
- [ ] P7/P8: JWT/Roles/Guards identified?
- [ ] P9: PostgreSQL UUIDs & Timestamps included?
- [ ] P10/P11: Structured Errors & Logging planned?
- [ ] P15: All 12 workflow steps accounted for?
- [ ] P16: AI Service Separation respected (no AI inference in Backend)?
- [ ] P19: AI Gateway Module planned for AI requests?
- [ ] P20: AI Provider abstraction pattern used?
- [ ] P21/P22: AI logging and cost control requirements defined?
- [ ] P23: Timeouts/retries/circuit breakers for AI calls?
- [ ] P24: AI endpoint authentication and input validation in place?

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
