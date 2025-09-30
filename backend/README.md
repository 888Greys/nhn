# HNC Backend Plan

## Overview
- Implement Python 3.11 service using DeepAgents + ADK workflows to orchestrate intake processing, document generation, and review routing.
- Expose REST/GraphQL endpoints that mirror the current mocked draft/review APIs consumed by the frontend.

## Planned Components
- `agents/`: task pipelines for intake triage, document drafting, and workspace handoff.
- `services/`: connectors for storage (PostgreSQL), document store, and messaging.
- `api/`: FastAPI routers mirroring `draft`, `review-queue`, and `workspace` resources.
- `tests/`: pytest suite covering agent orchestration and API contracts.

## Implementation TODO
- [ ] Scaffold FastAPI project with dependency-injected DeepAgents runtimes.
- [ ] Model intake draft + review queue schemas (SQLAlchemy) and create migration baseline.
- [ ] Implement draft autosave endpoints with optimistic locking + activity logging.
- [ ] Build workspace handoff mutation invoking ADK pipelines and queue notifications.
- [ ] Provide contract tests + mocked clients for frontend integration (Vitest/MSW parity).
