import * as ts from "typescript";

/**
 * Interface representing the detailed output of the AST Demock analysis.
 */
export interface ASTAnalysisResultV2 {
  /** True if no errors were found. Warnings and suggestions do not invalidate. */
  isValid: boolean;
  /** List of strict validation errors (e.g. usage of eval, mock identifiers). */
  errors: string[];
  /** List of minor warnings (e.g. console.log, TODO strings). */
  warnings: string[];
  /** List of optional suggestions for code improvement. */
  suggestions: string[];
  /** A numerical summary of the found issues. */
  summary: {
    errorCount: number;
    warningCount: number;
    suggestionCount: number;
  };
}

/**
 * AST Parser
 * Dynamically parses and analyzes code blocks within agent messages
 * to enforce strict code quality, security, and structure for Demock features.
 *
 * @param code - A raw TypeScript string block.
 * @returns An ASTAnalysisResultV2 with full details.
 */
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

  // Traverse AST to find basic issues
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const expressionText = node.expression.getText(sourceFile);
      if (expressionText === "eval") {
        errors.push("Security Error: Usage of eval() is strictly forbidden.");
      }
    }

    // Demock validation: Ensure no hardcoded dummy data patterns exist
    if (ts.isStringLiteral(node) || ts.isIdentifier(node)) {
      const text = node.getText(sourceFile);
      if (text.includes("dummy") || text.includes("mock_")) {
        errors.push(`Demock Error: Hardcoded pattern '${text}' detected.`);
      }
      if (text.includes("TODO")) {
        warnings.push(`Cleanliness Warning: TODO string literal '${text}' detected.`);
      }
    }

    if (ts.isPropertyAccessExpression(node)) {
      const expressionText = node.expression.getText(sourceFile);
      const nameText = node.name.getText(sourceFile);
      if (expressionText === "console" && nameText === "log") {
        warnings.push("Optimization Warning: Usage of console.log() detected. Consider removing in production code.");
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
      errorCount: errors.length,
      warningCount: warnings.length,
      suggestionCount: suggestions.length,
    }
  };
}

/**
 * Extracts TypeScript code blocks from a message string.
 * @param messageContent - The full string that might contain markdown typescript blocks.
 * @returns Array of extracted code strings.
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
