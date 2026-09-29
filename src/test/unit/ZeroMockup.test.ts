import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function walkDir(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

describe('Zero-Mockup Policy Enforcement', () => {
  it('should verify that all src files contain no mock or dummy patterns (excluding tests)', () => {
    const srcDir = path.resolve(__dirname, '../../');
    const files = walkDir(srcDir).filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));

    for (const filePath of files) {
      const file = path.basename(filePath);
      if (filePath.includes('test/')) continue; // exclude all test files
      const content = fs.readFileSync(filePath, 'utf8');

      // Certain files contain the string "mock" or "dummy" legitimately as part of their logic or text values,
      // such as testing the Demock validation (AST.ts) or explicit prompt rules (RuleBasedBrain.ts, start-mesh.ts, MeshVisualizer.tsx, Mesh.ts)
      const allowedFilesForMockDummy = ['AST.ts', 'RuleBasedBrain.ts', 'Mesh.ts', 'MeshVisualizer.tsx', 'start-mesh.ts', 'LLMBrain.ts'];
      if (!allowedFilesForMockDummy.includes(file)) {
         expect(content).not.toMatch(/dummy/i);
         expect(content).not.toMatch(/mock/i);
      }

      // Explicitly reject console.log to enforce production-readiness programmatically
      if (file !== 'AST.ts') {
         expect(content).not.toMatch(/console\.log/);
      }

      // Checking for the "any" keyword in typescript (basic regex for full word 'any')
      if (file !== 'AST.ts') {
        const lines = content.split('\n');
        for (const line of lines) {
           // Basic check to see if we use `any` as a type or generic
           // We do not want to flag `many` or `company`, so we look for it as a standalone word usually preceded by `:` or `<`
           expect(line).not.toMatch(/:\s*any\b/);
           expect(line).not.toMatch(/<\s*any\s*>/);
        }
      }
    }
  });
});
