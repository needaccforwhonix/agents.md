import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MeshSimulation } from '../MeshSimulation';

describe('MeshSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with agents', () => {
    const simulation = new MeshSimulation(3);
    expect(simulation.getAgents()).toHaveLength(3);
    expect(simulation.isRunning).toBe(false);
  });

  it('should broadcast messages', () => {
    const simulation = new MeshSimulation(3);
    const message = {
        id: 'msg-1',
        senderId: 'system',
        senderName: 'System',
        content: 'Test',
        timestamp: Date.now(),
        topics: ['test']
    };
    simulation.broadcast(message);
    expect(simulation.messages).toContain(message);
  });

  it('should start and stop', () => {
    const simulation = new MeshSimulation(1);
    simulation.start();
    expect(simulation.isRunning).toBe(true);
    simulation.stop();
    expect(simulation.isRunning).toBe(false);
  });
});
