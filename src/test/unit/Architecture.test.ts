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

    // Explicitly check for required directories
    expect(directories).toContain('src');
    expect(directories).toContain('bin');
    expect(directories).toContain('docs');
  });

  it('should verify essential files exist in correct locations', () => {
    const rootDir = path.resolve(__dirname, '../../..');

    expect(fs.existsSync(path.join(rootDir, 'docs', 'AGENTS.md'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'bin', 'start-mesh.ts'))).toBe(true);
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
        expect(['next.config.ts', 'next-env.d.ts', 'postcss.config.mjs', 'tailwind.config.ts', 'tsconfig.json', 'package.json', 'package-lock.json', '.eslintrc.json']).toContain(file);
      }
    }
  });
});
