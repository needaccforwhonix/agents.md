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
      what: `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierungen an basierend auf [${safeWhat}] im Bereich ${context.role}. Inputs und Outputs müssen eindeutig beschreiben, was, wo und wie gewünscht wird. Dabei wird stets kontextuell unterstützt. Dadurch soll die asynchrone, parallele Weiterentwicklung vorangetrieben und das System aktuell gehalten werden. Der Fokus liegt auf Sicherheit Performance Style Dokumentation Sauberkeit Ordnung. Dies schließt die Optimierung dieses Prompts sowie dessen Implementierung und Verbesserung ein. Starte mindestens einen vollständigen Agent2Agent Mesh-Zyklus pro Session, idealerweise mit verlängerter Laufzeit. Beinhaltet: Testing, Validierung, Aktualisierung aller Dateien und Projektordner-Cleanup ohne jeglichen Verlust von Features, Ideen oder Funktionen (WORM-Prinzip). Erforderliche Architekturen: Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentationen, Todo-Erstellung, Implementierungen und Verbesserungen. Identifiziere und implementiere die nächsten zwingenden Iterationen. Jeder Agent empfängt jeden Output als Input und entscheidet autonom über seine Reaktion.`,
      where: `(WO) Kontext: Agent ${context.name} verarbeitet die Anweisung basierend auf dem Ursprungsort [${safeWhere}]. Alle Zielorte müssen absolut eindeutig spezifiziert werden. Dies beinhaltet die Aktualisierung aller betroffenen Dateien und ein strukturelles Projektordner-Cleanup, um dauerhaft Sauberkeit und Ordnung zu gewährleisten.`,
      how: `(WIE) ${roleSpecificHow} Reaktion auf die vorherige Aktion: [${safeHow}]. Setze die Anforderungen vollständig und optimiert um, einschließlich: Testing, Validierung, Aktualisierung aller Dateien sowie Projektordner-Cleanup, strikt ohne Feature-, Ideen- oder Funktionsverlust. Anzuwendende Prinzipien: Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentationen, Todo-Management, Implementierungen und kontinuierliche Verbesserungen. Formatiere die Ausgabe für Jules exakt nach folgendem Muster: @jules [Root Cause Analysis des Problems (inklusive Chain-of-Thought)] + [Actionable Code-Fix] + [Quality/Performance Improvements]. Jeder A2A-Agent verwendet zwingend Agentic Context Engineering (ACE) und den AlphaEvolve-Algorithmus mit tiefgehendem Reasoning unter Einbezug des gesamten Kontexts.`,
      reasoning: `(WARUM) In meiner Rolle als ${context.role} ist es unabdingbar sicherzustellen, dass sämtliche asynchronen und parallelen Modifikationen strikt additiv erfolgen (kein Funktions- oder Feature-Verlust), aufbauend auf der Argumentationskette: [${safeReasoning}]. Das generierte Resultat erfüllt kompromisslos alle Metriken für kontinuierliche Optimierung hinsichtlich Sicherheit Performance Style Dokumentation Sauberkeit Ordnung. Aktueller Status der durch AlphaEvolve mutierten Parameter: ${stringifiedParameters}. Dies dient der Festigung einer resilienten Agent2Agent-Struktur, welche massive, parallele und asynchrone Systemevolution ermöglicht, nebst stetiger Optimierung und Anpassung dieser Systemanweisungen.`,
    };

    return response;
  }
}
