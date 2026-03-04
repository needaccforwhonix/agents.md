import * as ts from "typescript";

/**
 * AST Parser
 * Dynamically parses and analyzes code blocks within agent messages
 * to enforce code quality, security, and structure.
 */
export function analyzeCodeBlock(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Create a source file from the provided code string
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true
  );

  // Traverse AST to find basic issues (example: disallow eval for security)
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const expressionText = node.expression.getText(sourceFile);
      if (expressionText === "eval") {
        errors.push("Security Warning: Usage of eval() is not allowed in agent outputs.");
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Extracts TypeScript code blocks from a message string.
 */
export function extractCodeBlocks(messageContent: string): string[] {
  const codeBlockRegex = /```(?:typescript|ts)([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = codeBlockRegex.exec(messageContent)) !== null) {
    if (match[1]) {
      blocks.push(match[1].trim());
    }
  }
  return blocks;
}
