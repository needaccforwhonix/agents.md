import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Architectural Audit - RULE_Ordnerstruktur', () => {
  it('should verify root directory compliance with RULE_Ordnerstruktur', () => {
    const rootDir = path.resolve(__dirname, '../..');
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });

    const directories = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => !name.startsWith('.') && name !== 'node_modules'); // Ignore hidden folders and node_modules

    const allowedDirectories = [
      'src', 'bin', 'docs', 'test', 'public', 'test-results',
      'coverage', 'dist', 'build', 'out', '.next', '.husky'
    ];

    for (const dir of directories) {
      expect(allowedDirectories).toContain(dir);
    }

    // Explicitly check for required directories
    expect(directories).toContain('src');
    expect(directories).toContain('bin');
    expect(directories).toContain('docs');
  });
});
