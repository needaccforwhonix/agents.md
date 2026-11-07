import { LLMBrain } from "./LLMBrain";
import { Message, AgentContext } from "./Types";

/**
 * Service to integrate AgentMesh findings with external issue trackers.
 * Analyzes and formats raw simulation outputs into actionable tickets.
 */
export class IssueTracker {
  private llmBrain: LLMBrain;

  constructor(endpointUrl?: string, apiKey?: string) {
    this.llmBrain = new LLMBrain(endpointUrl, apiKey);
  }

  /**
   * Reports an issue by evaluating raw context via LLMBrain and formatting the result.
   */
  async reportIssue(issueSubject: string, details: string, sourceAgent: AgentContext): Promise<Message | null> {
    if (typeof issueSubject !== 'string' || issueSubject.trim() === '') {
      throw new Error("Invalid issueSubject provided.");
    }
    if (typeof details !== 'string' || details.trim() === '') {
      throw new Error("Invalid details provided.");
    }
    if (sourceAgent === null || sourceAgent === undefined) {
      throw new Error("Invalid sourceAgent provided.");
    }

    const reportMessage: Message = {
      id: crypto.randomUUID(),
      senderId: "system-issue-tracker",
      timestamp: Date.now(),
      what: `(WAS) Evaluiere folgendes Issue für ein externes Ticketsystem: ${issueSubject}`,
      where: `(WO) Context: ${sourceAgent.name} in domain ${sourceAgent.role}`,
      how: `(WIE) Analysiere und strukturiere die Details: ${details}. Format analysis for Jules exactly as: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements].`,
      reasoning: "(WARUM) Um ein verwertbares Ticket für externe Tracking-Systeme zu erstellen, basierend auf kontinuierlicher Agent2Agent Evolution.",
    };

    return this.llmBrain.decide(reportMessage, sourceAgent);
  }
}
