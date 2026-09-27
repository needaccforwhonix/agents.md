/**
 * Represents a standard continuous protocol message exchanged between agents within the mesh.
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** Identifier of the sender agent */
  senderId: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Intent: what is desired */
  what: string;
  /** Location: where is it desired */
  where: string;
  /** Action: how is it desired */
  how: string;
  /** Reasoning: why is it desired */
  reasoning: string;
}

/**
 * Encapsulates mutable hyperparameters for an agent that dynamically evolve through the AlphaEvolve algorithm.
 */
export interface AgentParameters {
  /** The probability (0.0 to 1.0) that the agent responds to a broadcast. */
  responsiveness?: number;
  /** The evolutionary generation integer of the agent's parameters. */
  generation?: number;
  /** Factor representing the depth of context analysis. */
  analyticalDepth?: number;
  /** Factor representing how strongly historical messages influence behavior. */
  contextRetention?: number;
  /** Any additional numeric parameters injected during execution. */
  [key: string]: number | undefined;
}

/**
 * Represents the localized state and metadata context bound to a single Agent.
 */
export interface AgentContext {
  /** Unique identifier for the agent instance. */
  id: string;
  /** Human-readable or structural name of the agent. */
  name: string;
  /** The assigned operational role guiding the decision strategy. */
  role: string;
  /** Retained bounded history of messages. */
  history: Message[];
  /** Mutable evolutionary parameters. */
  parameters: AgentParameters;
}

/**
 * Represents the strategic intelligence layer responsible for generating responses.
 */
export interface Brain {
  /**
   * Processes an incoming message and determines if and how to respond based on the agent's context.
   * @param message The incoming broadcasted message.
   * @param context The agent's localized operational state and parameters.
   * @returns A Promise resolving to a new response Message, or null if no response is intended.
   */
  decide(message: Message, context: AgentContext): Promise<Message | null>;
}
