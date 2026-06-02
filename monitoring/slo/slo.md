# SLOs & Error Budgets

Per `docs/monitoring.md` §5. Measured from the `Todo/API` CloudWatch metrics
(emitted as EMF by the backend) over a 30-day rolling window.

| SLI                   | Definition (from metrics)                 | SLO                            | Alarm                                                                 |
| --------------------- | ----------------------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| **Availability**      | `1 - (Errors / RequestCount)` (5xx-based) | 99.5% dev/staging · 99.9% prod | `*-high-5xx` (Errors > 5 / 5 min)                                     |
| **Read latency p95**  | `Latency` p95                             | < 200 ms                       | covered by `*-high-latency-p-avg` (p95 > 400 ms write-tier threshold) |
| **Write latency p95** | `Latency` p95                             | < 400 ms                       | `*-high-latency-p-avg`                                                |

## Error budget

- 99.9% over 30 days ⇒ ~43 min/month of allowed unavailability.
- **Policy:** when the budget is exhausted, feature work pauses and reliability
  work is prioritized until the budget recovers (docs/monitoring.md §5).

## Security SLO-adjacent signals (alarmed, not budgeted)

- `AuthFailure` spike → `*-auth-failure-spike` (possible credential stuffing).
- `RefreshReuseDetected` > 0 → investigate (token theft signal).

## Detection target

MTTD < 5 min — alarms evaluate on 5-minute periods → SNS → email. Validate in a
game day (docs/monitoring.md §8): inject 5xx / auth failures and confirm the
alarm fires and the dashboard reflects it within target.
