export class IssueTracker {
  private endpointUrl: string;
  private apiKey: string | undefined;

  constructor(endpointUrl?: string, apiKey?: string) {
    const defaultEndpoint = process.env.GITHUB_REPO_URL ? `${process.env.GITHUB_REPO_URL}/issues` : "https://api.github.com/repos/user/repo/issues";
    const defaultKey = process.env.GITHUB_TOKEN;
    this.endpointUrl = endpointUrl || defaultEndpoint;
    this.apiKey = apiKey || defaultKey;
  }

  async createIssue(title: string, body: string, labels: string[] = []): Promise<boolean> {
    if (!title || title.trim() === "") {
      throw new Error("Issue title cannot be empty");
    }
    if (!body || body.trim() === "") {
      throw new Error("Issue body cannot be empty");
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.endpointUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          body,
          labels,
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
