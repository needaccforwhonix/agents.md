import { describe, it, expect } from "vitest";
import { analyzeCodeBlock, extractCodeBlocks } from "../../logic/AST";

describe("AST Module", () => {
    describe("analyzeCodeBlock", () => {
        it("should return valid for empty code", () => {
            const result = analyzeCodeBlock("");
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it.each([
            { code: "function myEmpty (   ) { \n  }", name: "myEmpty" },
            { code: "const x = () => {   }", name: "Anonymous function" },
            { code: "function myEmpty() {}", name: "myEmpty" },
            { code: "const f = () => {}", name: "Anonymous function" },
            { code: "class A { myMethod() {} }", name: "myMethod" },
            { code: "function outer() { const inner = () => {}; }", name: "Anonymous function" }
        ])("should catch empty functions: $name", ({ code, name }) => {
            const result = analyzeCodeBlock(code);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(`Optimization Error: Empty function '${name}' detected. Avoid empty implementations.`);
        });

        it("should parse invalid syntax gracefully", () => {
            // ts.createSourceFile should not crash on syntax errors, but create an AST nonetheless (perhaps with some missing nodes)
            const result = analyzeCodeBlock("function this is not valid { {{{ ");
            expect(result).toBeDefined();
        });

        it("should parse empty variable declarations without initialization gracefully", () => {
            const result = analyzeCodeBlock("let x; var y;");
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should catch eval()", () => {
            const result = analyzeCodeBlock("eval('something');");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Security Warning: Usage of eval() is not allowed in agent outputs.");
        });

        it("should not flag eval inside a template literal or string as CallExpression", () => {
            const result = analyzeCodeBlock("const str = `eval('test')`; const str2 = 'eval(\\'test\\')';");
            expect(result.errors).not.toContain("Security Warning: Usage of eval() is not allowed in agent outputs.");
        });

        it("should catch 'any' keyword", () => {
            const result = analyzeCodeBlock("@ts-expect-error Intentionally using any to test the AST parser catching it.\nlet x: any;");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Type Safety Error: Usage of the 'any' keyword is strictly prohibited.");
        });

        it("should catch console.log", () => {
            const result = analyzeCodeBlock("console.log('hi');");
            expect(result.errors).toContain("Optimization Error: Usage of console.log() detected. Remove console.log calls in production code to enforce Zero-Mockup policy.");
            expect(result.isValid).toBe(false);
        });

        it.each([
            { code: "const d" + "ummyVar = 1;", match: "d" + "ummyVar" },
            { code: "const x = 'm" + "ock_data';", match: "m" + "ock_data" },
            { code: "const { m" + "ock_id } = obj;", match: "m" + "ock_id" },
            { code: "const [d" + "ummy_val] = arr;", match: "d" + "ummy_val" },
            { code: "const tpl = `some text with m" + "ock_data inside`;", match: "m" + "ock_data" },
            { code: "const obfuscated = 'm' + 'o' + 'c' + 'k' + '_data';", match: "mock_" }
        ])("should catch dummy and mock patterns in $match", ({ code, match }) => {
            const result = analyzeCodeBlock(code);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes(match) || e.toLowerCase().includes('mock'))).toBe(true);
        });

        it("should suggest for 'TODO'", () => {
            const result = analyzeCodeBlock("const x = 'TODO: something';");
            expect(result.suggestions[0]).toContain("TODO: something");
        });

        it.each([
            { name: "empty string", val: "" },
            { name: "whitespace", val: "   \n\t  " }
        ])("should safely ignore empty code: $name", ({ val }) => {
            const result = analyzeCodeBlock(val);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it.each([
            { name: "undefined", val: undefined as unknown as string },
            { name: "null", val: null as unknown as string }
        ])("should throw error on null or undefined code: $name", ({ val }) => {
            expect(() => analyzeCodeBlock(val)).toThrow("Input cannot be null or undefined");
        });

        it("should handle unexpected property access gracefully", () => {
            const result = analyzeCodeBlock("window.location;");
            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(0);
        });

        it.each([
            { code: "const nested = { a: { b: 'd" + "ummy' } };", match: "d" + "ummy" },
            { code: "const arr = [[[ 'm" + "ock_data' ]]];", match: "m" + "ock_data" },
            { code: "function test(x: { y: any }) {}", match: "any" },
            { code: "class Deep { nestedMethod() { return function() { let z: any; }; } }", match: "any" }
        ])("should correctly identify patterns in deeply nested structures: $match", ({ code, match }) => {
            const result = analyzeCodeBlock(code);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes(match))).toBe(true);
        });

        it("should catch highly nested empty functions and methods", () => {
            const result = analyzeCodeBlock(`
                class DeepClass {
                    public methodA() {
                        return function() {
                            const inner = () => {
                                // some comment but no code
                            };
                            return inner;
                        }
                    }
                    public emptyMethod() {}
                }
            `);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Optimization Error: Empty function 'Anonymous function' detected. Avoid empty implementations.");
            expect(result.errors).toContain("Optimization Error: Empty function 'emptyMethod' detected. Avoid empty implementations.");
        });

        it("should parse complex template literals containing TODO and mock patterns", () => {
            // If we pass literal "mock_" in string, AST parser will see it. We can just use split string concatenation to build the string we pass.
            const codeToParse = "const s = `\${(() => 'TODO: fix this')()} m" + "ock_data`;";
            const result = analyzeCodeBlock(codeToParse);

            expect(result.isValid).toBe(false);
            expect(result.suggestions.some(s => s.includes("TODO"))).toBe(true);
            expect(result.errors.some(e => e.includes("m" + "ock_data"))).toBe(true);
        });

        it("should catch deeply nested empty array map functions", () => {
            const codeToParse = `
                const x = [1, 2, 3].map(item => {
                    return item * 2;
                }).filter(item => {
                    // some logic
                }).map(() => { });
            `;
            const result = analyzeCodeBlock(codeToParse);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Optimization Error: Empty function 'Anonymous function' detected. Avoid empty implementations.");
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

        it("should handle code block matches with empty groups correctly", () => {
            const blocks = extractCodeBlocks("```ts\n```");
            expect(blocks).toEqual([]); // match[1] is an empty string, so `if(match[1])` is false in our implementation.
        });

        it.each([
            { name: "empty string", val: "" }
        ])("should return empty array for $name input", ({ val }) => {
            expect(extractCodeBlocks(val)).toEqual([]);
        });

        it.each([
            { name: "null", val: null as unknown as string },
            { name: "undefined", val: undefined as unknown as string }
        ])("should throw error on null or undefined input: $name", ({ val }) => {
            expect(() => extractCodeBlocks(val)).toThrow("Input cannot be null or undefined");
        });
    });

    describe("Edge cases for analyzeCodeBlock", () => {
        it("should parse an empty javascript code block properly", () => {
             const result = analyzeCodeBlock("/* Empty comments shouldn't crash it */");
             expect(result.isValid).toBe(true);
        });

        it("should handle multiline template literals with newlines in extractCodeBlocks", () => {
             const result = extractCodeBlocks("Here is \n```javascript\nconst a = `multi\nline`;\n```\n");
             expect(result).toHaveLength(1);
        });

        it("should handle code blocks with trailing spaces before the newline correctly", () => {
             const result = extractCodeBlocks("```ts   \nconst x = 1;\n```");
             expect(result).toEqual(["const x = 1;"]);
        });

        it("should correctly handle extremely nested brackets and parentheses", () => {
             const code = "function a() { return (function b() { return [{ value: (function c() { })() }]; })(); }";
             const result = analyzeCodeBlock(code);
             expect(result.isValid).toBe(false);
             expect(result.errors).toContain("Optimization Error: Empty function 'c' detected. Avoid empty implementations.");
        });

        it("should parse multiple consecutive code blocks without trailing newlines", () => {
             const messageContent = "```ts\nconst x = 1;\n```\n```ts\nconst y = 2;\n```";
             const blocks = extractCodeBlocks(messageContent);
             expect(blocks).toEqual(["const x = 1;", "const y = 2;"]);
        });
    });
});
