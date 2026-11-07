import { describe, it, expect, vi } from 'vitest';
import { IssueTracker } from '../../logic/IssueTracker';
import { AgentContext } from '../../logic/Types';

// Mock LLMBrain to isolate IssueTracker logic
vi.mock('../../logic/LLMBrain', () => {
  return {
    LLMBrain: class {
      decide = vi.fn().mockResolvedValue({
        id: 'test-id',
        senderId: 'test-agent',
        timestamp: 12345,
        what: 'Formatted Issue What',
        where: 'Formatted Issue Where',
        how: 'Formatted Issue How',
        reasoning: 'Formatted Issue Reasoning',
      });
    },
  };
});

describe('IssueTracker', () => {
  const dummyContext: AgentContext = {
    id: 'agent-1',
    name: 'TestAgent',
    role: 'Tester',
    parameters: { responsiveness: 1.0 },
    history: []
  };

  describe('Boundary and Null checks', () => {
    const invalidInputs = [
      { subject: '', details: 'details', context: dummyContext, desc: 'empty subject' },
      { subject: '  ', details: 'details', context: dummyContext, desc: 'whitespace subject' },
      { subject: undefined as unknown as string, details: 'details', context: dummyContext, desc: 'undefined subject' },
      { subject: null as unknown as string, details: 'details', context: dummyContext, desc: 'null subject' },
      { subject: 'subject', details: '', context: dummyContext, desc: 'empty details' },
      { subject: 'subject', details: '  ', context: dummyContext, desc: 'whitespace details' },
      { subject: 'subject', details: undefined as unknown as string, context: dummyContext, desc: 'undefined details' },
      { subject: 'subject', details: null as unknown as string, context: dummyContext, desc: 'null details' },
      { subject: 'subject', details: 'details', context: undefined as unknown as AgentContext, desc: 'undefined context' },
      { subject: 'subject', details: 'details', context: null as unknown as AgentContext, desc: 'null context' },
    ];

    it.each(invalidInputs)('should throw error when $desc is provided', async ({ subject, details, context }) => {
      const tracker = new IssueTracker();
      await expect(tracker.reportIssue(subject, details, context)).rejects.toThrow();
    });
  });

  it('should call LLMBrain.decide and return formatted message', async () => {
    const tracker = new IssueTracker();
    const result = await tracker.reportIssue('Memory Leak', 'Found leak in mesh loop', dummyContext);

    expect(result).toBeDefined();
    expect(result?.what).toBe('Formatted Issue What');
  });
});
