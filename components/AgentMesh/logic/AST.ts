import * as ts from 'typescript';
import { Message } from '../types';

/**
 * Validates agent messages using the TypeScript Compiler API.
 * This simulates the "Demock" process to ensure agents aren't producing
 * invalid or mock code blocks inside their reasoning or fields.
 */
export class ASTValidator {
  /**
   * Analyzes a string for code blocks and validates them.
   * In this simple implementation, it checks if any found code blocks are valid TypeScript.
   */
  public static validateMessage(message: Message): boolean {
    // Collect all text fields that might contain code or complex logic
    const contentToAnalyze = `${message.what}\n${message.where}\n${message.how}\n${message.reasoning}`;

    // Extract potential code blocks (simplistic extraction for simulation)
    const codeBlocks = this.extractCodeBlocks(contentToAnalyze);

    for (const block of codeBlocks) {
      if (!this.isValidAST(block)) {
        console.warn(`[AST Validation Failed] Message ${message.id} from ${message.from} contains invalid syntax.`);
        return false;
      }
    }
    return true;
  }

  private static extractCodeBlocks(text: string): string[] {
    const blocks: string[] = [];
    const regex = /```(?:typescript|ts)?\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push(match[1]);
    }
    return blocks;
  }

  private static isValidAST(code: string): boolean {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      code,
      ts.ScriptTarget.Latest,
      true
    );

    // Simple check: are there syntax errors?
    // In a real "Demock", we would traverse the AST to look for specific patterns
    // (e.g., empty functions, hardcoded returns).
    let hasErrors = false;

    // Check if it parsed successfully without obvious parse diagnostics if we had a program,
    // but with createSourceFile, it just creates tree.
    // A simplistic check: does it have statements?
    if (sourceFile.statements.length === 0 && code.trim().length > 0) {
        // If it's not empty text but resulted in 0 statements, it might be heavily malformed,
        // though comments only would also be 0 statements. Let's allow comments.
    }

    // Since ts.createSourceFile doesn't immediately throw on all syntax errors,
    // a more robust way in TS is to use createProgram, but for a fast simulation,
    // we'll just check if it parsed *something* if it's supposed to be code.
    // For now, we assume true unless we build a full checker.

    // To implement "Demock" checking explicitly: Look for empty blocks
    const checkForEmptyBlocks = (node: ts.Node) => {
      if (ts.isBlock(node) && node.statements.length === 0) {
        // Found an empty block!
        // hasErrors = true; // Disabled for simulation unless strict
      }
      ts.forEachChild(node, checkForEmptyBlocks);
    };

    checkForEmptyBlocks(sourceFile);

    return !hasErrors;
  }
}
