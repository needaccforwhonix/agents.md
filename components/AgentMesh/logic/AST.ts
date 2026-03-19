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

    // Demock validation: Ensure no hardcoded dummy data patterns exist in strings
    if (ts.isStringLiteral(node)) {
      const text = node.getText(sourceFile);
      if (text.includes("dummy") || text.includes("mock_")) {
        errors.push("Cleanliness Warning: Dummy data or mock string detected. Please use proper typing or context-driven state.");
      }
    }

    // Demock validation: Check identifiers (variable names, function names) for mock/dummy patterns
    if (ts.isIdentifier(node)) {
      const text = node.getText(sourceFile).toLowerCase();
      if (text.includes("dummy") || text.includes("mock_")) {
        errors.push(`Cleanliness Warning: Dummy/Mock identifier '${node.getText(sourceFile)}' detected. Avoid hardcoded mock states.`);
      }
    }

    // Code Quality validation: Check for empty function bodies
    if (ts.isBlock(node) && node.parent) {
      if (
        ts.isFunctionDeclaration(node.parent) ||
        ts.isMethodDeclaration(node.parent) ||
        ts.isArrowFunction(node.parent) ||
        ts.isFunctionExpression(node.parent)
      ) {
        // Filter out trivia like comments to see if it's truly empty
        const isActuallyEmpty = node.statements.length === 0;
        if (isActuallyEmpty) {
          errors.push("Code Quality Warning: Empty function body detected. All functions should have implementation or be removed.");
        }
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
