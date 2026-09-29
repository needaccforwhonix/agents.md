import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AGENTS.md Policy Enforcement and Guidelines', () => {
  const rootDir = path.resolve(__dirname, '../../..');
  const agentsMdContent = fs.readFileSync(path.join(rootDir, 'docs', 'AGENTS.md'), 'utf8');

  it('should explicitly document the WORM Immutability Policy', () => {
    expect(agentsMdContent).toContain('WORM Immutability (Write Once, Read Many)');
    expect(agentsMdContent).toContain('strictly prohibited from deleting existing features');
    expect(agentsMdContent).toContain('// Deprecated');
  });

  it('should explicitly document the Zero-Mockup Policy', () => {
    expect(agentsMdContent).toContain('Zero-Mockup Policy');
    expect(agentsMdContent).toContain('Zero Compiler Warnings');
    expect(agentsMdContent).toContain('No Explicit Any Types');
    expect(agentsMdContent).toContain('No Dummy/Mock Patterns');
  });

  it('should detail the Agent Mesh Directives and Message protocol requirements', () => {
    expect(agentsMdContent).toContain('Agent Mesh Directives');
    expect(agentsMdContent).toContain('`what`, `where`, `how`, and `reasoning`');
    expect(agentsMdContent).toContain('validateMessageBounds');
    expect(agentsMdContent).toContain('democked');
  });

  it('should specify required architectural validation protocols', () => {
    expect(agentsMdContent).toContain('Table-Driven Unit Tests');
    expect(agentsMdContent).toContain('Race Condition Detection');
    expect(agentsMdContent).toContain('Boundary/Nil Checks');
    expect(agentsMdContent).toContain('fail-fast');
  });

  it('should define High-Quality Systems Programming Languages Priority', () => {
    expect(agentsMdContent).toContain('High-Quality Systems Programming Languages Priority');
    expect(agentsMdContent).toContain('Golang');
    expect(agentsMdContent).toContain('Rust');
    expect(agentsMdContent).toContain('No-Python Policy');
  });

  describe('Table-Driven Check for required exact phrases in AGENTS.md', () => {
    const requiredPhrases = [
      "Zero-Allocation Hot Paths",
      "sync.Pool",
      "Typed Interfaces & Schema Enforcement",
      "Concurrency Model",
      "WORM Immutability",
      "Zero-Mockup Policy",
      "Fail-Fast",
      "GPU-Only Mandat",
      "jina-embeddings-v5-omni-nano-classification",
      "google/embeddinggemma-300m",
      "Das Absolute Fallback-Verbot",
      "SQLite Schema CHECK-Constraints",
      "SysSecBot",
      "SysPerfBot",
      "SysGithubBot",
      "SysPublicBot",
      "RULE_Ordnerstruktur"
    ];

    it.each(requiredPhrases.map(phrase => ({ phrase })))('should contain: "$phrase"', ({ phrase }) => {
      expect(agentsMdContent).toContain(phrase);
    });
  });
});
