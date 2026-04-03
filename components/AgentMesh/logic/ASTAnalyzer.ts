import * as ts from 'typescript';

export class ASTAnalyzer {
  /**
   * Analyzes text containing code using the TypeScript Compiler API.
   * Parses text into AST and returns the count of functions, and performs Demock validation.
   */
  static async analyzeCode(sourceText: string): Promise<{ nodes: number; functions: number; isValid: boolean; errors: string[] }> {
    return new Promise((resolve) => {
      const sourceFile = ts.createSourceFile(
        'temp.ts',
        sourceText,
        ts.ScriptTarget.Latest,
        true
      );

      let functionCount = 0;
      let totalNodes = 0;
      const errors: string[] = [];

      function visit(node: ts.Node) {
        totalNodes++;

        // Demock validation: Check identifiers and string literals
        if (ts.isIdentifier(node)) {
          const text = node.text.toLowerCase();
          if (text.includes('dummy') || text.includes('mock_')) {
            errors.push(`Invalid identifier found: ${node.text}`);
          }
        }

        if (ts.isStringLiteral(node)) {
          const text = node.text.toLowerCase();
          if (text.includes('dummy') || text.includes('mock_') || text.includes('todo')) {
            errors.push(`Invalid string found: ${node.text}`);
          }
        }

        // Check for console.log
        if (ts.isPropertyAccessExpression(node)) {
          if (node.expression.getText(sourceFile) === 'console' && node.name.text === 'log') {
             errors.push('console.log statements are not allowed.');
          }
        }

        // Single-line and multi-line comments check for TODO
        const fullText = sourceFile.getFullText();
        const comments = ts.getLeadingCommentRanges(fullText, node.getFullStart());
        if (comments) {
            comments.forEach(comment => {
                const commentText = fullText.slice(comment.pos, comment.end).toLowerCase();
                if (commentText.includes('todo')) {
                    errors.push('TODO comments are not allowed.');
                }
            });
        }

        if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
          functionCount++;
          // Check for empty functions
          if (ts.isFunctionDeclaration(node) && node.body && ts.isBlock(node.body) && node.body.statements.length === 0) {
              errors.push(`Empty function found: ${node.name?.text || 'anonymous'}`);
          }
        }
        ts.forEachChild(node, visit);
      }

      // We run the AST traversal
      visit(sourceFile);

      // Make valid only if no errors
      // remove duplicate errors that might happen due to overlapping node structures
      const uniqueErrors = Array.from(new Set(errors));

      resolve({
        nodes: totalNodes,
        functions: functionCount,
        isValid: uniqueErrors.length === 0,
        errors: uniqueErrors,
      });
    });
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
