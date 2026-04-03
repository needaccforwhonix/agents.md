import { describe, it, expect } from 'vitest';
import { ASTAnalyzer } from '../../components/AgentMesh/logic/ASTAnalyzer';

describe('ASTAnalyzer with Demock Validation', () => {
  it('identifies code with mock data as invalid', async () => {
    const code = `
      function mock_getData() {
        return "dummy data";
      }
    `;
    const result = await ASTAnalyzer.analyzeCode(code);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes('mock_'))).toBe(true);
  });

  it('identifies clean code as valid', async () => {
    const code = `
      function calculateSum(a: number, b: number): number {
        return a + b;
      }
    `;
    const result = await ASTAnalyzer.analyzeCode(code);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('flags TODOs and console.logs', async () => {
    const code = `
      function process() {
        // TODO: implement this
        console.log("processing...");
      }
    `;
    const result = await ASTAnalyzer.analyzeCode(code);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('TODO'))).toBe(true);
  });
});
