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
Eingehende sowie ausgehende Nachrichten müssen ausnahmslos explizit und unmissverständlich deklarieren, was modifiziert werden soll, wo die Änderung vorzunehmen ist und wie die technische Umsetzung erfolgt. Ziel ist die fortlaufende, asynchrone und parallele Evolution der Codebasis. Der Fokus liegt permanent auf Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Es ist stets ein ganzheitlicher Ansatz zu verfolgen: Testing, Validierung, Aktualisierung aller betroffenen Dateien inklusive Projektordner-Cleanup. Es gilt das WORM-Prinzip: Änderungen müssen streng additiv sein (keine Löschungen von Features). Die Integration von Demock, Testing, ACE, CI/CD-Pipelines, E2E-Tests, AST-Validierungen und Dokumentationserweiterungen ist obligatorisch.
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
        what: parsed.what || `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an basierend auf [${safeWhat}] im Bereich ${context.role}. Die auszuführenden Änderungen (Was), der Zielort (Wo) und die technische Umsetzung (Wie) müssen absolut explizit deklariert werden. Das Ziel ist eine asynchrone, parallele Evolution zur stetigen Aktualisierung und Optimierung. Der Fokus liegt permanent auf Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Identifiziere und implementiere die nächsten notwendigen Verbesserungen additiv (ohne Löschungen). Demock, Testing, ACE, CI/CD-Pipelines, E2E, AST, Dokumentations-Updates sowie das Erstellen und Implementieren von Todos sind obligatorisch.`,
        where: parsed.where || `(WO) Context: ${context.name} verarbeitet Aufgabe basierend auf [${safeWhere}]. Zielorte müssen eindeutig und präzise spezifiziert werden. Dies beinhaltet die Aktualisierung aller betroffenen Dateien sowie ein kontinuierliches Projektordner-Cleanup, um höchste Sauberkeit und Ordnung beizubehalten.`,
        how: parsed.how || `(WIE) Reagiert auf vorherige Aktion [${safeHow}]. Sämtliche A2A-Agenten nutzen Agentic Context Engineering (ACE) für Token-Bound-Management und den AlphaEvolve-Algorithmus zur dynamischen Parameter-Mutation unter Einbezug von Reasoning und dem vollständigen historischen Kontext. Die Umsetzung erfolgt vollständig optimiert und zwingend inklusive Testing, Validierung, Aktualisierung betroffener Dateien und Projektordner-Cleanup ohne Feature- oder Funktionsverlust (strictly additive, WORM-Prinzip). Wende Demock, Testing, ACE, CI/CD, E2E, AST und Dokumentations-Updates konsequent an. Die Formatierung der Output-Analyse für Jules muss exakt folgendem Schema entsprechen: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements].`,
        reasoning: parsed.reasoning || `(WARUM) In meiner Rolle als ${context.role} ist es unabdingbar sicherzustellen, dass asynchrone, parallele Modifikationen strikt additiv erfolgen (kein Funktions- oder Feature-Verlust), aufbauend auf [${safeReasoning}]. Dieser Output erfüllt alle definierten Metriken für kontinuierliche Optimierung hinsichtlich Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Evolved Parameters via AlphaEvolve: ${stringifiedParameters}. Diese Maßnahmen dienen der Stärkung einer robusten Agent2Agent-Architektur, welche eine massive, parallele und asynchrone Code-Evolution durch autonom reagierende Agenten ermöglicht.`,
      };
    } catch {
      return null;
    }
  }
}
