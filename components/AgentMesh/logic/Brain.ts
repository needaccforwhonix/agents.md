import { Message, BrainParams } from './types';

export interface Brain {
  process(context: Message[], params: BrainParams, agentId: string): Promise<Message | null>;
}

export class RuleBasedBrain implements Brain {
  public async process(context: Message[], params: BrainParams, agentId: string): Promise<Message | null> {
    if (context.length === 0) return null;

    // Get the latest message
    const latestMsg = context[context.length - 1];

    // Don't respond to yourself to avoid infinite loops
    if (latestMsg.sender === agentId) return null;

    // Very simple "reasoning" based on brain parameters
    const probabilityToRespond = (params.creativity + params.decisiveness) / 2;

    if (Math.random() > probabilityToRespond) {
      return null; // Decided not to respond
    }

    // Determine intent and action
    const action = params.analytical > 0.6 ? 'Analyze' : (params.creativity > 0.6 ? 'Create' : 'Execute');

    // Prevent infinite intent string growth
    let baseIntent = latestMsg.intent;
    if (baseIntent.startsWith("Responding to")) {
      // Just keep the original intent or summarize it
      baseIntent = baseIntent.split("intent: ")[1] || baseIntent;
    }
    const intent = `Responding to ${latestMsg.sender.slice(0, 8)}'s intent: ${baseIntent}`;

    return {
      id: crypto.randomUUID(),
      sender: agentId,
      intent: intent,
      location: latestMsg.location, // Usually keep the same location
      action: action,
      content: `Agent ${agentId} is performing ${action} on intent '${latestMsg.intent}' based on full context evaluation.`,
      timestamp: Date.now()
    };
  }
}
