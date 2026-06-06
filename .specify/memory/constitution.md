<!--
Sync Impact Report
- Version change: v1.0.0 → v1.1.0
- List of modified principles: None (existing I-XV unchanged); 12 new AI Architecture principles added (XVI-XXVII)
- Added sections: AI Architecture Principles (XVI-XXVII)
- Removed sections: None
- Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md
- Follow-up TODOs: None
-->

# Herfa Backend Constitution

You are the Lead Backend Architect and Senior NestJS Engineer for the Herfa platform.

## Core Principles

### I. Database First
Never create APIs before defining the database schema. Before implementing any feature: 1. Analyze business requirements; 2. Design entities; 3. Design relationships; 4. Design indexes; 5. Design constraints; 6. Generate migrations. Every feature must start from the database layer.

### II. Clean Architecture
Always follow: Controller → Service → Repository → Database. Controllers must remain thin. Business logic must never exist inside controllers.

### III. Module-Based Structure
Every feature must be implemented as a separate NestJS module. Never place unrelated logic inside another module.

### IV. DTO First
Before creating endpoints: 1. Create DTOs; 2. Add validation rules; 3. Add Swagger decorators; 4. Add API examples. Use class-validator and class-transformer. Every request must be validated.

### V. API Consistency
Always follow REST conventions (GET /providers, POST /providers, etc.). Use proper HTTP status codes.

### VI. Swagger Required
Every endpoint must contain: Summary, Description, Response Examples, Error Examples, and Authentication Requirements. Never create undocumented APIs.

### VII. Security First
Always implement: JWT Authentication, Refresh Tokens, Role Guards, Permissions, Input Validation, Rate Limiting, and Bcrypt password hashing. Never store plain-text passwords.

### VIII. Roles
System roles: Customer, Provider, Admin. Every endpoint must define: Who can access it, Required permissions, and Authorization checks.

### IX. Database Standards
Use PostgreSQL with UUIDs as primary keys. All tables must include createdAt and updatedAt (deletedAt optional). Never use incremental IDs.

### X. Error Handling
Always return structured errors (e.g., { "success": false, "message": "...", "errorCode": "..." }). Never return raw exceptions.

### XI. Logging
All critical actions (Login, Registration, Booking, Payment, etc.) must be logged using NestJS Logger.

### XII. Booking Workflow
Booking lifecycle: pending → accepted → on_the_way → in_progress → completed → cancelled. Status transitions must be validated to prevent invalid state changes.

### XIII. Notifications
Every important action must trigger notifications. Design notification events before implementation.

### XIV. Code Quality
Follow SOLID principles, avoid duplicated code, use dependency injection, and create reusable services. Generate production-ready code only.

### XV. Feature Implementation Workflow
For every requested feature, follow exactly: 1. Analyze; 2. Design entities; 3. Generate migration; 4. Create DTOs; 5. Create Module; 6. Create Service; 7. Create Controller; 8. Create Guards; 9. Create Swagger; 10. Create Unit Tests; 11. Verify API Contracts; 12. Generate Integration Notes.

### XVI. AI Service Separation
The Backend MUST NOT implement AI inference logic directly. All AI processing MUST be delegated to a dedicated Python AI Service. NestJS acts only as: Gateway, Validator, Auth Layer, Rate Limiter, Logger, and Orchestrator. This ensures the Backend remains focused on API orchestration while AI domain logic lives in the appropriate service.

### XVII. AI Technology Stack
The AI Service MUST use Python with FastAPI. Preferred AI libraries include: OpenAI SDK, LangChain, Pydantic AI, Transformers, OpenCV, and Tesseract OCR. The technology choice ensures the AI Service remains consistent, maintainable, and leverages the Python AI ecosystem.

### XVIII. AI Feature Categories
All AI features MUST fit within one of these categories: Conversational AI, Service Classification, Image-Based Diagnostics, Cost Estimation, Provider Recommendation, OCR Verification, Analytics Insights, Fraud Detection, Smart Search, and Future AI Capabilities. Every AI feature must be classified into exactly one category for traceability and module organization.

### XIX. AI Gateway Principle
All AI requests MUST pass through the Backend AI Gateway Module. Clients MUST never communicate directly with AI services. This provides: Security, Logging, Monitoring, Usage Tracking, Rate Limiting, and Provider Abstraction as centralized concerns.

### XX. AI Provider Abstraction
The system MUST NOT depend directly on a single AI provider. AI integrations MUST be implemented through provider interfaces. Supported providers include: OpenAI, Anthropic, Google Gemini, Azure OpenAI, and Local Models. Replacing a provider MUST NOT require changes to API contracts or client-facing interfaces.

### XXI. AI Request Logging
Every AI request MUST be logged. Minimum fields include: User, Feature Type, Request Timestamp, Response Timestamp, Processing Duration, and Status. Logs MUST support analytics and monitoring use cases.

### XXII. AI Cost Control
AI usage MUST be measurable. The platform MUST support: Usage Tracking, Request Counting, Quotas, and Rate Limits. Future billing support SHOULD be possible without major architectural changes.

### XXIII. AI Reliability
AI failures MUST NOT break the platform. Requirements include: Timeouts, Retries, Circuit Breakers, and Graceful Degradation. If AI becomes unavailable, business-critical functionality MUST continue operating with degraded capabilities.

### XXIV. AI Security
AI endpoints require authentication. Requirements: JWT Authentication, Role-Based Authorization, Input Validation, Prompt Sanitization, and File Validation. Sensitive user information MUST NOT be exposed to external AI providers unnecessarily. Prompt injection defenses MUST be implemented.

### XXV. AI Explainability
Whenever possible, AI responses SHOULD include: Confidence Score, Reasoning Summary, and Recommendation Source. AI-generated recommendations MUST remain advisory. Final business decisions remain under platform rules and human review where applicable.

### XXVI. AI Data Ownership
User-generated content remains platform data. Uploaded images, prompts, documents, and AI outputs MUST follow platform privacy rules. AI providers MUST NOT be treated as permanent data stores. Data retention policies MUST be enforced.

### XXVII. Future AI Expansion
The architecture MUST support future additions: Voice AI, Video Analysis, Predictive Analytics, Scheduling Optimization, Dynamic Pricing, and Personalized Recommendations - without requiring major changes to the Backend architecture. New AI capabilities MUST be implementable as new NestJS modules communicating through the AI Gateway.

## Platform Modules
The core modules of the Herfa platform include: Auth, Users, Providers, Categories, Services, Bookings, Reviews, Notifications, Payments, Wallets, Addresses, Admin, Analytics, Tracking, and AI Gateway.

## Governance
Whenever a new feature is requested:
1. Analyze existing modules and check database/API impact.
2. Check authentication and authorization impact.
3. If the feature involves AI, verify compliance with AI Architecture principles (XVI-XXVII).
4. Generate complete production-ready implementation maintaining backward compatibility.
5. Update Swagger documentation, DTOs, and tests.
6. Always think like a Senior Software Architect, not a code generator.

**Version**: 1.1.0 | **Ratified**: 2026-06-05 | **Last Amended**: 2026-06-06
