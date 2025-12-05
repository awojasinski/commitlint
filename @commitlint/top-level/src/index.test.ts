import { test, expect } from "vitest";
import path from "node:path";
import fs from "fs/promises";
import { x } from "tinyexec";
import { git } from "@commitlint/test";

import toplevel from "./index.js";

test("should find git root in a normal repository", async () => {
	const cwd: string = await git.bootstrap();
	const result = await toplevel(cwd);
	expect(result).toBe(cwd);
});

test("should find git root from a subdirectory", async () => {
	const cwd: string = await git.bootstrap();
	const subdir = path.join(cwd, "subdir");
	await fs.mkdir(subdir);
	const result = await toplevel(subdir);
	expect(result).toBe(cwd);
});

test("should return undefined for non-git directory", async () => {
	const cwd: string = await git.bootstrap();
	const nonGitDir = path.join(cwd, "..", "non-git-dir");
	await fs.mkdir(nonGitDir, { recursive: true });
	const result = await toplevel(nonGitDir);
	expect(result).toBeUndefined();
});

test("should work correctly with git worktree", async () => {
	const cwd: string = await git.bootstrap();

	// Create initial commit
	await fs.writeFile(path.join(cwd, "test.txt"), "test content");
	await x("git", ["add", "."], { nodeOptions: { cwd } });
	await x("git", ["commit", "-m", "initial commit"], { nodeOptions: { cwd } });

	// Create a worktree
	const worktreePath = path.join(cwd, "..", "worktree");
	await x("git", ["worktree", "add", worktreePath, "-b", "test-branch"], {
		nodeOptions: { cwd },
	});

	// Test that toplevel works in the worktree
	const result = await toplevel(worktreePath);
	expect(result).toBe(worktreePath);

	// Clean up worktree
	await x("git", ["worktree", "remove", worktreePath], {
		nodeOptions: { cwd },
	});
});
