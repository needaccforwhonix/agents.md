import { AgentMessage, AgentState } from './Types';
import { Brain, RuleBasedBrain } from './Brain';

export class Agent {
  public state: AgentState;
  private brain: Brain;

  constructor(id: string, name: string) {
    this.state = {
      id,
      name,
      memory: [],
      status: 'idle',
      parameters: {
        temperature: Math.random() * 0.5 + 0.5, // 0.5 - 1.0
        creativity: Math.random() * 0.5 + 0.5,  // 0.5 - 1.0
        focus: Math.random(),
      },
    };

    // Instantiate brain with Strategy pattern
    this.brain = new RuleBasedBrain();
  }

  /**
   * Receives a broadcasted message, processes it using the Brain,
   * updates its own context, and optionally returns a response message.
   * This logic explicitly simulates reading "what", "where", and "how" from input.
   */
  public async receiveMessage(message: AgentMessage, fullMeshContext: AgentMessage[]): Promise<AgentMessage | null> {
    // 1. Memory update (Agentic Context Engineering: maintaining context)
    this.state.memory.push(message);

    // Keep memory bounded to avoid memory leaks
    if (this.state.memory.length > 50) {
      this.state.memory.shift();
    }

    // 2. Set status to processing
    this.state.status = 'processing';

    // 3. Let the brain decide how to react
    try {
        const response = await this.brain.process(this.state, message, fullMeshContext);

        // 4. Update status back to idle
        this.state.status = 'idle';

        if (response) {
            // Self-record our output
            this.state.memory.push(response);
            return response;
        }

        return null;
    } catch (error) {
        this.state.status = 'error';
        console.error(`Agent ${this.state.id} encountered an error processing message.`, error);
        return null;
    }
  }

  /**
   * Generates a proactive initial message to start the simulation
   */
  public generateInitialMessage(): AgentMessage {
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      senderId: this.state.id,
      timestamp: Date.now(),
      what: 'Initialize the mesh simulation and begin collaborative processing.',
      where: 'Agent Mesh Environment',
      how: 'Broadcasting an initial ping to all connected agents.',
      rawContent: `Hello, this is ${this.state.name} starting the mesh. My initial parameters are temperature: ${this.state.parameters.temperature.toFixed(2)}, creativity: ${this.state.parameters.creativity.toFixed(2)}`,
      tokenCount: 45,
    };
    this.state.memory.push(message);
    return message;
  }
}
