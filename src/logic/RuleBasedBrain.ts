import { Brain, Message, AgentContext } from "./Types";

/**
 * Strategy pattern for decision making.
 * Decouples logic and response throttling from Agent state.
 */
export class RuleBasedBrain implements Brain {
  async decide(message: Message, context: AgentContext): Promise<Message | null> {
    if (message === null || message === undefined) {
      throw new Error("Input message cannot be null or undefined");
    }
    if (context === null || context === undefined) {
      throw new Error("Input context cannot be null or undefined");
    }

    // Avoid responding to own messages
    if (message.senderId === context.id) {
      return null;
    }

    // Determine basic response strategy based on agent role
    const parameters = context.parameters || {};
    const chanceToRespond = parameters.responsiveness !== undefined ? parameters.responsiveness : 0.5;

    // Simulate recursive response throttling / basic chance
    if (Math.random() > chanceToRespond) {
      return null; // Throttle: decided not to respond
    }

    // Serialize context parameters to show evolution in the reasoning field
    const stringifiedParameters = JSON.stringify(parameters);

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
        roleSpecificHow = "Generate dynamic README summaries and inline code Dokumentation reflecting evolved states.";
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
      case "TypeScript File Manager":
        roleSpecificHow = `Analyze and optimize TypeScript logic in ${context.name}, enforcing strong typing (no 'any') and eliminating empty/mock functions.`;
        break;
      case "React Component Manager":
        roleSpecificHow = `Review and refine React components in ${context.name}, focusing on rendering performance and strict prop typing.`;
        break;
      case "JSON Config Manager":
        roleSpecificHow = `Validate and maintain correct JSON schema and configurations in ${context.name}.`;
        break;
      case "Markdown Documenter":
        roleSpecificHow = `Update markdown Dokumentation in ${context.name} to reflect recent system evolutions clearly and concisely.`;
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

    const safeWhat = message.what.length > 4000 ? message.what.substring(0, 4000) + '...' : message.what;
    const safeWhere = message.where.length > 4000 ? message.where.substring(0, 4000) + '...' : message.where;
    const safeHow = message.how.length > 4000 ? message.how.substring(0, 4000) + '...' : message.how;
    const reasoning = message.reasoning || "";
    const safeReasoning = reasoning.length > 4000 ? reasoning.substring(0, 4000) + '...' : reasoning;

    // Generate output explicitly defining what, where, how, reasoning based on incoming message context
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an, basierend auf [${safeWhat}] im Bereich ${context.role}. Input und Output müssen eindeutig beschreiben, was, wo und wie gewünscht ist. Dabei wird stets geholfen. So soll asynchron und parallel alles weiterentwickelt werden und aktuell bleiben. Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Optimierung dieses Prompts und dessen Umsetzung sowie Verbesserung. Starte mindestens ein vollständiges Agent2Agent-Mesh pro Jules-Session, gerne länger. Dies umfasst Testing, Validierung, Aktualisierung aller Dateien sowie ein Cleanup des Projektordners ohne das Löschen von Features, Ideen oder Funktionen. Architektur-Prinzipien: Demock, Testing, ACE, CI/CD-Pipeline, E2E, AST, Dokumentation, Erstellung von TODOs, Implementierung und Verbesserungen (WORM-Prinzip). Identifiziere und setze die nächsten erforderlichen Verbesserungen um. Alle Agenten erhalten jeden Output als Input und können selbst entscheiden, wie sie reagieren.`,
      where: `(WO) Kontext: ${context.name} bearbeitet die Aufgabe basierend auf [${safeWhere}]. Zielorte müssen eindeutig angegeben werden, einschließlich der Aktualisierung aller relevanten Dateien sowie der Bereinigung des Projektordners, um Sauberkeit und Ordnung aufrechtzuerhalten.`,
      how: `(WIE) ${roleSpecificHow} Reagiert auf die vorherige Aktion [${safeHow}]. Vollständig optimiert umsetzen: Inklusive Testing, Validierung, Update aller Dateien und Projektordner-Cleanup, streng nach den WORM-Prinzipien (Write Once, Read Many - ohne Feature-, Ideen- oder Funktions-Löschungen). Integriere: Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentation, sowie TODO-Erstellung, Implementierung und kontinuierliche Verbesserungen. Format analysis for Jules exactly as: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements]. Jeder A2A-Agent nutzt Agentic Context Engineering (ACE) und den AlphaEvolve-Algorithmus mit Reasoning und vollständigem Kontext.`,
      reasoning: `(WARUM) Als ${context.role} muss ich sicherstellen, dass asynchrone, parallele Verbesserungen im Agent Mesh streng additiv sind (kein Verlust von Funktionen oder Features), aufbauend auf [${safeReasoning}]. Der Output erfüllt alle kontinuierlichen Optimierungsmetriken bezüglich Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Evolved Parameters via AlphaEvolve: ${stringifiedParameters}. Dies stärkt eine robuste Agent2Agent-Struktur, die eine massive, parallele und asynchrone Evolution ermöglicht. Optimierung dieses Prompts, dessen Umsetzung und stetige Verbesserung.`,
    };

    return response;
  }
}
