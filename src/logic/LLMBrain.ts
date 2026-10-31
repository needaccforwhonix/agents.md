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
Input und Output müssen eindeutig beschreiben, was, wo und wie gewünscht ist. Dabei wird stets geholfen. So soll asynchron und parallel alles weiterentwickelt werden und aktuell bleiben. Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Optimierung dieses Prompts und dessen Umsetzung sowie Verbesserung. Starte mindestens ein vollständiges Agent2Agent-Mesh pro Jules-Session, gerne länger. Dies umfasst Testing, Validierung, Aktualisierung aller Dateien sowie ein Cleanup des Projektordners ohne das Löschen von Features, Ideen oder Funktionen. Architektur-Prinzipien: Demock, Testing, ACE, CI/CD-Pipeline, E2E, AST, Dokumentation, Erstellung von TODOs, Implementierung und Verbesserungen (WORM-Prinzip).
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
        what: parsed.what || `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an, basierend auf [${safeWhat}] im Bereich ${context.role}. Input und Output müssen eindeutig beschreiben, was, wo und wie gewünscht ist. Dabei wird stets geholfen. So soll asynchron und parallel alles weiterentwickelt werden und aktuell bleiben. Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Optimierung dieses Prompts und dessen Umsetzung sowie Verbesserung. Starte mindestens ein vollständiges Agent2Agent-Mesh pro Jules-Session, gerne länger. Dies umfasst Testing, Validierung, Aktualisierung aller Dateien sowie ein Cleanup des Projektordners ohne das Löschen von Features, Ideen oder Funktionen. Architektur-Prinzipien: Demock, Testing, ACE, CI/CD-Pipeline, E2E, AST, Dokumentation, Erstellung von TODOs, Implementierung und Verbesserungen (WORM-Prinzip). Identifiziere und setze die nächsten erforderlichen Verbesserungen um. Alle Agenten erhalten jeden Output als Input und können selbst entscheiden, wie sie reagieren.`,
        where: parsed.where || `(WO) Kontext: ${context.name} bearbeitet die Aufgabe basierend auf [${safeWhere}]. Zielorte müssen eindeutig angegeben werden, einschließlich der Aktualisierung aller relevanten Dateien sowie der Bereinigung des Projektordners, um Sauberkeit und Ordnung aufrechtzuerhalten.`,
        how: parsed.how || `(WIE) Reagiert auf die vorherige Aktion [${safeHow}]. Vollständig optimiert umsetzen: Inklusive Testing, Validierung, Update aller Dateien und Projektordner-Cleanup, streng nach den WORM-Prinzipien (Write Once, Read Many - ohne Feature-, Ideen- oder Funktions-Löschungen). Integriere: Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentation, sowie TODO-Erstellung, Implementierung und kontinuierliche Verbesserungen. Format analysis for Jules exactly as: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements]. Jeder A2A-Agent nutzt Agentic Context Engineering (ACE) und den AlphaEvolve-Algorithmus mit Reasoning und vollständigem Kontext.`,
        reasoning: parsed.reasoning || `(WARUM) Als ${context.role} muss ich sicherstellen, dass asynchrone, parallele Verbesserungen im Agent Mesh streng additiv sind (kein Verlust von Funktionen oder Features), aufbauend auf [${safeReasoning}]. Der Output erfüllt alle kontinuierlichen Optimierungsmetriken bezüglich Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Evolved Parameters via AlphaEvolve: ${stringifiedParameters}. Dies stärkt eine robuste Agent2Agent-Struktur, die eine massive, parallele und asynchrone Evolution ermöglicht. Optimierung dieses Prompts, dessen Umsetzung und stetige Verbesserung.`,
      };
    } catch {
      return null;
    }
  }
}
