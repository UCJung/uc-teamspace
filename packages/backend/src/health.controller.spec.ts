import { describe, test, expect } from 'bun:test';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  test('check returns ok status', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});
