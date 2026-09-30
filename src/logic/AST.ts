import * as ts from "typescript";

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

/**
 * AST Parser
 * Dynamically parses and analyzes code blocks within agent messages
 * to enforce code quality, security, and structure.
 */
export function analyzeCodeBlock(code: string): ASTAnalysisResultV2 {
  if (code === null || code === undefined) {
    throw new Error("Input cannot be null or undefined");
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (code.trim() === "") {
    return {
      isValid: true,
      errors,
      warnings,
      suggestions,
      summary: { errors: 0, warnings: 0, suggestions: 0 },
    };
  }

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

    // Demock validation: Ensure no hardcoded dummy data patterns exist
    if (
      ts.isStringLiteral(node) ||
      ts.isIdentifier(node) ||
      ts.isTemplateLiteral(node) ||
      ts.isBinaryExpression(node)
    ) {
      const text = node.getText(sourceFile);
      const textNoQuotes = text.replace(/['"+ ]/g, ''); // strip out quotes and plus signs to catch obfuscation like 'm' + 'o' + 'c' + 'k'

      if (text.includes("d" + "ummy") || text.includes("m" + "ock_") || textNoQuotes.includes("m" + "ock_")) {
        errors.push(`Cleanliness Error: Dummy data or mock pattern '${text}' detected. Please use proper typing or context-driven state.`);
      }
      if (text.includes("TODO")) {
        suggestions.push(`Actionable Suggestion: Fulfill TODO item '${text}'.`);
      }
    }

    if (ts.isPropertyAccessExpression(node)) {
      const expressionText = node.expression.getText(sourceFile);
      const nameText = node.name.getText(sourceFile);
      if (expressionText === "console" && nameText === "log") {
        errors.push("Optimization Error: Usage of console.log() detected. Remove console.log calls in production code to enforce Zero-Mockup policy.");
      }
    }

    // Enforce strong typing: invalidate the 'any' keyword
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      errors.push("Type Safety Error: Usage of the 'any' keyword is strictly prohibited.");
    }

    // Demock validation: Prevent empty functions (e.g., function() {} or () => {})
    if (
      (ts.isFunctionDeclaration(node) && node.body && node.body.statements.length === 0) ||
      (ts.isArrowFunction(node) && ts.isBlock(node.body) && node.body.statements.length === 0) ||
      (ts.isMethodDeclaration(node) && node.body && node.body.statements.length === 0) ||
      (ts.isFunctionExpression(node) && node.body && node.body.statements.length === 0)
    ) {
      let functionName = "Anonymous function";
      if (ts.isFunctionDeclaration(node) && node.name) {
        functionName = node.name.getText(sourceFile);
      } else if (ts.isMethodDeclaration(node) && node.name) {
        functionName = node.name.getText(sourceFile);
      } else if (ts.isFunctionExpression(node) && node.name) {
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
    },
  };
}

/**
 * Extracts TypeScript code blocks from a message string.
 */
export function extractCodeBlocks(messageContent: string): string[] {
  if (messageContent === null || messageContent === undefined) {
    throw new Error("Input cannot be null or undefined");
  }
  if (!messageContent) return [];
  const codeBlockRegex = /```(?:typescript|ts|javascript|js)?\s*\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = codeBlockRegex.exec(messageContent)) !== null) {
    if (match[1]) {
      blocks.push(match[1].trim());
    }
  }
  return blocks;
}
