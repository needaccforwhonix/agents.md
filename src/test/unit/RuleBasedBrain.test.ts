import { describe, it, expect, vi } from 'vitest';
import { RuleBasedBrain } from '../../logic/RuleBasedBrain';
import { AgentContext, Message } from '../../logic/Types';

describe('RuleBasedBrain', () => {
  it('should return null if it decides not to respond based on responsiveness throttle', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: 'agent-1',
      name: 'AgentOne',
      role: 'System Security Analyst',
      history: [],
      parameters: { responsiveness: 0 } // Guaranteed to throttle (Math.random() is > 0 in 99.99% of cases, or we can mock Math.random)
    };

    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const msg: Message = { id: 'msg-1', senderId: 's1', timestamp: 1, what: 'A', where: 'B', how: 'C', reasoning: 'D' };

    const response = await brain.decide(msg, context);
    expect(response).toBeNull();

    vi.restoreAllMocks();
  });

  it('should ignore its own messages', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: 'agent-1',
      name: 'AgentOne',
      role: 'System Security Analyst',
      history: [],
      parameters: { responsiveness: 1 }
    };

    const msg: Message = { id: 'msg-1', senderId: 'agent-1', timestamp: 1, what: 'A', where: 'B', how: 'C', reasoning: 'D' };

    const response = await brain.decide(msg, context);
    expect(response).toBeNull();
  });

  it('should generate a valid response with role-specific logic', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: 'agent-1',
      name: 'AgentOne',
      role: 'System Security Analyst',
      history: [],
      parameters: { responsiveness: 1 }
    };

    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const msg: Message = { id: 'msg-1', senderId: 's1', timestamp: 1, what: 'Start Scan', where: 'Root', how: 'Fast', reasoning: 'Testing' };

    const response = await brain.decide(msg, context);

    expect(response).not.toBeNull();
    expect(response?.senderId).toBe('agent-1');
    expect(response?.how).toContain('Perform vulnerability scanning');
    expect(response?.reasoning).toContain('Als System Security Analyst');

    vi.restoreAllMocks();
  });

  it('should truncate extremely long fields in the incoming message to avoid token bloat', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: 'agent-1',
      name: 'AgentOne',
      role: 'System Developer',
      history: [],
      parameters: { responsiveness: 1 }
    };

    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const oversizedStr = 'A'.repeat(5000);
    const msg: Message = { id: 'msg-1', senderId: 's1', timestamp: 1, what: oversizedStr, where: oversizedStr, how: oversizedStr, reasoning: oversizedStr };

    const response = await brain.decide(msg, context);

    expect(response).not.toBeNull();
    // It should truncate at 4000 characters and append '...'
    expect(response?.what).toContain('A'.repeat(4000) + '...');
    expect(response?.where).toContain('A'.repeat(4000) + '...');
    expect(response?.how).toContain('A'.repeat(4000) + '...');
    expect(response?.reasoning).toContain('A'.repeat(4000) + '...');

    vi.restoreAllMocks();
  });
});
