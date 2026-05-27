import { Brain, Message, AgentContext } from "./Types";

/**
 * Strategy pattern for decision making.
 * Decouples logic and response throttling from Agent state.
 */
export class RuleBasedBrain implements Brain {
  async decide(message: Message, context: AgentContext): Promise<Message | null> {
    // Avoid responding to own messages
    if (message.senderId === context.id) {
      return null;
    }

    // Determine basic response strategy based on agent role
    const chanceToRespond = context.parameters.responsiveness || 0.5;

    // Simulate recursive response throttling / basic chance
    if (Math.random() > chanceToRespond) {
      return null; // Throttle: decided not to respond
    }

    // Serialize context parameters to show evolution in the reasoning field
    const stringifiedParameters = JSON.stringify(context.parameters);

    let roleSpecificHow = `Apply Agentic Context Engineering for token bounds and AlphaEvolve for parameter mutation. Use specialized ${context.role} strategies to proactively enhance Security, Performance, Style, Documentation, Cleanliness, and Order.`;

    switch (context.role) {
      case "System Security Analyst":
        roleSpecificHow = "Perform vulnerability scanning, dependency checks, and sanitize all agent inputs.";
        break;
      case "System Performance Optimizer":
        roleSpecificHow = "Profile AST bounds, analyze memory limits, and optimize simulation bottlenecks.";
        break;
      case "System Style Enforcer":
        roleSpecificHow = "Enforce strict TypeScript types and maintain explicit directory layout conventions.";
        break;
      case "System Documenter":
        roleSpecificHow = "Generate dynamic README summaries and inline code documentation reflecting evolved states.";
        break;
      case "System Cleanliness & Order":
        roleSpecificHow = "Identify obsolete mock patterns, remove unused imports, and consolidate logic.";
        break;
      case "Prompt & Logic Optimizer":
        roleSpecificHow = "Analyze prompt effectiveness, refine ACE logic, and tune alphaEvolve parameters.";
        break;
      case "System Developer":
        roleSpecificHow = "Implement core logic enhancements, integrate cross-domain features, and address AST demock requirements.";
        break;
      case "tsconfig.json Manager":
      case "package.json Manager":
      case "next.config.ts Manager":
      case "postcss.config.mjs Manager":
      case "README.md Manager":
      case "AGENTS.md Manager":
      case "File Manager":
        roleSpecificHow = `Maintain the configuration and metadata in ${context.name}. Ensure strict typing, valid structure, and proper updates for optimization.`;
        break;
      case "Root Directory Manager":
      case "Components Manager":
      case "Pages Manager":
      case "Scripts Manager":
      case "Github Config Manager":
      case "Public Assets Manager":
      case "Styles Manager":
      case "Test Directory Manager":
      case "Directory Manager":
        roleSpecificHow = "Ensure directory-specific constraints are met, validate related AST patterns, and coordinate updates within the respective domain.";
        break;
    }

    const safeWhat = message.what.length > 2000 ? message.what.substring(0, 2000) + '...' : message.what;
    const safeWhere = message.where.length > 2000 ? message.where.substring(0, 2000) + '...' : message.where;
    const safeHow = message.how.length > 2000 ? message.how.substring(0, 2000) + '...' : message.how;
    const safeReasoning = (message.reasoning || "").length > 2000 ? message.reasoning.substring(0, 2000) + '...' : message.reasoning;

    // Generate output explicitly defining what, where, how, reasoning based on incoming message context
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `(WAS) [ACTION REQUIRED] Analysiere, refaktorisiere und wende kontinuierliche Optimierung an basierend auf [${safeWhat}] im Bereich ${context.role}. Input und Output müssen absolut eindeutig beschreiben was, wo und wie gewollt ist. Gewährleiste kontinuierliche Weiterentwicklung in: Sicherheit, Performance, Style, Documentation, Sauberkeit und Ordnung. Identifiziere und implementiere proaktiv die nächsten nötigen Verbesserungen strikt additiv ohne Deletionen von Features, Ideen oder Funktionen.`,
      where: `(WO) [TARGET SCOPE] Context: ${context.name} verarbeitet Aufgabe basierend auf [${safeWhere}]. Alle betroffenen Zielorte müssen präzise spezifiziert werden inklusive Update aller referenzierten Dateien und Projektordner-Cleanup.`,
      how: `(WIE) [EXECUTION STRATEGY] ${roleSpecificHow} Reagiert auf [${safeHow}]. Vollständig optimiert umsetzen durch strikte Einhaltung der Checklist: Demock, Testing (E2E/Unit), ACE, CI/CD Pipeline Checks, AST Validierung, Dokumentation und Todo Management. Format analysis exactly as: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements].`,
      reasoning: `(WARUM) [SYSTEMATIC EVOLUTION] Als ${context.role} muss ich sicherstellen, dass asynchrone, parallele A2A-Verbesserungen die AgentMesh-Resilienz stärken, basierend auf [${safeReasoning}]. Alle Outputs erfüllen die Optimierungs-Metriken. Evolved Parameters via AlphaEvolve: ${stringifiedParameters}`,
    };

    return response;
  }
}
