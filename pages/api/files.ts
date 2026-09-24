import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export type FileNode = {
  path: string;
  name: string;
  isDirectory: boolean;
};

function getFileStructure(dir: string, baseDir: string = dir, maxDepth = 4, currentDepth = 0): FileNode[] {
  if (currentDepth > maxDepth) return [];

  const ignored = new Set(["node_modules", ".git", ".next", "test-results", "public", ".github", "pnpm-lock.yaml"]);
  let results: FileNode[] = [];
  let files: string[] = [];

  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    return [];
  }

  for (const file of files) {
    if (ignored.has(file)) continue;

    const fullPath = path.join(dir, file);
    const relativePath = path.relative(baseDir, fullPath);

    let stats;
    try {
      stats = fs.statSync(fullPath);
    } catch (err) {
      continue;
    }

    if (stats.isDirectory()) {
      results.push({ path: relativePath, name: file, isDirectory: true });
      results = results.concat(getFileStructure(fullPath, baseDir, maxDepth, currentDepth + 1));
    } else {
      results.push({ path: relativePath, name: file, isDirectory: false });
    }
  }

  return results;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<FileNode[]>) {
  const rootDir = process.cwd();
  const structure = getFileStructure(rootDir);
  res.status(200).json(structure);
}
