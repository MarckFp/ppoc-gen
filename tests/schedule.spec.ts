import { test } from '@playwright/test'
import { createCongregation } from './helpers/congregation'
import { createSchedule } from './helpers/schedule'

test('Create schedule', async ({ page }) => {
  await createCongregation(page)
  await createSchedule(page)
})

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = testInfo.outputPath(`failure.png`)
    testInfo.attachments.push({ name: 'screenshot', path: screenshotPath, contentType: 'image/png' })
    await page.screenshot({ path: screenshotPath, timeout: 5000 })
  }
})