import { AgentMesh } from '../components/AgentMesh/logic/AgentMesh';
import { Agent } from '../components/AgentMesh/logic/Agent';
import { RuleBasedBrain } from '../components/AgentMesh/logic/Brain';
import { Message } from '../components/AgentMesh/logic/types';

console.log('--- Starting AgentMesh Simulation ---');

const mesh = new AgentMesh();

const a1 = new Agent('a2a-Optimizer', new RuleBasedBrain('a2a-Optimizer'), { temperature: 0.5, mutationRate: 0.1, maxMemoryTokens: 1000 });
const a2 = new Agent('a2a-Security', new RuleBasedBrain('a2a-Security'), { temperature: 0.3, mutationRate: 0.05, maxMemoryTokens: 800 });

mesh.register(a1);
mesh.register(a2);

const initialMessage: Message = {
  id: crypto.randomUUID(),
  senderId: 'System',
  timestamp: Date.now(),
  what: 'Optimize system architecture and ensure security',
  where: 'Global',
  how: 'analyze and optimize',
};

console.log(`[System] Broadcasting initial message:`, initialMessage);
mesh.broadcast(initialMessage, 0);

// Keep the process alive slightly to let async timers run and capture output
setTimeout(() => {
  console.log('\n--- Simulation Output ---');
  mesh.getHistory().forEach((msg) => {
    console.log(`[${msg.senderId}] ${msg.what} -> ${msg.where} (via ${msg.how})`);
  });
  console.log('--- Simulation Complete ---');
}, 1000);
