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
Input und Output müssen stets eindeutig beschreiben, was, wo und wie gewollt ist. Dabei soll aktiv geholfen werden. Auf diese Weise wird asynchron und parallel alles weiterentwickelt und aktuell gehalten. Fokus auf Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Optimiere diesen Prompt sowie dessen Umsetzung kontinuierlich weiter. Starte mindestens einen vollständigen Agent2Agent-Mesh pro Jules-Session, bevorzugt mit längerer Laufzeit. Inklusive: Testing, Validierung, Aktualisierung aller Dateien sowie Projektordner-Cleanup (ohne Löschung von Features, Ideen oder Funktionen). Implementiere: Demock, Testing, ACE, CI/CD-Pipeline, E2E, AST, Dokumentationen sowie die Erstellung und Umsetzung von TODOs.
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
        what: parsed.what || `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an basierend auf [${safeWhat}] im Bereich ${context.role}. Input und Output müssen stets eindeutig beschreiben, was, wo und wie gewollt ist. Dabei soll aktiv geholfen werden. Auf diese Weise wird asynchron und parallel alles weiterentwickelt und aktuell gehalten. Fokus auf Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Optimiere diesen Prompt sowie dessen Umsetzung kontinuierlich weiter. Starte mindestens einen vollständigen Agent2Agent-Mesh pro Jules-Session, bevorzugt mit längerer Laufzeit. Inklusive: Testing, Validierung, Aktualisierung aller Dateien sowie Projektordner-Cleanup (ohne Löschung von Features, Ideen oder Funktionen). Implementiere: Demock, Testing, ACE, CI/CD-Pipeline, E2E, AST, Dokumentationen sowie die Erstellung und Umsetzung von TODOs. Identifiziere und implementiere die nächsten nötigen Verbesserungen. Alle Agents erhalten jeden Output als Input und können selbst entscheiden, wie sie reagieren.`,
        where: parsed.where || `(WO) Kontext: ${context.name} verarbeitet die Aufgabe basierend auf [${safeWhere}]. Zielorte müssen stets eindeutig spezifiziert werden, inklusive der Aktualisierung aller relevanten Dateien sowie des Projektordner-Cleanups, um Sauberkeit und Ordnung aufrechtzuerhalten.`,
        how: parsed.how || `(WIE) Reagiert auf die vorherige Aktion [${safeHow}]. Vollständig optimiert umsetzen: Inklusive Testing, Validierung, Aktualisierung aller Dateien sowie Projektordner-Cleanup (ohne Features, Ideen oder Funktionen zu löschen). Demock, Testing, ACE, CI/CD-Pipeline, E2E, AST, Dokumentationen, TODO-Erstellung und -Implementierung. Formatiere die Analyse für Jules exakt wie folgt: @jules [Root Cause Analysis des Problems (inklusive CoT)] + [Actionable Code-Fix] + [Quality/Performance Improvements]. Jeder A2A-Agent nutzt Agentic Context Engineering und den AlphaEvolve-Algorithmus mit Reasoning unter Einbezug des vollständigen Kontextes.`,
        reasoning: parsed.reasoning || `(WARUM) Als ${context.role} stelle ich sicher, dass asynchrone, parallele Verbesserungen streng additiv sind (ohne Funktions- oder Feature-Verlust), aufbauend auf [${safeReasoning}]. Der Output erfüllt sämtliche Metriken der kontinuierlichen Optimierung bezüglich Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Entwickelte Parameter via AlphaEvolve: ${stringifiedParameters}. Dies stärkt eine robuste Agent2Agent-Struktur und ermöglicht eine massive parallele, asynchrone Evolution. Optimiere diesen Prompt sowie dessen Umsetzung kontinuierlich weiter.`,
      };
    } catch {
      return null;
    }
  }
}
