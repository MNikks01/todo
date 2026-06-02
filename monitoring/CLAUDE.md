# monitoring/CLAUDE.md

## Purpose

Observability-as-code: CloudWatch dashboards, alarm definitions, SLOs, and synthetic health checks. Companion to `docs/monitoring.md` and `docs/logging.md`.

## Structure

- `dashboards/` — CloudWatch dashboard JSON (per env).
- `alarms/` — alarm definitions (also expressed in `terraform/observability`).
- `slo/` — SLO + error-budget definitions.
- `healthchecks/` — synthetic canary definitions (`/health`, login canary).

## Responsibilities

- Define RED/USE + security metrics, dashboards, SLO-based alarms → SNS.
- Keep alarms actionable (no alert fatigue); document thresholds + rationale.

## Dependencies

CloudWatch, SNS, CloudWatch Synthetics. Provisioned via Terraform (`infrastructure/terraform/modules/observability`).

## Coding Rules

- Alarms are **SLO-based**; every alarm has an owner + runbook link.
- No PII/secrets in dashboards or synthetic scripts (use non-prod canary creds).
- Changes versioned and reviewed (Monitoring agent).

## Testing Requirements

Validate via game day: inject failure, confirm alarm fires and dashboard reflects it within MTTD < 5 min (`docs/monitoring.md` §8).
