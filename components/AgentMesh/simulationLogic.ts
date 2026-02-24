import { Agent, AgentRole, AgentStats, Message, SimulationState, LogEntry, AgentParameters, MessageType } from './types';

const INITIAL_PROMPT = "Write a secure and efficient agent system.";
const TARGET_KEYWORDS = ["secure", "efficient", "fast", "clean", "optimized", "robust", "scalable"];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function createAgent(role: AgentRole, color: string): Agent {
  return {
    id: generateId(),
    role,
    status: 'IDLE',
    context: [],
    parameters: {
      creativity: 0.5,
      strictness: 0.5,
      efficiency: 0.5,
      learningRate: 0.1
    },
    stats: {
      messagesProcessed: 0,
      successfulGenerations: 0,
      evolutions: 0
    },
    color
  };
}

export function createInitialState(): SimulationState {
  const generator = createAgent('GENERATOR', '#3b82f6'); // Blue
  const reviewer = createAgent('REVIEWER', '#ef4444');   // Red
  const optimizer = createAgent('OPTIMIZER', '#10b981'); // Green

  // Initial prompt to start the loop
  const initialMessage: Message = {
    id: generateId(),
    fromId: 'SYSTEM',
    toId: generator.id,
    content: INITIAL_PROMPT,
    type: 'PROMPT',
    timestamp: Date.now()
  };

  return {
    agents: [generator, reviewer, optimizer],
    messages: [initialMessage],
    logs: [{
      id: generateId(),
      timestamp: Date.now(),
      message: "Simulation initialized. Agents created.",
      type: 'INFO'
    }],
    tickCount: 0,
    isRunning: false,
    bestPrompt: INITIAL_PROMPT,
    bestScore: 0
  };
}

function log(state: SimulationState, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO', agentId?: string) {
  state.logs.unshift({
    id: generateId(),
    timestamp: Date.now(),
    message,
    type,
    agentId
  });
  if (state.logs.length > 50) state.logs.pop();
}

function calculateScore(text: string): number {
  let score = 0;
  const lowerText = text.toLowerCase();

  // Length bonus (optimal length around 50-100 chars)
  if (text.length > 20 && text.length < 150) score += 20;

  // Keyword bonus
  TARGET_KEYWORDS.forEach(word => {
    if (lowerText.includes(word)) score += 10;
  });

  // Random fluctuation to simulate subjective review
  score += Math.random() * 10;

  return Math.min(100, Math.max(0, score));
}

function mutateText(text: string, creativity: number): string {
  const words = text.split(' ');
  const mutations = Math.max(1, Math.floor(creativity * 3));

  const actions = ['replace', 'delete', 'insert', 'swap'];
  const vocab = ["super", "ultra", "hyper", "mega", "code", "logic", "flow", "data", "mesh", "net"];

  for (let i = 0; i < mutations; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const index = Math.floor(Math.random() * words.length);

    if (action === 'replace' && words.length > 0) {
       words[index] = vocab[Math.floor(Math.random() * vocab.length)];
    } else if (action === 'delete' && words.length > 1) {
       words.splice(index, 1);
    } else if (action === 'insert') {
       words.splice(index, 0, vocab[Math.floor(Math.random() * vocab.length)]);
    } else if (action === 'swap' && words.length > 1) {
       const otherIndex = Math.floor(Math.random() * words.length);
       const temp = words[index];
       words[index] = words[otherIndex];
       words[otherIndex] = temp;
    }
  }

  return words.join(' ');
}

