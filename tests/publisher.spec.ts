import { test } from '@playwright/test'
import { createCongregation } from './helpers/congregation'
import { createPublisher } from './helpers/publisher'

test('Create publisher', async ({ page }) => {
  await createCongregation(page)
  await createPublisher(page)
})

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = testInfo.outputPath(`failure.png`)
    testInfo.attachments.push({ name: 'screenshot', path: screenshotPath, contentType: 'image/png' })
    await page.screenshot({ path: screenshotPath, timeout: 5000 })
  }
})