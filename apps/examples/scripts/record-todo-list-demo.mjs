#!/usr/bin/env node
/**
 * Runs the todo-list sidebar walkthrough with RECORD_TODO_DEMO=1, then copies the
 * newest video.webm from e2e/test-results to repo-root out/todo-list-feature-demo.webm.
 *
 * Playwright always writes under e2e/test-results/<hashed-folder>/video.webm; the file
 * in out/ is not updated unless you copy it (this script does that).
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const examplesRoot = path.join(__dirname, '..')
const testResultsDir = path.join(examplesRoot, 'e2e', 'test-results')
const repoRoot = path.join(examplesRoot, '..', '..')
const outFile = path.join(repoRoot, 'out', 'todo-list-feature-demo.webm')

execFileSync(
	'yarn',
	[
		'exec',
		'playwright',
		'test',
		'-c',
		'./e2e/playwright.config.ts',
		'./e2e/tests/test-todo-list-sidebar.spec.ts',
		'--project=chromium',
	],
	{
		cwd: examplesRoot,
		stdio: 'inherit',
		env: { ...process.env, RECORD_TODO_DEMO: '1' },
	}
)

/** @returns {string | null} */
function findNewestVideoWebm(dir) {
	/** @type {{ path: string; mtime: number } | null} */
	let best = null
	function walk(absoluteDir) {
		let entries
		try {
			entries = readdirSync(absoluteDir, { withFileTypes: true })
		} catch {
			return
		}
		for (const ent of entries) {
			const p = path.join(absoluteDir, ent.name)
			if (ent.isDirectory()) walk(p)
			else if (ent.name === 'video.webm') {
				const mtime = statSync(p).mtimeMs
				if (!best || mtime > best.mtime) best = { path: p, mtime }
			}
		}
	}
	walk(dir)
	return best?.path ?? null
}

const newest = findNewestVideoWebm(testResultsDir)
if (!newest) {
	console.error(`No video.webm found under ${testResultsDir}. Is RECORD_TODO_DEMO=1 and video enabled in the test file?`)
	process.exit(1)
}

mkdirSync(path.dirname(outFile), { recursive: true })
copyFileSync(newest, outFile)
console.log(`\nCopied demo recording to:\n  ${outFile}\n`)
