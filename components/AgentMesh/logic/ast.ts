export interface CodeAnalysis {
  functions: string[];
  variables: string[];
  imports: string[];
  complexity: number;
}

export async function analyzeCode(code: string): Promise<CodeAnalysis | null> {
  try {
      const ts = (await import('typescript')).default || await import('typescript');

      const sourceFile = ts.createSourceFile(
        'temp.ts',
        code,
        ts.ScriptTarget.Latest,
        true
      );

      const analysis: CodeAnalysis = {
        functions: [],
        variables: [],
        imports: [],
        complexity: 0
      };

      function visit(node: any) {
        if (ts.isFunctionDeclaration(node)) {
            if (node.name) {
                analysis.functions.push(node.name.text);
            }
            analysis.complexity++;
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
          analysis.variables.push(node.name.text);
        } else if (ts.isImportDeclaration(node)) {
          analysis.imports.push(node.moduleSpecifier.getText(sourceFile));
        }

        ts.forEachChild(node, visit);
      }

      visit(sourceFile);
      return analysis;
  } catch (error) {
      console.error("AST Analysis failed:", error);
      return null;
  }
}
