import { expect, type Locator } from '@playwright/test'
import test from '../fixtures/fixtures'
import { setupOrReset, sleep } from '../shared-e2e'

/**
 * Playwright videos do not record the cursor. When RECORD_TODO_DEMO=1, draw the
 * locator highlight (visible in the viewport) and hover so tooltips can appear.
 *
 * Recordings go to e2e/test-results/<hash>/video.webm. To copy the newest clip to
 * repo-root out/todo-list-feature-demo.webm, run from the monorepo root:
 *   yarn workspace examples.tldraw.com run e2e-record-todo-demo
 */
async function showTargetForRecording(locator: Locator) {
	if (process.env.RECORD_TODO_DEMO !== '1') return
	await locator.scrollIntoViewIfNeeded()
	await locator.highlight()
	await sleep(900)
	await locator.hover()
	await sleep(1000)
}

test.use({
	video: process.env.RECORD_TODO_DEMO === '1' ? 'on' : 'retain-on-failure',
	viewport: { width: 1280, height: 720 },
	launchOptions: process.env.RECORD_TODO_DEMO === '1' ? { slowMo: 120 } : {},
})

test.describe('Todo list sidebar', () => {
	test.beforeEach(({}, testInfo) => {
		test.skip(
			testInfo.project.name !== 'chromium',
			'Todo list UI is only asserted on desktop Chromium.'
		)
	})

	test.beforeEach(setupOrReset)

	test('walkthrough: open, add items, mark done, delete, close and reopen', async ({ page }) => {
		const openBtn = page.getByTestId('todo-list.button')
		const input = page.getByTestId('todo-list.input')
		const backdrop = page.locator('.tlui-todo-sidebar__backdrop')

		await sleep(800)
		await showTargetForRecording(openBtn)
		await openBtn.click()
		await sleep(600)
		await expect(input).toBeVisible()

		await input.fill('Revenue chart sketch')
		await sleep(400)
		await page.getByTestId('todo-list.add').click()
		await sleep(500)
		await expect(page.getByText('Revenue chart sketch')).toBeVisible()

		await input.fill('User flow for onboarding')
		await sleep(300)
		await input.press('Enter')
		await sleep(500)
		await expect(page.getByText('User flow for onboarding')).toBeVisible()

		const toggles = page.getByTestId('todo-list.toggle-item')
		await toggles.first().click()
		await sleep(600)

		await page.getByTestId('todo-list.remove-item').last().click()
		await sleep(500)
		await expect(page.getByText('User flow for onboarding')).not.toBeVisible()

		await page.getByTestId('todo-list.close').click()
		await sleep(500)
		await expect(input).not.toBeVisible()

		await sleep(500)
		await showTargetForRecording(openBtn)
		await openBtn.click()
		await sleep(600)
		await expect(input).toBeVisible()
		await expect(page.getByText('Revenue chart sketch')).toBeVisible()

		await backdrop.click({ position: { x: 80, y: 400 } })
		await sleep(600)
		await expect(input).not.toBeVisible()

		await sleep(500)
	})
})
