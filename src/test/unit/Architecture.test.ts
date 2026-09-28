import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Architectural Audit - RULE_Ordnerstruktur', () => {
  it('should verify root directory compliance with RULE_Ordnerstruktur', () => {
    const rootDir = path.resolve(__dirname, '../../..');
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });

    const directories = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => !name.startsWith('.') && name !== 'node_modules'); // Ignore hidden folders and node_modules

    const allowedDirectories = [
      "src", "bin", "docs", "public", "test-results",
      "coverage", "dist", "build", "out", ".next", ".husky"
    ];

    for (const dir of directories) {
      expect(allowedDirectories).toContain(dir);
    }

    // Explicitly check for required directories based on WORM and strict structure
    expect(directories).toContain('src');
    expect(directories).toContain('bin');
    expect(directories).toContain('docs');
  });

  it('should verify essential files exist in correct locations', () => {
    const rootDir = path.resolve(__dirname, '../../..');

    expect(fs.existsSync(path.join(rootDir, 'docs', 'AGENTS.md'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'bin', 'start-mesh.ts'))).toBe(true);
  });

  it('should verify AGENTS.md explicitly details RULE_Ordnerstruktur definitions', () => {
    const rootDir = path.resolve(__dirname, '../../..');
    const agentsMdContent = fs.readFileSync(path.join(rootDir, 'docs', 'AGENTS.md'), 'utf8');

    // Explicitly check for RULE_Ordnerstruktur string
    expect(agentsMdContent).toContain('RULE_Ordnerstruktur');

    // Ensure the required directory paths are explicitly outlined in the agents.md file
    expect(agentsMdContent).toContain('`/src`: Core logic and agent implementations.');
    expect(agentsMdContent).toContain('`/bin`: Compiled artifacts and internal CLI tools.');
    expect(agentsMdContent).toContain('`/docs`: Architectural ADRs and the `agents.md` specification.');
  });

  it('should explicitly fail if any core interface in Types.ts has been deleted or renamed (WORM Immutability Policy)', () => {
    const rootDir = path.resolve(__dirname, '../../..');
    const typesContent = fs.readFileSync(path.join(rootDir, 'src', 'logic', 'Types.ts'), 'utf8');

    expect(typesContent).toContain('export interface Message {');
    expect(typesContent).toContain('export interface AgentParameters {');
    expect(typesContent).toContain('export interface AgentContext {');
    expect(typesContent).toContain('export interface Brain {');
  });

  it('should enforce no-python policy and no forbidden root files', () => {
    const rootDir = path.resolve(__dirname, '../../..');
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });

    const files = entries
      .filter(entry => entry.isFile())
      .map(entry => entry.name);

    for (const file of files) {
      // Disallow Python
      expect(file.endsWith('.py')).toBe(false);
      // Disallow top-level logic apart from specific configs
      if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.mjs') || file.endsWith('.json')) {
        expect(['next.config.ts', 'next-env.d.ts', 'postcss.config.mjs', 'tailwind.config.ts', 'tsconfig.json', 'package.json', 'package-lock.json', '.eslintrc.json', 'tsconfig.tsbuildinfo']).toContain(file);
      }
    }
  });
});
