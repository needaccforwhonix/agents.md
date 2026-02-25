// scripts/verify_mesh_logic.ts
import { MeshSimulation } from '../components/AgentMesh/logic/MeshSimulation';

// Mock browser environment if needed (for requestAnimationFrame etc if used)
// but MeshSimulation uses setInterval and setTimeout which are Node compatible.

console.log('Starting verification...');

const sim = new MeshSimulation(3);
console.log('Simulation created with 3 agents.');

sim.start();
console.log('Simulation started.');

sim.broadcast({
  id: 'test-1',
  senderId: 'user',
  senderName: 'User',
  content: 'Hello agents, start optimization.',
  timestamp: Date.now(),
  topics: ['optimization', 'performance']
});
console.log('Broadcasted test message.');

// Wait for 5 seconds to let agents interact
setTimeout(() => {
  console.log('Stopping simulation...');
  sim.stop();

  const messages = sim.messages;
  console.log(`Total messages in history: ${messages.length}`);
  messages.forEach(m => {
    console.log(`[${new Date(m.timestamp).toISOString()}] ${m.senderName}: ${m.content.substring(0, 50)}...`);
  });

  const agents = sim.getAgents();
  agents.forEach(a => {
    console.log(`Agent ${a.state.name} energy: ${a.state.params.energy.toFixed(2)}, history: ${a.state.history.length}`);
  });

  if (messages.length > 1) {
    console.log('SUCCESS: Agents interacted.');
    process.exit(0);
  } else {
    console.error('FAILURE: No interaction recorded.');
    process.exit(1);
  }
}, 5000);
