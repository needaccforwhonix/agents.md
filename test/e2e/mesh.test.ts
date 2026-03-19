import { describe, it, expect } from 'vitest';
import { Mesh } from '../../components/AgentMesh/logic/Mesh';
import { Agent } from '../../components/AgentMesh/logic/Agent';
import { RuleBasedBrain } from '../../components/AgentMesh/logic/RuleBasedBrain';
import { analyzeCodeBlock, extractCodeBlocks } from '../../components/AgentMesh/logic/AST';

describe('AgentMesh AST Demock Parsing', () => {
  it('should flag dummy strings, mock identifiers, and empty functions correctly', () => {
    const codeWithDummyString = `const data = "this is a dummy test";`;
    const res1 = analyzeCodeBlock(codeWithDummyString);
    expect(res1.isValid).toBe(false);
    expect(res1.errors.some(e => e.includes("mock string detected"))).toBe(true);

    const codeWithMockIdentifier = `const mock_function = () => { return true; };`;
    const res2 = analyzeCodeBlock(codeWithMockIdentifier);
    expect(res2.isValid).toBe(false);
    expect(res2.errors.some(e => e.includes("Mock identifier"))).toBe(true);

    const codeWithEmptyFunc = `function test() {}`;
    const res3 = analyzeCodeBlock(codeWithEmptyFunc);
    expect(res3.isValid).toBe(false);
    expect(res3.errors.some(e => e.includes("Empty function body"))).toBe(true);

    const validCode = `function calculateSum(a: number, b: number) { return a + b; }`;
    const res4 = analyzeCodeBlock(validCode);
    expect(res4.isValid).toBe(true);
    expect(res4.errors.length).toBe(0);
  });

  it('should extract code blocks properly', () => {
    const message = "Here is the code:\\n```typescript\\nconst a = 1;\\n```\\nDone.";
    const blocks = extractCodeBlocks(message);
    expect(blocks.length).toBe(1);
    expect(blocks[0].replace(/\\n/g, '').trim()).toBe("const a = 1;");
  });
});

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
