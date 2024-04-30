import { test } from '@playwright/test'
import { createCongregation } from './helpers/congregation'
import { createPublisher } from './helpers/publisher'
import { createIncidence } from './helpers/incidence'

test('Create incidence', async ({ page }) => {
  await createCongregation(page)
  const publisher_id = await createPublisher(page)
  await createIncidence(page, publisher_id)
})

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = testInfo.outputPath(`failure.png`)
    testInfo.attachments.push({ name: 'screenshot', path: screenshotPath, contentType: 'image/png' })
    await page.screenshot({ path: screenshotPath, timeout: 5000 })
  }
})