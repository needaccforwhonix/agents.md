import { describe, it, expect } from 'vitest';
import { AgentMesh } from '../../components/AgentMesh/logic/AgentMesh';
import { Agent } from '../../components/AgentMesh/logic/Agent';
import { RuleBasedBrain } from '../../components/AgentMesh/logic/Brain';
import { Message } from '../../components/AgentMesh/logic/types';

describe('AgentMesh E2E Simulation', () => {
  it('runs a full broadcast loop with constraints', () => {
    const mesh = new AgentMesh();
    const a1 = new Agent('a1', new RuleBasedBrain('a1'), { temperature: 0.5, mutationRate: 0.1, maxMemoryTokens: 1000 });
    mesh.register(a1);

    const initMsg: Message = {
      id: 'init-1',
      senderId: 'User',
      timestamp: Date.now(),
      what: 'Analyze the system',
      where: 'src/',
      how: 'optimize and fix bugs',
      reasoning: 'Initial request'
    };

    mesh.broadcast(initMsg);

    // We expect the history to contain the initial message and at least one response
    expect(mesh.getHistory().length).toBeGreaterThanOrEqual(1);

    // Ensure history bounded
    for(let i = 0; i < 200; i++) {
        mesh.broadcast({
            id: `init-${i}`,
            senderId: 'User',
            timestamp: Date.now(),
            what: 'Spam',
            where: 'Spam',
            how: 'Spam',
            reasoning: 'Spam'
        });
    }
    expect(mesh.getHistory().length).toBeLessThanOrEqual(100); // the maxHistorySize
  });
});
