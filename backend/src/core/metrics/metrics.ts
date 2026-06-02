/**
 * CloudWatch EMF metrics (docs/monitoring.md §2). We emit metrics as structured
 * log lines in the Embedded Metric Format; CloudWatch extracts them into the
 * `Todo/API` namespace — no metrics API calls, works through stdout→CloudWatch.
 *
 * Dimensions are kept low-cardinality ([service, env]); high-cardinality context
 * (route, statusCode) rides along as properties for Logs Insights, not metrics.
 */
import { config } from '../../config/env.js';
import { logger } from '../logger/logger.js';

const NAMESPACE = 'Todo/API';

export interface MetricDefinition {
  Name: string;
  Unit: 'Count' | 'Milliseconds';
}

export interface EmfDocument {
  _aws: {
    Timestamp: number;
    CloudWatchMetrics: Array<{
      Namespace: string;
      Dimensions: string[][];
      Metrics: MetricDefinition[];
    }>;
  };
  [key: string]: unknown;
}

/**
 * Build an EMF document for a finished HTTP request. Pure (testable); the caller
 * logs it. RequestCount/Errors/Latency at the service level give RED metrics.
 */
export function buildRequestMetric(input: {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  now?: number;
}): EmfDocument {
  const isError = input.statusCode >= 500 ? 1 : 0;
  return {
    _aws: {
      Timestamp: input.now ?? Date.now(),
      CloudWatchMetrics: [
        {
          Namespace: NAMESPACE,
          Dimensions: [['service', 'env']],
          Metrics: [
            { Name: 'RequestCount', Unit: 'Count' },
            { Name: 'Errors', Unit: 'Count' },
            { Name: 'Latency', Unit: 'Milliseconds' },
          ],
        },
      ],
    },
    service: 'todo-api',
    env: config.NODE_ENV,
    metric: 'http.request',
    method: input.method,
    route: input.route,
    statusCode: input.statusCode,
    RequestCount: 1,
    Errors: isError,
    Latency: Math.round(input.durationMs),
  };
}

/** Build a single named counter metric (e.g. security events). Pure. */
export function buildCountMetric(
  name: string,
  value = 1,
  properties: Record<string, unknown> = {},
  now?: number,
): EmfDocument {
  return {
    _aws: {
      Timestamp: now ?? Date.now(),
      CloudWatchMetrics: [
        {
          Namespace: NAMESPACE,
          Dimensions: [['service', 'env']],
          Metrics: [{ Name: name, Unit: 'Count' }],
        },
      ],
    },
    service: 'todo-api',
    env: config.NODE_ENV,
    metric: name,
    ...properties,
    [name]: value,
  };
}

export function recordRequest(input: {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
}): void {
  logger.info('metric', buildRequestMetric(input));
}

/** Emit a named counter (e.g. AuthFailure, RefreshReuseDetected). */
export function incrementMetric(name: string, properties: Record<string, unknown> = {}): void {
  logger.info('metric', buildCountMetric(name, 1, properties));
}
