import { describe, it, expect, vi } from "vitest";
import { getFileStructure } from "../../pages/api/files";
import path from "path";
import fs from "fs";

describe("api/files", () => {
  it("should return empty array for non-existent directory", () => {
    const result = getFileStructure("/non/existent/path/that/does/not/exist");
    expect(result).toEqual([]);
  });

  it("should respect maxDepth parameter", () => {
    // Create a temporary deep structure
    const tempDir = fs.mkdtempSync("test-depth-");
    const subDir1 = path.join(tempDir, "sub1");
    const subDir2 = path.join(subDir1, "sub2");

    try {
      fs.mkdirSync(subDir1);
      fs.mkdirSync(subDir2);
      fs.writeFileSync(path.join(subDir2, "test.txt"), "hello");

      // maxDepth = 0: Should not see sub1
      const res0 = getFileStructure(tempDir, tempDir, 0);
      expect(res0.length).toBe(1); // just sub1 directory node itself, but let's see. Wait, at depth 0, it reads dir.
      // Actually, depth logic in getFileStructure:
      // if currentDepth > maxDepth return [].
      // When currentDepth=0, it lists files in tempDir -> ["sub1"]. It pushes {sub1, isDirectory:true}, then calls getFileStructure(..., currentDepth + 1).
      // When currentDepth=1 (which is > maxDepth of 0), it returns [].
      // So res0 should just contain { path: 'sub1', name: 'sub1', isDirectory: true }.
      expect(res0).toEqual([{ path: "sub1", name: "sub1", isDirectory: true }]);

      // maxDepth = 1: Should see sub1, and inside sub1 it sees sub2 (so sub2 directory node is added)
      const res1 = getFileStructure(tempDir, tempDir, 1);
      expect(res1).toEqual([
        { path: "sub1", name: "sub1", isDirectory: true },
        { path: path.join("sub1", "sub2"), name: "sub2", isDirectory: true }
      ]);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should ignore specified directories like node_modules", () => {
    const tempDir = fs.mkdtempSync("test-ignored-");
    const nodeModules = path.join(tempDir, "node_modules");
    const normalDir = path.join(tempDir, "normal");

    try {
      fs.mkdirSync(nodeModules);
      fs.mkdirSync(normalDir);

      const res = getFileStructure(tempDir, tempDir);
      expect(res).toEqual([{ path: "normal", name: "normal", isDirectory: true }]);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
