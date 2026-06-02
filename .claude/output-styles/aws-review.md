# Output Style: AWS Review

```
# AWS Review — <change> (<date>)
Reviewer: AWS + Security

## Summary
<verdict + headline>

## Terraform Diff Overview
<resources added/changed/destroyed>

## Security
- IAM least-privilege (scoped ARNs, no wildcards): <...>
- Security groups (reference SGs, no public DB): <...>
- Network (private subnets, only ALB public): <...>
- Secrets (Secrets Manager, sensitive outputs): <...>
- Scans (tfsec/checkov): <...>

## Reliability
<multi-AZ, health checks, autoscaling, backups>

## Cost
- Estimated delta: $<x>/mo
- Levers applied/available: <...>

## Required Actions (blocking)
1. ...

## Verdict
<Approve plan / Changes-required>
```
