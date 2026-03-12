import { describe, it, expect } from 'vitest';
import { Mesh } from '../../components/AgentMesh/logic/Mesh';
import { Agent } from '../../components/AgentMesh/logic/Agent';
import { RuleBasedBrain } from '../../components/AgentMesh/logic/RuleBasedBrain';

describe('AgentMesh E2E Simulation', () => {
  it('should initialize and run a bounded broadcast successfully', async () => {
    const mesh = new Mesh();
    const brain = new RuleBasedBrain();

    // Create test agents
    const devAgent = new Agent('test-dev', 'TestDev', 'Dev', brain, { responsiveness: 1.0 });
    const secAgent = new Agent('test-sec', 'TestSec', 'Sec', brain, { responsiveness: 1.0 });

    mesh.registerAgent(devAgent);
    mesh.registerAgent(secAgent);

    const initialMessage = {
      id: 'test-msg-1',
      senderId: 'test-init',
      timestamp: Date.now(),
      what: 'test broadcast',
      where: 'test-env',
      how: 'verify recursively',
      reasoning: 'ensure mesh handles explicit fields correctly'
    };

    await mesh.broadcast(initialMessage);

    const messages = mesh.getMessages();

    expect(messages.length).toBeGreaterThan(0);
    expect(devAgent.context.history.length).toBeGreaterThan(0);

    // Verify reasoning field exists on responses
    const response = messages.find(m => m.senderId === 'test-dev');
    if (response) {
      expect(response.reasoning).toBeDefined();
    }
  });
});
