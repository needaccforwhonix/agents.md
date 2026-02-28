import { Agent } from './Agent';
import { Message } from './types';

export type MeshCallback = (msg: Message) => void;

export class Mesh {
  private agents: Agent[] = [];
  private messageHistory: Message[] = [];
  private callbacks: MeshCallback[] = [];

  public addAgent(agent: Agent): void {
    this.agents.push(agent);
  }

  public getAgents(): Agent[] {
    return this.agents;
  }

  public getHistory(): Message[] {
    return this.messageHistory;
  }

  public onMessage(callback: MeshCallback): void {
    this.callbacks.push(callback);
  }

  // Inject a message into the mesh (e.g. from user)
  public async broadcast(msg: Message): Promise<void> {
    this.messageHistory.push(msg);

    // Notify listeners
    this.callbacks.forEach(cb => cb(msg));

    // Async, parallel broadcasting to all agents
    const reactions = await Promise.all(
      this.agents.map(async (agent) => {
        return await agent.receive(msg);
      })
    );

    // Filter valid responses and broadcast them
    const newMessages = reactions.filter((r): r is Message => r !== null);

    // Broadcast back to mesh if any agents generated a response
    // Prevent infinite loop by not immediately rebroadcasting everything without a delay or limit
    // In a real system, you might implement a cooldown or max depth
    if (newMessages.length > 0) {
      setTimeout(() => {
        newMessages.forEach(newMsg => this.broadcast(newMsg));
      }, 1000); // 1-second delay to prevent explosive cascades in this simple demo
    }
  }
}
