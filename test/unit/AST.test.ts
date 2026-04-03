import { describe, it, expect } from 'vitest';
import { ASTAnalyzer } from '../../components/AgentMesh/logic/ASTAnalyzer';

describe('ASTAnalyzer', () => {
  it('should extract code blocks', () => {
    const text = 'Here is some code:\n```ts\nconst x = 1;\n```\nAnd more:\n```javascript\nlet y = 2;\n```';
    const blocks = ASTAnalyzer.extractCodeBlocks(text);
    expect(blocks.length).toBe(2);
    expect(blocks[0].trim()).toBe('const x = 1;');
  });

  it('should analyze functions and classes', () => {
    const code = `
      class MyAgent {}
      function doTask() {}
      const run = () => {}
    `;
    const ast = ASTAnalyzer.analyzeCodeBlocks(code);
    expect(ast.classes).toContain('MyAgent');
    expect(ast.functions).toContain('doTask');
    expect(ast.functions).toContain('run');
  });

  it('should validate Demock criteria', () => {
    const validCode = 'function calculate() {}';
    const invalidCode = 'function mockData() {}';

    expect(ASTAnalyzer.validateDemock(validCode)).toBe(true);
    expect(ASTAnalyzer.validateDemock(invalidCode)).toBe(false);
  });
});
