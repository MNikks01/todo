# ADR-0004: EC2 + Docker for Cheap Tier, ECS Fargate as Future Migration

- **Status:** Accepted
- **Date:** 2026-06-02
- **Deciders:** Architect, AWS, DevOps
- **Context tags:** infra

## Context

Two competing goals: run for ~$15–25/mo for learning, and exercise a credible production-grade path. Compute choice drives most cost and ops complexity.

## Decision

Default to a **single EC2 (Graviton `t4g.small`) running Docker Compose** (API + Caddy TLS) for the cheapest tier. Document and keep ready an **ECS Fargate** topology (ALB + autoscaling + private subnets) as the production-HA migration, selectable via Terraform variables/workspaces.

## Options Considered

1. **EC2+Docker cheap, ECS future (chosen)** — _Pro:_ cheapest viable now, clean upgrade path, learn both. _Con:_ cheap tier is single-AZ SPOF.
2. **ECS Fargate from day one** — _Pro:_ HA, less server mgmt. _Con:_ ALB + NAT + tasks ≈ $120–200/mo, over budget for learning.
3. **Lambda/serverless** — _Con:_ reshapes the app (cold starts, Express adapter), distracts from the chosen architecture goals.

## Consequences

- Positive: minimal spend now; documented, low-friction path to HA.
- Negative: cheap tier SPOF mitigated by DR plan (fast IaC rebuild, backups).
- Revisit trigger: uptime/HA requirement or sustained load → execute Topology B (Phase 10).

## Links

`docs/aws.md` §2–§3; `docs/architecture.md` §10, §14.
