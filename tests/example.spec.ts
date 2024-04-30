import { test, expect, type Page } from '@playwright/test'
import { createCongregation } from './helpers/congregation'
import { createPublisher } from './helpers/publisher'
import { createSchedule } from './helpers/schedule'

test('Congregation creation', async ({ page }) => {
  await createCongregation(page)
})

test('Navbar menu', async ({ page, isMobile }) => {
  await createCongregation(page)
  if (isMobile) {
    await page.getByTestId('navbar-hamburger').click()
    await page.getByTestId('navbar-publishers').waitFor()
  }
  await page.getByTestId('navbar-publishers').click()
  await page.getByTestId('publishers-create-btn').waitFor()
  await expect(page.getByTestId('publishers-create-btn')).toContainText('Create new Publisher')

  await page.getByTestId('navbar-schedules').click()
  await page.getByTestId('schedules-create-btn').waitFor()
  await expect(page.getByTestId('schedules-create-btn')).toContainText('Create new Schedule')

  await page.getByTestId('navbar-turns').click()
  await page.getByTestId('turns-generate-btn').waitFor()
  await expect(page.getByTestId('turns-generate-btn')).toContainText('Generate Turns')

  await page.getByTestId('navbar-incidences').click()
  await page.getByTestId('incidences-create-btn').waitFor()
  await expect(page.getByTestId('incidences-create-btn')).toContainText('Create new Incidence')

  await page.getByTestId('navbar-settings').click()
  await page.getByTestId('settings-update-btn').waitFor()
  await expect(page.getByTestId('settings-update-btn')).toContainText('Update Congregation')
})

test('Create schedule', async ({ page }) => {
  await createCongregation(page)
  await createSchedule(page)
})

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