# ADR-0009: ECS Fargate for the Production-HA Topology

- **Status:** Accepted
- **Date:** 2026-06-02
- **Deciders:** Architect, AWS, DevOps
- **Context tags:** infra

## Context

ADR-0004 chose a single EC2 + Docker host for the cheapest tier and named **ECS Fargate** as the documented future HA migration. Phase 10 authors that production topology: multi-AZ, no single host, zero-downtime deploys, and a managed control plane — without taking on Kubernetes' operational weight.

## Decision

Run the API as an **ECS Fargate service** (2+ tasks, target-tracking autoscaling on CPU) in **private subnets** across 2 AZs, behind an **ALB** (ACM TLS, HTTP→HTTPS) with **WAF** (managed rule groups + rate limiting). Tasks pull images from ECR and read secrets from Secrets Manager (native ECS secret injection). Deploys are rolling with the **deployment circuit breaker + auto-rollback**. The SPA stays on S3+CloudFront.

## Options Considered

1. **ECS Fargate (chosen)** — _Pro:_ no servers to patch, native ALB/secrets/logs integration, simple autoscaling, rolling deploy + rollback built in, cheaper/simpler than EKS. _Con:_ less control than EC2; per-task cost > raw EC2.
2. **EC2 Auto Scaling Group + Docker** — _Pro:_ cheapest at scale, full control. _Con:_ AMI/patching, user-data drift, more ops; reuses less of AWS's managed glue.
3. **EKS (Kubernetes)** — _Pro:_ portable, powerful. _Con:_ large operational + cognitive overhead; a learning anti-goal for this project's scale.

## Consequences

- Positive: HA across AZs, zero-downtime rolling deploys with automatic rollback, autoscaling, no host management; CD `cd-prod` switches from SSM-on-EC2 to `aws ecs update-service` (digest promotion still applies).
- Negative: higher steady-state cost (~$120–200/mo, docs/aws.md §8) and a NAT gateway; the cheap EC2 path (ADR-0004) remains for low-cost/learning.
- Both topologies coexist as Terraform: `environments/dev` (cheap, EC2) and `environments/prod` (HA, ECS) select via their module composition.

## Links

`docs/aws.md` §3; ADR-0004; `infrastructure/terraform/modules/{ecs,alb,network-ha,waf}`.
