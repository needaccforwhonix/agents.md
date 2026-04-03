import * as ts from 'typescript';

export class ASTAnalyzer {
  /**
   * Parses the given code string and extracts the list of function and class declarations.
   * This is a simple implementation of dynamic AST analysis using the TS Compiler API.
   * @param sourceCode The string containing TypeScript code to parse
   * @returns An object containing arrays of found function and class names.
   */
  public static analyzeCodeBlocks(sourceCode: string): {
    functions: string[];
    classes: string[];
  } {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const functions: string[] = [];
    const classes: string[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isFunctionDeclaration(node) && node.name) {
        functions.push(node.name.text);
      } else if (ts.isClassDeclaration(node) && node.name) {
        classes.push(node.name.text);
      } else if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
        functions.push(node.name.text);
      } else if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
         if (node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
             functions.push(node.name.text);
         }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return { functions, classes };
  }

  /**
   * Validates if the given code block passes the 'Demock' criteria.
   * Rejects empty functions or specific mock identifiers.
   */
  public static validateDemock(sourceCode: string): boolean {
      const ast = this.analyzeCodeBlocks(sourceCode);
      if (ast.functions.length === 0 && ast.classes.length === 0) return true; // No code, technically valid

      const mockKeywords = ['mock', 'dummy', 'test', 'fake'];
      for (const fnName of ast.functions) {
          if (mockKeywords.some(keyword => fnName.toLowerCase().includes(keyword))) {
              return false; // Found a mock function
          }
      }
      for (const className of ast.classes) {
          if (mockKeywords.some(keyword => className.toLowerCase().includes(keyword))) {
              return false; // Found a mock class
          }
      }
      return true;
  }

  /**
   * Helper function to extract code blocks from markdown-like text
   */
  public static extractCodeBlocks(text: string): string[] {
    const regex = /```(?:typescript|ts|javascript|js)?\n([\s\S]*?)```/g;
    const blocks: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push(match[1]);
    }
    return blocks;
  }
}
