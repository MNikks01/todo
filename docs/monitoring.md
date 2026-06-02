# Monitoring & Observability Strategy

> **Status:** Draft v1.0 · **Owner:** DevOps/SRE · Built on CloudWatch.
> Observability = logs (see `logging.md`) + metrics + traces + health. This doc covers metrics, alarms, dashboards, health checks, and SLOs.

---

## 1. Health Checks

| Endpoint      | Type      | Checks                             | Used by                                  |
| ------------- | --------- | ---------------------------------- | ---------------------------------------- |
| `GET /health` | liveness  | process up, returns 200 fast       | ALB target health, container healthcheck |
| `GET /ready`  | readiness | DB ping, cache ping, config loaded | ALB (gate traffic), deploy verification  |

Failed readiness → instance pulled from rotation, not killed. Failed liveness → restarted.

## 2. Metrics (RED + USE)

**RED (per service):**

- **Rate** — requests/sec (by route, status class)
- **Errors** — 4xx and 5xx rate
- **Duration** — p50/p95/p99 latency

**USE (per host/container):**

- **Utilization** — CPU, memory, event-loop lag
- **Saturation** — DB connection pool usage, request queue depth
- **Errors** — restarts, OOM

**Domain/security metrics:**

- auth failure rate, refresh reuse-detection events, rate-limit rejections, signups, todos created.

Emission: CloudWatch via **EMF** (embedded metric format in logs) or custom metrics API; namespaced `Todo/API`.

## 3. Dashboards

One CloudWatch dashboard **per environment** with widgets:

- Request rate & error rate (stacked by status)
- Latency p50/p95/p99
- Host CPU/mem, event-loop lag
- DB connections & slow queries
- Auth failures & rate-limit hits
- Deploy markers (annotations)

## 4. Alarms → SNS → Email

| Alarm                | Condition                                    | Severity        |
| -------------------- | -------------------------------------------- | --------------- |
| High 5xx rate        | 5xx > 2% over 5 min                          | high            |
| Latency breach       | p95 > 400ms (write)/200ms (read) over 10 min | medium          |
| Host CPU             | > 85% for 10 min                             | medium          |
| Memory               | > 85% / OOM                                  | high            |
| DB connections       | > 80% pool for 5 min                         | high            |
| Auth failure spike   | failures > N/min (possible attack)           | high → security |
| Health check failing | unhealthy targets > 0                        | critical        |
| Disk (if EC2)        | > 85%                                        | medium          |

Routing: critical/high → email (later: PagerDuty/Slack); medium → email digest. **SLO-based alarming only — no alert fatigue.**

## 5. SLOs & Error Budget

| SLI                                  | SLO                          | Window      |
| ------------------------------------ | ---------------------------- | ----------- |
| Availability (non-5xx /health-aware) | 99.5% (cheap) / 99.9% (prod) | 30d rolling |
| Read latency p95                     | < 200ms                      | 30d         |
| Write latency p95                    | < 400ms                      | 30d         |

Error budget breach → freeze feature work, prioritize reliability (documented policy). Defined in `monitoring/slo/`.

## 6. Tracing (forward-looking)

- Reserve `traceId`/`spanId` in logs now.
- Phase 10+: optional OpenTelemetry SDK → CloudWatch / X-Ray for cross-call traces.

## 7. Synthetic Monitoring

- CloudWatch Synthetics canary hitting `/health` and a login canary (non-prod creds) from outside → catches edge/DNS/TLS issues users would see. Definitions in `monitoring/healthchecks/`.

## 8. Verification (MTTD goal < 5 min)

- Game day: inject failure (kill DB, spike errors) and confirm alarm fires + dashboard reflects it within target.
- Confirm logs queryable by `correlationId` during incident.
