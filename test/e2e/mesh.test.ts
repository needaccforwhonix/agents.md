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
      expect(response.reasoning).toContain('Evolved Parameters:');
      expect(response.reasoning).toContain('generation');
    }
  });

  it('should drop messages that exceed token limits', async () => {
    const mesh = new Mesh(5); // Arbitrary small limit
    const brain = new RuleBasedBrain();
    const devAgent = new Agent('test-dev', 'TestDev', 'Dev', brain, { responsiveness: 1.0 });

    mesh.registerAgent(devAgent);

    // Create a message that is intentionally too large in one of its fields.
    // Assuming 2000 max tokens which is roughly 8000 characters.
    const massiveString = "a".repeat(10000);

    const oversizedMessage = {
      id: 'oversized-msg',
      senderId: 'test-init',
      timestamp: Date.now(),
      what: massiveString, // Exceeds limit
      where: 'test-env',
      how: 'verify token bounds',
      reasoning: 'ensure mesh drops oversized messages'
    };

    await mesh.broadcast(oversizedMessage);

    const messages = mesh.getMessages();
    // The message is still added to the history so it exists in messages array
    expect(messages.length).toBeGreaterThan(0);

    // But it should be dropped during agent processing due to validateMessageBounds
    // Meaning the devAgent does NOT receive it or respond to it
    const responses = messages.filter(m => m.senderId === 'test-dev');
    expect(responses.length).toBe(0);
  });
});
