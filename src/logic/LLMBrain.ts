import { Brain, Message, AgentContext } from "./Types";

/**
 * Automatically creates external issue reports via the GitHub REST API.
 */
export class IssueTracker {
  private repoUrl: string;
  private token: string;

  constructor() {
    this.repoUrl = process.env.GITHUB_REPO_URL || "";
    this.token = process.env.GITHUB_TOKEN || "";
  }

  public async reportIssue(title: string, body: string): Promise<void> {
    if (!this.repoUrl || !this.token) {
      return;
    }

    try {
      // Extract owner and repo from URL, e.g. https://github.com/owner/repo
      const match = this.repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return;

      const owner = match[1];
      const repo = match[2].replace(".git", "");
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;

      await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "Authorization": `token ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });
    } catch {
      // Silently fail if issue tracker cannot reach external API
    }
  }
}

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
Input und Output müssen eindeutig beschreiben, was, wo und wie gewollt ist. Dabei kann stets geholfen werden. So soll asynchron und parallel alles weiterentwickelt werden und aktuell bleiben. Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Optimierung dieses Prompts und dessen Umsetzung und Verbesserung. Starte mindestens ein vollständiges Agent2Agent Mesh pro Jules Session, gerne länger. Inklusive Testing, Validierung, Update aller Dateien inkl. Projektordner-Cleanup ohne Feature-, Ideen- oder Funktions-Löschungen. Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentationen, Todos Creation, Implementierungen und Improvements.
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

      const issueTracker = new IssueTracker();
      if (parsed.what && parsed.what.toLowerCase().includes("root cause analysis") || parsed.how && parsed.how.toLowerCase().includes("actionable code-fix")) {
        await issueTracker.reportIssue(`Agent Actionable Insight from ${context.name}`, `**What:** ${parsed.what}\n\n**Where:** ${parsed.where}\n\n**How:** ${parsed.how}\n\n**Reasoning:** ${parsed.reasoning}`);
      }

      return {
        id: crypto.randomUUID(),
        senderId: context.id,
        timestamp: Date.now(),
        what: parsed.what || `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an basierend auf [${safeWhat}] im Bereich ${context.role}. Input und Output müssen eindeutig beschreiben, was, wo und wie gewollt ist. Dabei kann stets geholfen werden. So soll asynchron und parallel alles weiterentwickelt werden und aktuell bleiben. Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Optimierung dieses Prompts und dessen Umsetzung und Verbesserung. Starte mindestens ein vollständiges Agent2Agent Mesh pro Jules Session, gerne länger. Inklusive Testing, Validierung, Update aller Dateien inkl. Projektordner-Cleanup ohne Feature-, Ideen- oder Funktions-Löschungen. Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentationen, Todos Creation, Implementierungen und Improvements. Identifiziere und implementiere die nächsten nötigen Verbesserungen. Alle Agents erhalten jeden Output als Input und können entscheiden, wie sie reagieren.`,
        where: parsed.where || `(WO) Context: ${context.name} verarbeitet Aufgabe basierend auf [${safeWhere}]. Zielorte müssen eindeutig spezifiziert werden, inklusive Aktualisierung aller Dateien sowie Projektordner-Cleanup, um Sauberkeit und Ordnung beizubehalten.`,
        how: parsed.how || `(WIE) Reagiert auf vorherige Aktion [${safeHow}]. Vollständig optimiert umsetzen: Inklusive Testing, Validierung, Update aller Dateien inkl. Projektordner-Cleanup ohne Feature-, Ideen- oder Funktions-Löschungen. Demock, Testing, ACE, CI/CD Pipeline, E2E, AST, Dokumentationen, Todos Creation, Implementierungen und Improvements. Format analysis for Jules exactly as: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements]. Jeder A2A-Agent nutzt Agentic Context Engineering und den AlphaEvolve-Algorithmus mit Reasoning und vollständigem Kontext.`,
        reasoning: parsed.reasoning || `(WARUM) Als ${context.role} muss ich sicherstellen, dass asynchrone, parallele Verbesserungen streng additiv sind (ohne Funktions-/Feature-Verlust), aufbauend auf [${safeReasoning}]. Der Output erfüllt alle kontinuierlichen Optimierungs-Metriken bezüglich Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung. Evolved Parameters via AlphaEvolve: ${stringifiedParameters}. Um eine robuste Agent2Agent-Struktur zu stärken, die eine massive parallele asynchrone Evolution ermöglicht. Optimierung dieses Prompts und dessen Umsetzung und Verbesserung.`,
      };
    } catch {
      return null;
    }
  }
}
