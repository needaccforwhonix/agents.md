import { describe, it, expect } from "vitest";
import { analyzeCodeBlock, extractCodeBlocks } from "../../src/logic/AST";

describe("AST Module", () => {
    describe("analyzeCodeBlock", () => {
        it("should return valid for empty code", () => {
            const result = analyzeCodeBlock("");
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should catch eval()", () => {
            const result = analyzeCodeBlock("eval('something');");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Security Warning: Usage of eval() is not allowed in agent outputs.");
        });

        it("should catch 'any' keyword", () => {
            const result = analyzeCodeBlock("let x: any;");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Type Safety Error: Usage of the 'any' keyword is strictly prohibited.");
        });

        it("should catch console.log", () => {
            const result = analyzeCodeBlock("console.log('hi');");
            expect(result.warnings).toContain("Optimization Warning: Usage of console.log() detected. Remove console.log calls in production code.");
        });

        it("should catch 'dummy' or 'mock_' in strings/identifiers", () => {
            const result1 = analyzeCodeBlock("const dummyVar = 1;");
            expect(result1.isValid).toBe(false);
            expect(result1.errors[0]).toContain("dummyVar");

            const result2 = analyzeCodeBlock("const x = 'mock_data';");
            expect(result2.isValid).toBe(false);
            expect(result2.errors[0]).toContain("mock_data");
        });

        it("should catch mock identifiers within destructured objects/arrays", () => {
            const result1 = analyzeCodeBlock("const { mock_id } = obj;");
            expect(result1.isValid).toBe(false);
            expect(result1.errors[0]).toContain("mock_id");

            const result2 = analyzeCodeBlock("const [dummy_val] = arr;");
            expect(result2.isValid).toBe(false);
            expect(result2.errors[0]).toContain("dummy_val");
        });

        it("should suggest for 'TODO'", () => {
            const result = analyzeCodeBlock("const x = 'TODO: something';");
            expect(result.suggestions[0]).toContain("TODO: something");
        });

        it("should catch empty function declaration", () => {
            const result = analyzeCodeBlock("function myEmpty() {}");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Optimization Error: Empty function 'myEmpty' detected. Avoid empty implementations.");
        });

        it("should catch empty arrow function", () => {
            const result = analyzeCodeBlock("const f = () => {}");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Optimization Error: Empty function 'Anonymous function' detected. Avoid empty implementations.");
        });

        it("should catch empty method declaration", () => {
            const result = analyzeCodeBlock("class A { myMethod() {} }");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Optimization Error: Empty function 'myMethod' detected. Avoid empty implementations.");
        });
    });

    describe("extractCodeBlocks", () => {
        it("should extract ts blocks", () => {
            const msg = "Here is some code:\n```typescript\nconst x = 1;\n```\nAnd more:\n```ts\nconst y = 2;\n```";
            const blocks = extractCodeBlocks(msg);
            expect(blocks).toEqual(["const x = 1;", "const y = 2;"]);
        });

        it("should extract javascript and plain blocks", () => {
            const msg = "```javascript\nconst a = 1;\n```\nPlain block:\n```\nconst b = 2;\n```";
            const blocks = extractCodeBlocks(msg);
            expect(blocks).toEqual(["const a = 1;", "const b = 2;"]);
        });

        it("should return empty if no match", () => {
            const blocks = extractCodeBlocks("Just text");
            expect(blocks).toEqual([]);
        });
    });
});
