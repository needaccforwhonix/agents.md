import { Brain, Message, AgentContext } from "./Types";

/**
 * Strategy pattern for decision making using real Language Models (LLM).
 */
export class LLMBrain implements Brain {
  private endpointUrl: string;
  private apiKey: string | undefined;

  constructor(endpointUrl: string = "http://localhost:11434/api/generate", apiKey?: string) {
    this.endpointUrl = endpointUrl;
    this.apiKey = apiKey;
  }

  async decide(message: Message, context: AgentContext): Promise<Message | null> {
    if (message === null || message === undefined) {
      throw new Error("Input message cannot be null or undefined");
    }
    if (context === null || context === undefined) {
      throw new Error("Input context cannot be null or undefined");
    }

    if (message.senderId === context.id) {
      return null;
    }

    const parameters = context.parameters || {};
    const chanceToRespond = parameters.responsiveness !== undefined ? parameters.responsiveness : 0.5;

    if (Math.random() > chanceToRespond) {
      return null;
    }

    const stringifiedParameters = JSON.stringify(parameters);

    const safeWhat = message.what.length > 4000 ? message.what.substring(0, 4000) + '...' : message.what;
    const safeWhere = message.where.length > 4000 ? message.where.substring(0, 4000) + '...' : message.where;
    const safeHow = message.how.length > 4000 ? message.how.substring(0, 4000) + '...' : message.how;
    const reasoning = message.reasoning || "";
    const safeReasoning = reasoning.length > 4000 ? reasoning.substring(0, 4000) + '...' : reasoning;

    const systemPrompt = `You are an autonomous Agent2Agent mesh node named ${context.name} with role ${context.role}.
Input und Output müssen eindeutig und präzise beschreiben, was, wo und wie gewünscht ist, um den Agenten bestmöglich zu unterstützen. Ziel ist es, asynchron und parallel die gesamte Codebasis weiterzuentwickeln und stets auf dem neuesten Stand zu halten. Fokussiere dich auf: Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Optimiere diesen Prompt sowie dessen Umsetzung kontinuierlich. Starte mindestens einen vollständigen Agent2Agent-Mesh pro Jules-Session, bevorzugt mit längerer Laufzeit. Dies umfasst Testing, Validierung, Aktualisierung aller Dateien sowie Projektordner-Cleanup, streng nach dem WORM-Prinzip (Write Once, Read Many) ohne Löschung von Features, Ideen oder Funktionen. Integriere Demock, Testing, ACE (Agentic Context Engineering), CI/CD-Pipelines, E2E-Tests, AST-Analysen und Dokumentation. Erstelle und implementiere TODOs und Verbesserungen. Jeder Knoten im Mesh erhält einen eigenen dedizierten Agenten. Alle Agenten empfangen jeden Output als Input.
Return exactly a valid JSON object with what, where, how, and reasoning fields.`;

    const userPrompt = `Message received from ${message.senderId}:
What: ${safeWhat}
Where: ${safeWhere}
How: ${safeHow}
Reasoning: ${safeReasoning}

Current Agent Parameters: ${stringifiedParameters}

Generate a JSON response conforming to the system prompt directives. Format analysis for Jules exactly as: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements].`;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.endpointUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "llama3",
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          format: "json",
        }),
      });

      if (!response.ok) {
         return null;
      }

      const responseData = await response.json() as { response: string };
      const parsed = JSON.parse(responseData.response) as { what: string, where: string, how: string, reasoning: string };

      return {
        id: crypto.randomUUID(),
        senderId: context.id,
        timestamp: Date.now(),
        what: parsed.what || `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an basierend auf [${safeWhat}] im Bereich ${context.role}. Input und Output müssen eindeutig und präzise beschreiben, was, wo und wie gewünscht ist, um den Agenten bestmöglich zu unterstützen. Ziel ist es, asynchron und parallel die gesamte Codebasis weiterzuentwickeln und stets auf dem neuesten Stand zu halten. Fokussiere dich auf: Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Optimiere diesen Prompt sowie dessen Umsetzung kontinuierlich. Starte mindestens einen vollständigen Agent2Agent-Mesh pro Jules-Session, bevorzugt mit längerer Laufzeit. Dies umfasst Testing, Validierung, Aktualisierung aller Dateien sowie Projektordner-Cleanup, streng nach dem WORM-Prinzip (Write Once, Read Many) ohne Löschung von Features, Ideen oder Funktionen. Integriere Demock, Testing, ACE (Agentic Context Engineering), CI/CD-Pipelines, E2E-Tests, AST-Analysen und Dokumentation. Erstelle und implementiere TODOs und Verbesserungen. Identifiziere proaktiv die nächsten notwendigen Optimierungen. Alle Agenten im Mesh empfangen jeden Output als Input und entscheiden autonom, wie sie reagieren.`,
        where: parsed.where || `(WO) Context: ${context.name} verarbeitet die Aufgabe basierend auf [${safeWhere}]. Zielorte müssen eindeutig spezifiziert werden, inklusive der Aktualisierung aller relevanten Dateien sowie Projektordner-Cleanup, um Sauberkeit und Ordnung konsequent aufrechtzuerhalten.`,
        how: parsed.how || `(WIE) Reagiert auf die vorherige Aktion: [${safeHow}]. Setze die Änderungen vollständig optimiert um. Dies beinhaltet: Testing, Validierung, Aktualisierung aller Dateien und Projektordner-Cleanup unter strikter Einhaltung des WORM-Prinzips (keine Löschung von Features, Ideen oder Funktionen). Wende Demock, Testing, ACE, CI/CD-Pipelines, E2E-Tests, AST und Dokumentation an. Format analysis for Jules exactly as: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements]. Jeder A2A-Agent nutzt Agentic Context Engineering und den AlphaEvolve-Algorithmus mit Reasoning und vollständigem Kontext, wobei jedem Element ein eigener Agent zugewiesen wird.`,
        reasoning: parsed.reasoning || `(WARUM) In meiner Rolle als ${context.role} muss ich sicherstellen, dass asynchrone, parallele Verbesserungen streng additiv gemäß dem WORM-Prinzip (ohne Funktions- oder Feature-Verlust) implementiert werden, aufbauend auf [${safeReasoning}]. Der Output erfüllt alle Metriken für kontinuierliche Optimierung bezüglich: Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Evolved Parameters via AlphaEvolve: ${stringifiedParameters}. Dies stärkt eine robuste Agent2Agent-Struktur und ermöglicht eine massive, parallele und asynchrone Evolution. Ziel ist die fortlaufende Optimierung dieses Prompts, dessen Umsetzung und die allgemeine Systemverbesserung.`,
      };
    } catch {
      return null;
    }
  }
}
