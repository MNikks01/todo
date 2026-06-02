# Observability (docs/monitoring.md): CloudWatch log group, EMF-derived metric
# alarms, log-based metric filters for security signals, an SNS topic for alerts,
# and a dashboard. Alarms publish to SNS → email.

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.60" }
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/todo/${var.environment}/api"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# --- Alerting ---
resource "aws_sns_topic" "alerts" {
  name = "${var.name}-alerts"
  tags = var.tags
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alert_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# --- Log-based metric filters (security signals not emitted as EMF) ---
resource "aws_cloudwatch_log_metric_filter" "auth_failures" {
  name           = "${var.name}-auth-failures"
  log_group_name = aws_cloudwatch_log_group.api.name
  # Matches the AuthFailure EMF metric lines.
  pattern = "{ $.metric = \"AuthFailure\" }"
  metric_transformation {
    name          = "AuthFailureLogged"
    namespace     = "Todo/API"
    value         = "1"
    default_value = "0"
  }
}

# --- Alarms (EMF metrics in the Todo/API namespace) ---
resource "aws_cloudwatch_metric_alarm" "high_5xx" {
  alarm_name          = "${var.name}-high-5xx"
  alarm_description   = "5xx error rate elevated (docs/monitoring.md §4)"
  namespace           = "Todo/API"
  metric_name         = "Errors"
  dimensions          = { service = "todo-api", env = var.environment }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = var.error_5xx_threshold
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "high_latency" {
  alarm_name          = "${var.name}-high-latency-p-avg"
  alarm_description   = "Average request latency above target"
  namespace           = "Todo/API"
  metric_name         = "Latency"
  dimensions          = { service = "todo-api", env = var.environment }
  extended_statistic  = "p95"
  period              = 300
  evaluation_periods  = 2
  threshold           = var.latency_p95_ms
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "auth_failure_spike" {
  alarm_name          = "${var.name}-auth-failure-spike"
  alarm_description   = "Possible credential-stuffing (docs/security.md §2.5)"
  namespace           = "Todo/API"
  metric_name         = "AuthFailureLogged"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = var.auth_failure_threshold
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  tags                = var.tags
}

# --- Dashboard ---
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = var.name
  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric", x = 0, y = 0, width = 12, height = 6,
        properties = {
          title  = "Request rate & errors",
          region = var.region,
          stat   = "Sum",
          period = 300,
          metrics = [
            ["Todo/API", "RequestCount", "service", "todo-api", "env", var.environment],
            ["Todo/API", "Errors", "service", "todo-api", "env", var.environment],
          ],
        },
      },
      {
        type = "metric", x = 12, y = 0, width = 12, height = 6,
        properties = {
          title  = "Latency p50/p95/p99",
          region = var.region,
          period = 300,
          metrics = [
            ["Todo/API", "Latency", "service", "todo-api", "env", var.environment, { stat = "p50" }],
            ["Todo/API", "Latency", "service", "todo-api", "env", var.environment, { stat = "p95" }],
            ["Todo/API", "Latency", "service", "todo-api", "env", var.environment, { stat = "p99" }],
          ],
        },
      },
      {
        type = "metric", x = 0, y = 6, width = 12, height = 6,
        properties = {
          title  = "Security: auth failures & refresh reuse",
          region = var.region,
          stat   = "Sum",
          period = 300,
          metrics = [
            ["Todo/API", "AuthFailure", "service", "todo-api", "env", var.environment],
            ["Todo/API", "RefreshReuseDetected", "service", "todo-api", "env", var.environment],
          ],
        },
      },
    ]
  })
}