export function tick(state: SimulationState): SimulationState {
  if (!state.isRunning && state.tickCount > 0) return state;

  const nextState = { ...state, tickCount: state.tickCount + 1 };
  const { agents, messages } = nextState;

  // 1. Process Messages
  const messagesToProcess = [...messages];
  nextState.messages = []; // Clear processed messages (in a real system, might keep history)

  messagesToProcess.forEach(msg => {
    const agent = agents.find(a => a.id === msg.toId);
    if (!agent) return;

    agent.stats.messagesProcessed++;
    agent.status = 'PROCESSING';

    if (agent.role === 'GENERATOR') {
      if (msg.type === 'PROMPT' || msg.type === 'PARAM_UPDATE') {
        // Generate new variation
        const baseText = msg.type === 'PROMPT' ? msg.content : (agent.context[agent.context.length - 1] || INITIAL_PROMPT);
        const newText = mutateText(baseText, agent.parameters.creativity);

        // Context Engineering: Store the new variation in context
        agent.context.push(newText);
        if (agent.context.length > 10) agent.context.shift(); // Keep context window small

        log(nextState, `Generated variation: "${newText.substring(0, 30)}..."`, 'INFO', agent.id);

        // Send to Reviewer
        const reviewer = agents.find(a => a.role === 'REVIEWER');
        if (reviewer) {
          nextState.messages.push({
            id: generateId(),
            fromId: agent.id,
            toId: reviewer.id,
            content: newText,
            type: 'PROMPT',
            timestamp: Date.now()
          });
        }
      }
    } else if (agent.role === 'REVIEWER') {
      if (msg.type === 'PROMPT') {
        const score = calculateScore(msg.content);
        log(nextState, `Reviewed prompt. Score: ${score.toFixed(1)}`, score > 70 ? 'SUCCESS' : 'INFO', agent.id);

        if (score > nextState.bestScore) {
            nextState.bestScore = score;
            nextState.bestPrompt = msg.content;
            log(nextState, `New Best Prompt: "${msg.content}"`, 'SUCCESS');
        }

        // Send feedback to Optimizer
        const optimizer = agents.find(a => a.role === 'OPTIMIZER');
        if (optimizer) {
          nextState.messages.push({
            id: generateId(),
            fromId: agent.id,
            toId: optimizer.id,
            content: `Score: ${score}`,
            type: 'FEEDBACK',
            timestamp: Date.now(),
            data: { score, originalPrompt: msg.content }
          });
        }
      }
    } else if (agent.role === 'OPTIMIZER') {
      if (msg.type === 'FEEDBACK') {
        const score = msg.data.score;
        // Adjust Generator parameters
        const generator = agents.find(a => a.role === 'GENERATOR');
        if (generator) {
          const oldCreativity = generator.parameters.creativity;
          let newCreativity = oldCreativity;

          if (score < 50) {
             newCreativity = Math.min(1.0, oldCreativity + 0.1); // Needs more radical changes
          } else if (score > 80) {
             newCreativity = Math.max(0.1, oldCreativity - 0.05); // Fine tune
          }

          generator.parameters.creativity = newCreativity;
          generator.stats.evolutions++;

          log(nextState, `Optimized Generator creativity: ${oldCreativity.toFixed(2)} -> ${newCreativity.toFixed(2)}`, 'WARNING', agent.id);

          // Trigger next generation cycle
          nextState.messages.push({
            id: generateId(),
            fromId: agent.id,
            toId: generator.id,
            content: "Update parameters",
            type: 'PARAM_UPDATE',
            timestamp: Date.now()
          });
        }
      }
    }

    // Reset status after processing (simplified)
    agent.status = 'IDLE';
  });

  // 2. AlphaEvolve: Random Mutation
  if (Math.random() < 0.05) { // 5% chance per tick
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const paramKeys = Object.keys(randomAgent.parameters) as (keyof AgentParameters)[];
    const key = paramKeys[Math.floor(Math.random() * paramKeys.length)];
    const change = (Math.random() - 0.5) * 0.1;

    const oldValue = randomAgent.parameters[key];
    randomAgent.parameters[key] = Math.max(0, Math.min(1, oldValue + change));
    randomAgent.stats.evolutions++;

    log(nextState, `AlphaEvolve: Mutated ${randomAgent.role} ${key} (${oldValue.toFixed(2)} -> ${randomAgent.parameters[key].toFixed(2)})`, 'WARNING', randomAgent.id);
  }

  return nextState;
}
