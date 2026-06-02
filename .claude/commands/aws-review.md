---
name: aws-review
description: Review AWS/Terraform changes for correctness, security, and cost.
---

# /aws-review

**Purpose:** Vet infrastructure changes before apply.

**Inputs:** Terraform diff / proposed topology change.

**Agent:** AWS (lead) + Security (for IAM/SG/exposure).

**Steps**

1. Review `terraform plan` diff; confirm IaC-only (no click-ops).
2. Check least-privilege IAM (scoped ARNs, no wildcards), SG rules (reference SGs, no public DB), private subnets.
3. Run `tfsec`/`checkov`; review findings.
4. Estimate cost delta; confirm within budget; note levers.
5. Confirm diagrams/runbooks/ADR updated.

**Output style:** [aws-review](../output-styles/aws-review.md).

**Example:** `/aws-review migrate to ECS Fargate`.
