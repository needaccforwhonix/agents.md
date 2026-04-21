import { describe, it, expect } from 'vitest';
import { analyzeCodeBlock } from '../../components/AgentMesh/logic/AST';

describe('AST Demock Validation', () => {
  it('should invalidate code containing dummy data string literals', () => {
    const code = `const name = "dummy_user";`;
    const result = analyzeCodeBlock(code);
    expect(result.isValid).toBe(false);
    expect([...result.errors, ...result.warnings].some(err => err.includes("dummy_user"))).toBe(true);
  });

  it('should invalidate code containing mock_ identifiers', () => {
    const code = `const mock_user = { id: 1 };`;
    const result = analyzeCodeBlock(code);
    expect(result.isValid).toBe(false);
    expect([...result.errors, ...result.warnings].some(err => err.includes("mock_user"))).toBe(true);
  });

  it('should invalidate empty function declarations', () => {
    const code = `function doNothing() {}`;
    const result = analyzeCodeBlock(code);
    expect(result.isValid).toBe(false);
    expect([...result.errors, ...result.warnings].some(err => err.includes("Empty function 'doNothing'"))).toBe(true);
  });

  it('should invalidate empty arrow functions', () => {
    const code = `const noop = () => {};`;
    const result = analyzeCodeBlock(code);
    expect(result.isValid).toBe(false);
    expect([...result.errors, ...result.warnings].some(err => err.includes("Empty function"))).toBe(true);
  });

  it('should invalidate empty methods in a class', () => {
    const code = `class Test { myMethod() {} }`;
    const result = analyzeCodeBlock(code);
    expect(result.isValid).toBe(false);
    expect([...result.errors, ...result.warnings].some(err => err.includes("Empty function 'myMethod'"))).toBe(true);
  });

  it('should invalidate code containing console.log', () => {
    const code = `console.log("hello");`;
    const result = analyzeCodeBlock(code);
    expect(result.isValid).toBe(false);
    expect([...result.errors, ...result.warnings].some(err => err.includes("Usage of console.log() detected"))).toBe(true);
  });

  it('should invalidate code containing TODO string', () => {
    const code = `const note = "TODO: fix this";`;
    const result = analyzeCodeBlock(code);
    expect(result.isValid).toBe(false);
    expect([...result.errors, ...result.warnings].some(err => err.includes("TODO"))).toBe(true);
  });

  it('should allow valid code', () => {
    const code = `
      function add(a: number, b: number): number {
        return a + b;
      }
      const user = { name: "John Doe", id: 1 };
      class Counter {
        count = 0;
        increment() {
          this.count += 1;
        }
      }
    `;
    const result = analyzeCodeBlock(code);
    expect(result.isValid).toBe(true);
    expect(result.errors.length + result.warnings.length).toBe(0);
  });
});