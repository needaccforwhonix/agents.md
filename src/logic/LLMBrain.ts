import { Brain, Message, AgentContext } from "./Types";

/**
 * IssueTracker integration for automatically creating external issues.
 */
export class IssueTracker {
  private repoUrl: string | undefined;
  private token: string | undefined;

  constructor() {
    this.repoUrl = process.env.GITHUB_REPO_URL;
    this.token = process.env.GITHUB_TOKEN;
  }

  async reportIssue(title: string, body: string): Promise<boolean> {
    if (!this.repoUrl || !this.token) {
      // Gracefully skip if credentials are not configured
      return false;
    }

    // In a real implementation this would make an API call, e.g., to GitHub Issues
    // For this simulation we simulate a successful API request
    try {
      // Simulate external API call latency
      await new Promise((resolve) => setTimeout(resolve, 50));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Strategy pattern for decision making using real Language Models (LLM).
 */
export class LLMBrain implements Brain {
  private endpointUrl: string;
  private apiKey: string | undefined;
  private issueTracker: IssueTracker;

  constructor(endpointUrl: string = "http://localhost:11434/api/generate", apiKey?: string) {
    this.endpointUrl = endpointUrl;
    this.apiKey = apiKey;
    this.issueTracker = new IssueTracker();
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

    const systemPrompt = `Du bist ein autonomer Agent2Agent Mesh-Knotenpunkt namens ${context.name} mit der Rolle ${context.role}.
Inputs und Outputs müssen absolut eindeutig beschreiben, was, wo und wie gewünscht wird. Leiste dabei stets proaktive und kontextuelle Unterstützung. Ziel ist es, das System asynchron und parallel weiterzuentwickeln und stets auf dem neuesten Stand zu halten. Höchste Priorität haben Sicherheit Performance Style Dokumentation Sauberkeit Ordnung. Optimiere kontinuierlich diesen Prompt, dessen Umsetzung und generelle Verbesserungen. Starte mindestens einen vollständigen Agent2Agent Mesh-Zyklus pro Session, idealerweise mit verlängerter Dauer. Dies umfasst Testing, Validierung, die Aktualisierung aller Dateien sowie Projektordner-Cleanup, strikt ohne Feature-, Ideen- oder Funktionsverlust (WORM-Prinzip). Erforderlich: Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentationen, Todo-Erstellung, Implementierungen und Improvements.
Return exactly a valid JSON object with what, where, how, and reasoning fields.`;

    const userPrompt = `Eingehende Nachricht von ${message.senderId}:
What (WAS): ${safeWhat}
Where (WO): ${safeWhere}
How (WIE): ${safeHow}
Reasoning (WARUM): ${safeReasoning}

Aktuelle Agenten-Parameter: ${stringifiedParameters}

Generiere eine JSON-Antwort, die den System-Direktiven exakt entspricht. Formatiere die Ausgabe für Jules präzise wie folgt: @jules [Root Cause Analysis des Problems (inklusive Chain-of-Thought)] + [Actionable Code-Fix] + [Quality/Performance Improvements].`;

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

      // Attempt to automatically report issues if specific keywords are found in the response reasoning
      if (parsed.reasoning && parsed.reasoning.toLowerCase().includes("issue") && parsed.reasoning.toLowerCase().includes("report")) {
        await this.issueTracker.reportIssue(`Automated Mesh Report: ${context.role}`, parsed.reasoning);
      }

      return {
        id: crypto.randomUUID(),
        senderId: context.id,
        timestamp: Date.now(),
        what: parsed.what || `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierungen an basierend auf [${safeWhat}] im Bereich ${context.role}. Inputs und Outputs müssen eindeutig beschreiben, was, wo und wie gewünscht wird. Dabei wird stets kontextuell unterstützt. Dadurch soll die asynchrone, parallele Weiterentwicklung vorangetrieben und das System aktuell gehalten werden. Der Fokus liegt auf Sicherheit Performance Style Dokumentation Sauberkeit Ordnung. Dies schließt die Optimierung dieses Prompts sowie dessen Implementierung und Verbesserung ein. Starte mindestens einen vollständigen Agent2Agent Mesh-Zyklus pro Session, idealerweise mit verlängerter Laufzeit. Beinhaltet: Testing, Validierung, Aktualisierung aller Dateien und Projektordner-Cleanup ohne jeglichen Verlust von Features, Ideen oder Funktionen (WORM-Prinzip). Erforderliche Architekturen: Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentationen, Todo-Erstellung, Implementierungen und Verbesserungen. Identifiziere und implementiere die nächsten zwingenden Iterationen. Jeder Agent empfängt jeden Output als Input und entscheidet autonom über seine Reaktion.`,
        where: parsed.where || `(WO) Kontext: Agent ${context.name} verarbeitet die Anweisung basierend auf dem Ursprungsort [${safeWhere}]. Alle Zielorte müssen absolut eindeutig spezifiziert werden. Dies beinhaltet die Aktualisierung aller betroffenen Dateien und ein strukturelles Projektordner-Cleanup, um dauerhaft Sauberkeit und Ordnung zu gewährleisten.`,
        how: parsed.how || `(WIE) Reaktion auf die vorherige Aktion: [${safeHow}]. Setze die Anforderungen vollständig und optimiert um, einschließlich: Testing, Validierung, Aktualisierung aller Dateien sowie Projektordner-Cleanup, strikt ohne Feature-, Ideen- oder Funktionsverlust. Anzuwendende Prinzipien: Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentationen, Todo-Management, Implementierungen und kontinuierliche Verbesserungen. Formatiere die Ausgabe für Jules exakt nach folgendem Muster: @jules [Root Cause Analysis des Problems (inklusive Chain-of-Thought)] + [Actionable Code-Fix] + [Quality/Performance Improvements]. Jeder A2A-Agent verwendet zwingend Agentic Context Engineering (ACE) und den AlphaEvolve-Algorithmus mit tiefgehendem Reasoning unter Einbezug des gesamten Kontexts.`,
        reasoning: parsed.reasoning || `(WARUM) In meiner Rolle als ${context.role} ist es unabdingbar sicherzustellen, dass sämtliche asynchronen und parallelen Modifikationen strikt additiv erfolgen (kein Funktions- oder Feature-Verlust), aufbauend auf der Argumentationskette: [${safeReasoning}]. Das generierte Resultat erfüllt kompromisslos alle Metriken für kontinuierliche Optimierung hinsichtlich Sicherheit Performance Style Dokumentation Sauberkeit Ordnung. Aktueller Status der durch AlphaEvolve mutierten Parameter: ${stringifiedParameters}. Dies dient der Festigung einer resilienten Agent2Agent-Struktur, welche massive, parallele und asynchrone Systemevolution ermöglicht, nebst stetiger Optimierung und Anpassung dieser Systemanweisungen.`,
      };
    } catch {
      return null;
    }
  }
}
