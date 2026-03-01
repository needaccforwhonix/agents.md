import { AgentState, Brain, Message } from './types';
import { RuleBasedBrain } from './RuleBasedBrain';

export class Simulation {
  private agents: AgentState[] = [];
  private brains: Map<string, Brain> = new Map();
  private messages: Message[] = [];
  private onStateChange: (agents: AgentState[], messages: Message[]) => void;

  constructor(onStateChange: (agents: AgentState[], messages: Message[]) => void) {
    this.onStateChange = onStateChange;
  }

  // Add an agent to the mesh
  addAgent(name: string) {
    const id = crypto.randomUUID();
    const params = {
      alpha: 1.0,
      beta: 1.0,
      gamma: Math.random(),
    };

    const newState: AgentState = {
      id,
      name,
      tokenCount: 0,
      params,
    };

    this.agents.push(newState);
    this.brains.set(id, new RuleBasedBrain());
    this.notify();
  }

  // AlphaEvolve: Parameter mutation algorithm
  alphaEvolve(agentId: string) {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) {
      // Simulate evolution by tweaking parameters with some randomness
      // This represents learning and adapting over time
      agent.params.alpha = Math.max(0.1, agent.params.alpha + (Math.random() - 0.5) * 0.2);
      agent.params.beta = Math.max(0.1, agent.params.beta + (Math.random() - 0.5) * 0.2);
      agent.params.gamma = Math.min(1.0, Math.max(0.0, agent.params.gamma + (Math.random() - 0.5) * 0.2));

      this.notify();
    }
  }

  // A2A Broadcast Architecture: Every output is an input for everyone
  broadcast(message: Message) {
    // Keep message history bounded to prevent memory leaks
    if (this.messages.length > 500) {
      this.messages = this.messages.slice(-499);
    }

    this.messages.push(message);

    // Process this message for all agents
    const newResponses: Message[] = [];

    for (const agent of this.agents) {
      const brain = this.brains.get(agent.id);
      if (brain) {
        // Evaluate the input and generate a response based on context and reasoning
        const response = brain.processInput(message, agent);
        if (response) {
          newResponses.push(response);
          // Evolve slightly when generating a successful response
          this.alphaEvolve(agent.id);
        }
      }
    }

    this.notify();

    // Recursively broadcast the new responses with a slight delay to avoid
    // blocking the main thread and simulate asynchronous processing
    if (newResponses.length > 0) {
      setTimeout(() => {
        // Enforce a strict decay/cooling mechanism. As the network gets busier,
        // limit the number of recursive responses to prevent exponential blowup.
        const throttleLimit = this.messages.length > 50 ? 1 : 2;
        const limitedResponses = newResponses.slice(0, throttleLimit);
        for (const response of limitedResponses) {
          this.broadcast(response);
        }
      }, 1500 + Math.random() * 1000); // Add jitter to the delay
    }
  }

  private notify() {
    // Pass a copy to avoid reference issues in React
    this.onStateChange([...this.agents], [...this.messages]);
  }
}
