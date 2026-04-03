import { Simulation } from '../components/AgentMesh/logic/Simulation';
import { Agent } from '../components/AgentMesh/logic/Agent';

/**
 * Headless background script to run the Agent Mesh simulation for extended periods.
 */
async function runMesh() {
  const messageLimit = parseInt(process.env.MESSAGE_LIMIT || '50', 10);
  console.log(`Starting headless Agent Mesh Simulation (Limit: ${messageLimit} messages)...`);

  const simulation = new Simulation({
    maxHistorySize: 200,
    throttleMs: 100, // Faster in headless
    maxConsecutiveResponses: 10
  });

  let messageCount = 0;

  simulation.setCallbacks(
    (history) => {
      // Just track the latest addition
      messageCount = history.length;
      if (history.length > 0) {
        const latest = history[history.length - 1];
        console.log(`[${new Date(latest.timestamp).toISOString()}] ${latest.senderId}: ${latest.what}`);
      }

      if (messageCount >= messageLimit) {
        console.log(`Reached message limit of ${messageLimit}. Stopping simulation.`);
        simulation.stop();
        process.exit(0);
      }
    },
    () => {} // Ignore agent updates in headless mode
  );

  const a1 = new Agent('agent-1', 'Alpha-Node');
  const a2 = new Agent('agent-2', 'Beta-Node');

  simulation.registerAgent(a1);
  simulation.registerAgent(a2);

  await simulation.start();

  // Keep process alive until limit is reached
  setInterval(() => {
     if (messageCount >= messageLimit) {
        process.exit(0);
     }
  }, 1000);
}

runMesh().catch(console.error);
