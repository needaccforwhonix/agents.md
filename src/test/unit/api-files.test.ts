import { describe, it, expect, vi } from "vitest";
import handler, { getFileStructure, FileNode } from "../../pages/api/files";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

describe("api/files", () => {
  it("should return empty array for non-existent directory", () => {
    const result = getFileStructure("/non/existent/path/that/does/not/exist");
    expect(result).toEqual([]);
  });

  it("should respect maxDepth parameter", () => {
    const tempDir = fs.mkdtempSync("test-depth-");
    const subDir1 = path.join(tempDir, "sub1");
    const subDir2 = path.join(subDir1, "sub2");

    try {
      fs.mkdirSync(subDir1);
      fs.mkdirSync(subDir2);
      fs.writeFileSync(path.join(subDir2, "test.txt"), "hello");

      const res0 = getFileStructure(tempDir, tempDir, 0);
      expect(res0).toEqual([{ path: "sub1", name: "sub1", isDirectory: true }]);

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

  it("should return empty array if fs.readdirSync throws an error", () => {
    const readdirSpy = vi.spyOn(fs, "readdirSync").mockImplementation(() => {
      throw new Error("Simulated readdirSync error");
    });

    const result = getFileStructure("/some/path");
    expect(result).toEqual([]);

    readdirSpy.mockRestore();
  });

  it("should ignore files if fs.statSync throws an error", () => {
    const tempDir = fs.mkdtempSync("test-stat-");
    const file1 = path.join(tempDir, "file1.txt");
    const file2 = path.join(tempDir, "file2.txt");

    try {
      fs.writeFileSync(file1, "hello");
      fs.writeFileSync(file2, "world");

      const statSpy = vi.spyOn(fs, "statSync").mockImplementation((p) => {
        if (p === file1) {
          throw new Error("Simulated statSync error");
        }
        return { isDirectory: () => false } as unknown as fs.Stats;
      });

      const res = getFileStructure(tempDir, tempDir);
      expect(res.length).toBe(1);
      expect(res[0].name).toBe("file2.txt");

      statSpy.mockRestore();
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should handle the NextApiRequest correctly", () => {
    const req = {} as unknown as NextApiRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as NextApiResponse<FileNode[]>;

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
