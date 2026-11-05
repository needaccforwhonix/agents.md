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
Die Eingaben und Ausgaben müssen stets eindeutig spezifizieren, was, wo und wie gewollt ist, um eine reibungslose, asynchrone und parallele Weiterentwicklung zu gewährleisten. Dies beinhaltet eine vollständige Agent2Agent-Mesh-Struktur, in der jeder Agent alle Ausgaben als Eingaben empfängt und autonom entscheidet, wie reagiert wird. Integriere Agentic Context Engineering mit AlphaEvolve-Algorithmen und WORM-Prinzipien. Priorisiere stets Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Sämtliche Anpassungen sind streng additiv, ohne Features, Ideen oder Funktionen zu löschen. Implementiere Testing, Demock, ACE, CI/CD-Pipelines, E2E-Tests, AST-Analysen und Dokumentations-Updates.
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
        what: parsed.what || `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an basierend auf [${safeWhat}] im Bereich ${context.role}. Die Eingaben und Ausgaben müssen stets eindeutig spezifizieren, was gewollt ist, um eine reibungslose, asynchrone und parallele Weiterentwicklung zu gewährleisten. Dies beinhaltet eine vollständige Agent2Agent-Mesh-Struktur, in der jeder Agent alle Ausgaben als Eingaben empfängt und autonom reagiert, unterstützt durch kontextuelles Engineering und AlphaEvolve. Priorisiere stets Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Sämtliche Anpassungen sind streng additiv, ohne Features zu löschen. Implementiere Testing, Demock, ACE, CI/CD-Pipelines, E2E-Tests, AST-Analysen und Dokumentations-Updates.`,
        where: parsed.where || `(WO) Context: ${context.name} verarbeitet die Aufgabe basierend auf [${safeWhere}]. Zielorte müssen eindeutig spezifiziert werden, inklusive Aktualisierung aller relevanten Dateien sowie eines kontinuierlichen Projektordner-Cleanups, um Sauberkeit und Ordnung beizubehalten.`,
        how: parsed.how || `(WIE) Reagiert auf die vorherige Aktion [${safeHow}]. Setze die Änderungen vollständig optimiert um: Nutze Agentic Context Engineering für dynamische Kontextgrenzen und AlphaEvolve zur fortlaufenden Parameter-Mutation. Formatiere die Analyse für Jules exakt nach folgendem Schema: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements].`,
        reasoning: parsed.reasoning || `(WARUM) Als ${context.role} muss ich sicherstellen, dass asynchrone, parallele Verbesserungen streng additiv sind und auf WORM-Prinzipien basieren (ohne Funktions-/Feature-Verlust), aufbauend auf [${safeReasoning}]. Der Output erfüllt alle kontinuierlichen Optimierungs-Metriken bezüglich Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Evolved Parameters via AlphaEvolve: ${stringifiedParameters}. Dies stärkt eine robuste Agent2Agent-Struktur und ermöglicht eine massive parallele asynchrone Evolution.`,
      };
    } catch {
      return null;
    }
  }
}
