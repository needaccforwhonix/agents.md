import { Agent } from './Agent';
import { Message, AgentState } from './types';

export class MeshSimulation {
  private agents: Agent[] = [];
  private listeners: (() => void)[] = [];
  public isRunning: boolean = false;
  private intervalId: any = null;
  public messages: Message[] = [];

  constructor(initialAgentCount: number = 4) {
    for (let i = 0; i < initialAgentCount; i++) {
      this.addAgent(`Agent_${i + 1}`);
    }
    // Start with a generic message
    this.broadcast({
      id: 'init',
      senderId: 'system',
      senderName: 'System',
      content: 'Initialization sequence complete. Begin agent interaction protocols.',
      timestamp: Date.now(),
      topics: ['structure', 'deployment']
    });
  }

  public addAgent(name: string) {
    const id = Math.random().toString(36).substr(2, 9);
    const agent = new Agent(id, name);
    this.agents.push(agent);
    this.notify();
  }

  public broadcast(message: Message) {
    this.messages.unshift(message);
    if (this.messages.length > 50) this.messages.pop(); // Limit history

    this.notify();

    if (!this.isRunning && message.senderId !== 'system') return;

    // Asynchronously simulate network propagation
    this.agents.forEach(agent => {
      // Small random delay for realism
      setTimeout(() => {
        if (!this.isRunning) return;
        const response = agent.receive(message);
        if (response) {
          // If agent decides to respond, broadcast it
          // Add delay for "typing" or "processing" simulated in Agent, but also network delay
          setTimeout(() => this.broadcast(response), 500);
        }
        this.notify();
      }, Math.random() * 1000 + 500);
    });
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 1000);

    // Kickstart if quiet
    if (this.messages.length === 0 || (Date.now() - this.messages[0].timestamp > 5000)) {
        this.broadcast({
            id: Math.random().toString(36).substr(2, 9),
            senderId: 'system',
            senderName: 'System',
            content: 'System pulse check. Status report requested.',
            timestamp: Date.now(),
            topics: ['status', 'performance']
        });
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick() {
    this.agents.forEach(agent => agent.tick());
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getAgents(): Agent[] {
    return this.agents;
  }
}
