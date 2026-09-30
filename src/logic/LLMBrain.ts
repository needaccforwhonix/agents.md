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
    if (!message) {
      throw new Error("Input message cannot be null or undefined");
    }
    if (!context) {
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
Input und Output müssen eindeutig beschreiben was wo wie gewollt ist. Dabei kann stets geholfen werden. So soll asynchron parallel alles weiter entwickelt werden und aktuell bleiben. Sicherheit Performance Style Dokumentation Sauberkeit Ordnung. Optimierung dieser prompt und deren Umsetzung und Verbesserung. Starte mindestens einen vollständigen Agent2agent Agent mesh pro Jules Sessions,gerne länger. Inklusive Testing + Validierung + Update aller Dateien inkl. Projektordner Cleanup ohne Feature, Ideen oder Funktions-Löschungen. Demock - Testing - ACE - CI/CD Pipeline - E2E - AST - Dokumentationen - Todos Creation + Implementierungen + Improvements.
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let response: Response;
      try {
        response = await fetch(this.endpointUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: "llama3",
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            stream: false,
            format: "json",
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
         return null;
      }

      const responseData = await response.json() as { response: string };
      const parsed = JSON.parse(responseData.response) as { what: string, where: string, how: string, reasoning: string };

      return {
        id: crypto.randomUUID(),
        senderId: context.id,
        timestamp: Date.now(),
        what: parsed.what || `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an basierend auf [${safeWhat}] im Bereich ${context.role}. Input und Output müssen eindeutig beschreiben was wo wie gewollt ist. Dabei kann stets geholfen werden. So soll asynchron parallel alles weiter entwickelt werden und aktuell bleiben. Sicherheit Performance Style Dokumentation Sauberkeit Ordnung. Optimierung dieser prompt und deren Umsetzung und Verbesserung. Starte mindestens einen vollständigen Agent2agent Agent mesh pro Jules Sessions,gerne länger. Inklusive Testing + Validierung + Update aller Dateien inkl. Projektordner Cleanup ohne Feature, Ideen oder Funktions-Löschungen. Demock - Testing - ACE - CI/CD Pipeline - E2E - AST - Dokumentationen - Todos Creation + Implementierungen + Improvements. Identifiziere und implementiere die nächsten nötigen Verbesserungen. Alle Agents erhalten jeden Output als Input und können entscheiden, wie sie reagieren.`,
        where: parsed.where || `(WO) Context: ${context.name} verarbeitet Aufgabe basierend auf [${safeWhere}]. Zielorte müssen eindeutig spezifiziert werden, inklusive Aktualisierung aller Dateien sowie Projektordner-Cleanup, um Sauberkeit und Ordnung beizubehalten.`,
        how: parsed.how || `(WIE) Reagiert auf vorherige Aktion [${safeHow}]. Vollständig optimiert umsetzen: Inklusive Testing + Validierung + Update aller Dateien inkl. Projektordner Cleanup ohne Feature, Ideen oder Funktions-Löschungen. Demock - Testing - ACE - CI/CD Pipeline - E2E - AST - Dokumentationen - Todos Creation + Implementierungen + Improvements. Format analysis for Jules exactly as: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements]. Jeder A2A-Agent nutzt Agentic Context Engineering und den AlphaEvolve-Algorithmus mit Reasoning und vollständigem Kontext.`,
        reasoning: parsed.reasoning || `(WARUM) Als ${context.role} muss ich sicherstellen, dass asynchrone, parallele Verbesserungen streng additiv sind (ohne Funktions-/Feature-Verlust), aufbauend auf [${safeReasoning}]. Der Output erfüllt alle kontinuierlichen Optimierungs-Metriken bezüglich Sicherheit Performance Style Dokumentation Sauberkeit Ordnung. Evolved Parameters via AlphaEvolve: ${stringifiedParameters}. Um eine robuste Agent2Agent-Struktur zu stärken, die eine massive parallele asynchrone Evolution ermöglicht. Optimierung dieser prompt und deren Umsetzung und Verbesserung.`,
      };
    } catch {
      return null;
    }
  }
}
