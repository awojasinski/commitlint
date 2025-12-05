import { spawnSync } from "node:child_process";

export default toplevel;

/**
 * Find the next git root
 */
async function toplevel(cwd?: string): Promise<string | undefined> {
	const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
		cwd: cwd || process.cwd(),
		encoding: "utf-8",
	});

	if (result.status !== 0) {
		return undefined;
	}

	return result.stdout.trim();
}
