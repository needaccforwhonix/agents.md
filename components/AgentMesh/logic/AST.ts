import * as ts from "typescript";

/**
 * AST Parser
 * Dynamically parses and analyzes code blocks within agent messages
 * to enforce code quality, security, and structure.
 */
export interface ASTAnalysisResultV2 {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  summary: {
    errors: number;
    warnings: number;
    suggestions: number;
  };
}

export function analyzeCodeBlock(code: string): ASTAnalysisResultV2 {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

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
        errors.push("Security Error: Usage of eval() is not allowed in agent outputs.");
      }
    }

    // Demock validation: Ensure no hardcoded dummy data patterns exist
    if (ts.isStringLiteral(node) || ts.isIdentifier(node)) {
      const text = node.getText(sourceFile);
      if (text.includes("dummy") || text.includes("mock_")) {
        errors.push(`Cleanliness Error: Dummy data or mock pattern '${text}' detected. Please use proper typing or context-driven state.`);
      }
      if (text.includes("TODO")) {
        warnings.push(`Cleanliness Warning: TODO '${text}' detected.`);
      }
    }

    if (ts.isPropertyAccessExpression(node)) {
      const expressionText = node.expression.getText(sourceFile);
      const nameText = node.name.getText(sourceFile);
      if (expressionText === "console" && nameText === "log") {
        warnings.push("Optimization Warning: Usage of console.log() detected. Remove console.log calls in production code.");
      }
    }

    // Demock validation: Prevent empty functions (e.g., function() {} or () => {})
    if (
      (ts.isFunctionDeclaration(node) && node.body && node.body.statements.length === 0) ||
      (ts.isArrowFunction(node) && ts.isBlock(node.body) && node.body.statements.length === 0) ||
      (ts.isMethodDeclaration(node) && node.body && node.body.statements.length === 0)
    ) {
      let functionName = "Anonymous function";
      if (ts.isFunctionDeclaration(node) && node.name) {
        functionName = node.name.getText(sourceFile);
      } else if (ts.isMethodDeclaration(node) && node.name) {
        functionName = node.name.getText(sourceFile);
      }
      errors.push(`Optimization Error: Empty function '${functionName}' detected. Avoid empty implementations.`);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      suggestions: suggestions.length,
    }
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
