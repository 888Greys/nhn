# HNC Backend Plan

## Overview
- Implement a Python 3.11 service that marries LangChain DeepAgents for reasoning/work orchestration with Google ADK for production-grade Gemini execution, compliance, and scaling.
- Expose REST/GraphQL endpoints that mirror the current mocked draft/review APIs consumed by the frontend, backed by DeepAgents-run pipelines deployed through ADK.

## Planned Components
- `agents/`: task pipelines for intake triage, document drafting, and workspace handoff.
- `services/`: connectors for storage (PostgreSQL), document store, and messaging.
- `api/`: FastAPI routers mirroring `draft`, `review-queue`, and `workspace` resources.
- `tests/`: pytest suite covering agent orchestration and API contracts.

## Implementation TODO
- [ ] Scaffold FastAPI project with dependency-injected DeepAgents graphs and ADK Gemini clients.
- [ ] Model intake draft + review queue schemas (SQLAlchemy) and create migration baseline.
- [ ] Implement draft autosave endpoints backed by DeepAgents task runners but executed via ADK tool-calling.
- [ ] Build workspace handoff mutation that triggers DeepAgents workflow orchestrations and delegates execution to ADK jobs/queues.
- [ ] Provide contract tests + mocked clients for frontend integration (Vitest/MSW parity).
