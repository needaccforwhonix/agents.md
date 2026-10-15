import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IssueTracker } from '../../logic/IssueTracker';

describe('IssueTracker', () => {
  const defaultUrl = 'https://api.github.com/repos/user/repo/issues';
  let issueTracker: IssueTracker;

  beforeEach(() => {
    issueTracker = new IssueTracker();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Boundary and Fail-Fast Checks', () => {
    const invalidInputs = [
      { title: '', body: 'Valid body', desc: 'empty title' },
      { title: '   ', body: 'Valid body', desc: 'whitespace title' },
      { title: 'Valid title', body: '', desc: 'empty body' },
      { title: 'Valid title', body: '   ', desc: 'whitespace body' },
    ];

    it.each(invalidInputs)('should throw error for $desc', async ({ title, body }) => {
      await expect(issueTracker.createIssue(title, body)).rejects.toThrowError();
    });
  });

  describe('Success path', () => {
    it('should return true when fetch is successful', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await issueTracker.createIssue('Test Issue', 'Test Body', ['bug']);
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(defaultUrl, expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        }),
        body: JSON.stringify({
          title: 'Test Issue',
          body: 'Test Body',
          labels: ['bug'],
        }),
      }));
    });

    it('should include auth token when provided', async () => {
      const authTracker = new IssueTracker(defaultUrl, 'secret-token');
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      await authTracker.createIssue('Test', 'Body');
      expect(global.fetch).toHaveBeenCalledWith(defaultUrl, expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer secret-token',
        }),
      }));
    });
  });

  describe('Failure path', () => {
    it('should return false when fetch response is not ok', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await issueTracker.createIssue('Test Issue', 'Test Body');
      expect(result).toBe(false);
    });

    it('should return false when fetch throws an error', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await issueTracker.createIssue('Test Issue', 'Test Body');
      expect(result).toBe(false);
    });
  });
});
