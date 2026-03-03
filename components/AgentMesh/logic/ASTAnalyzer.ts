import * as ts from 'typescript';

export class ASTAnalyzer {
  /**
   * Analyzes text containing code using the TypeScript Compiler API.
   * Parses text into AST and returns the count of functions/declarations found.
   */
  static analyzeCode(sourceText: string): { nodes: number; functions: number } {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      sourceText,
      ts.ScriptTarget.Latest,
      true
    );

    let functionCount = 0;
    let totalNodes = 0;

    function visit(node: ts.Node) {
      totalNodes++;
      if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
        functionCount++;
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return {
      nodes: totalNodes,
      functions: functionCount,
    };
  }

  /**
   * Helps an agent determine if the message contains actionable TypeScript code blocks.
   */
  static hasCodeBlocks(text: string): boolean {
    return text.includes('```typescript') || text.includes('```ts');
  }

  static extractCodeBlocks(text: string): string[] {
    const regex = /```(typescript|ts)\n([\s\S]*?)```/g;
    const blocks: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push(match[2]);
    }
    return blocks;
  }
}
