# Output Style: Security Review

```
# Security Review — <scope> (<date>)
Reviewer: Security | Risk level: <low/med/high>

## Summary
<verdict + headline risks>

## Attack Surface Delta
<new endpoints, inputs, data, network exposure, deps>

## Controls Check
- AuthN: <pass/fail>
- AuthZ (RBAC): <...>
- Ownership enforcement: <...>
- Input validation (Zod) + sanitization: <...>
- Rate limiting: <...>
- Secrets handling: <...>
- Log redaction (no PII/secrets): <...>
- Error leakage: <...>
- Headers/CORS/TLS: <...>
- Dependency/SAST scans: <...>

## OWASP Top 10 Mapping
<relevant items + status>

## Findings (severity-ranked)
| # | Severity | Issue | Location | Required fix |
|---|---|---|---|---|

## Required Actions (blocking)
1. ...

## Verdict
<Pass / Pass-with-fixes / Fail>
```
