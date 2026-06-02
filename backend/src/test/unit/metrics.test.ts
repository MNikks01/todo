import { describe, expect, it } from 'vitest';
import { buildCountMetric, buildRequestMetric } from '../../core/metrics/metrics.js';

describe('EMF metrics', () => {
  it('builds a valid request EMF document', () => {
    const doc = buildRequestMetric({
      method: 'GET',
      route: '/api/v1/todos',
      statusCode: 200,
      durationMs: 42.7,
      now: 1_000,
    });

    const emf = doc._aws.CloudWatchMetrics[0];
    expect(emf?.Namespace).toBe('Todo/API');
    expect(emf?.Dimensions).toEqual([['service', 'env']]);
    expect(emf?.Metrics.map((m) => m.Name)).toEqual(['RequestCount', 'Errors', 'Latency']);
    expect(doc._aws.Timestamp).toBe(1_000);
    expect(doc.RequestCount).toBe(1);
    expect(doc.Errors).toBe(0);
    expect(doc.Latency).toBe(43); // rounded
    expect(doc.statusCode).toBe(200);
  });

  it('flags 5xx as an error', () => {
    const doc = buildRequestMetric({ method: 'POST', route: '/x', statusCode: 500, durationMs: 1 });
    expect(doc.Errors).toBe(1);
  });

  it('does not flag 4xx as a server error', () => {
    const doc = buildRequestMetric({ method: 'POST', route: '/x', statusCode: 404, durationMs: 1 });
    expect(doc.Errors).toBe(0);
  });

  it('builds a named counter metric with properties', () => {
    const doc = buildCountMetric('AuthFailure', 1, { locked: true }, 2_000);
    const emf = doc._aws.CloudWatchMetrics[0];
    expect(emf?.Metrics).toEqual([{ Name: 'AuthFailure', Unit: 'Count' }]);
    expect(doc.AuthFailure).toBe(1);
    expect(doc.locked).toBe(true);
    expect(doc._aws.Timestamp).toBe(2_000);
  });
});
