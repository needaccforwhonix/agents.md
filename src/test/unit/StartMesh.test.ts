import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Start Mesh Script Output Verification', () => {
  it('should not contain console.log, console.warn, or console.error in bin/start-mesh.ts', () => {
    const filePath = path.resolve(__dirname, '../../../bin/start-mesh.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).not.toMatch(/console\.log/);
    expect(content).not.toMatch(/console\.warn/);
    expect(content).not.toMatch(/console\.error/);
  });

  it('should use process.stdout.write or process.stderr.write instead of console.*', () => {
    const filePath = path.resolve(__dirname, '../../../bin/start-mesh.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    const hasStdout = /process\.stdout\.write/.test(content);
    const hasStderr = /process\.stderr\.write/.test(content);

    expect(hasStdout || hasStderr).toBe(true);
  });
});
