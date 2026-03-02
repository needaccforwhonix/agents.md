import { Agent } from './Agent';
import { AgentMessage, SimulationConfig } from './Types';

export class Simulation {
  private agents: Map<string, Agent> = new Map();
  private history: AgentMessage[] = [];
  private config: SimulationConfig;
  private isRunning: boolean = false;

  // Throttle state
  private lastBroadcastTime: number = 0;
  private consecutiveResponses: Map<string, number> = new Map();

  // Callbacks for UI updates
  private onHistoryUpdate: ((history: AgentMessage[]) => void) | null = null;
  private onAgentsUpdate: ((agents: Agent[]) => void) | null = null;

  constructor(config?: Partial<SimulationConfig>) {
    this.config = {
      maxHistorySize: config?.maxHistorySize || 100, // Strictly bound history
      throttleMs: config?.throttleMs || 500,         // Prevent UI freezes
      maxConsecutiveResponses: config?.maxConsecutiveResponses || 5, // Recursive response throttling
    };
  }

  public registerAgent(agent: Agent): void {
    this.agents.set(agent.state.id, agent);
    this.consecutiveResponses.set(agent.state.id, 0);
    this.notifyAgentsUpdate();
  }

  public setCallbacks(
    onHistoryUpdate: (history: AgentMessage[]) => void,
    onAgentsUpdate: (agents: Agent[]) => void
  ): void {
    this.onHistoryUpdate = onHistoryUpdate;
    this.onAgentsUpdate = onAgentsUpdate;
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // Have the first agent start the conversation
    const firstAgentId = Array.from(this.agents.keys())[0];
    if (firstAgentId) {
      const agent = this.agents.get(firstAgentId);
      if (agent) {
         const msg = agent.generateInitialMessage();
         await this.broadcastMessage(msg);
      }
    }
  }

  public stop(): void {
    this.isRunning = false;
  }

  /**
   * The core of the Agent2Agent mesh:
   * Every output becomes an input for all agents.
   */
  public async broadcastMessage(message: AgentMessage): Promise<void> {
    if (!this.isRunning) return;

    // Apply strict message history bounding to prevent memory leaks
    this.history.push(message);
    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift(); // Remove oldest message
    }

    // Notify UI
    this.notifyHistoryUpdate();

    // Throttling: Enforce minimum delay between broadcasts
    const now = Date.now();
    const timeSinceLast = now - this.lastBroadcastTime;
    if (timeSinceLast < this.config.throttleMs) {
      await new Promise(resolve => setTimeout(resolve, this.config.throttleMs - timeSinceLast));
    }
    this.lastBroadcastTime = Date.now();

    // Reset consecutive responses for agents other than the sender
    for (const [id, count] of this.consecutiveResponses.entries()) {
        if (id !== message.senderId) {
            this.consecutiveResponses.set(id, 0); // Allow them to respond again
        } else {
             // Throttling recursive responses
             const newCount = count + 1;
             this.consecutiveResponses.set(id, newCount);

             if (newCount > this.config.maxConsecutiveResponses) {
                 console.warn(`Agent ${id} exceeded max consecutive responses. Throttling.`);
                 // We don't skip broadcasting, but we might log a warning or temporarily silence them
                 // For now, we'll let it broadcast but the agent's brain should handle backoff.
             }
        }
    }


    // Asynchronously parallel process the message by all agents
    const processingPromises: Promise<AgentMessage | null>[] = [];

    for (const agent of this.agents.values()) {
        if (agent.state.id !== message.senderId) {
           // Provide the message and the bounded full history
           processingPromises.push(agent.receiveMessage(message, [...this.history]));
        }
    }

    // Wait for all agents to process the broadcast
    const responses = await Promise.all(processingPromises);

    this.notifyAgentsUpdate(); // Statuses changed

    // Handle any cascading responses recursively, but safely due to our throttling above
    // Filter out nulls and broadcast new messages
    for (const response of responses) {
        if (response) {
            // Only broadcast if the sender hasn't exceeded the consecutive limit
            const count = this.consecutiveResponses.get(response.senderId) || 0;
            if (count <= this.config.maxConsecutiveResponses) {
                // Recursively broadcast the new output as input
                // This is asynchronous and decoupled
                setTimeout(() => this.broadcastMessage(response), 0);
            }
        }
    }
  }

  private notifyHistoryUpdate(): void {
    if (this.onHistoryUpdate) {
      // Pass a new array reference so React state updates trigger correctly
      this.onHistoryUpdate([...this.history]);
    }
  }

  private notifyAgentsUpdate(): void {
    if (this.onAgentsUpdate) {
      // Pass a new array reference
      this.onAgentsUpdate(Array.from(this.agents.values()));
    }
  }
}
