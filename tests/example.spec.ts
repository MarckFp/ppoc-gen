import { test, expect, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker/locale/en'

async function congregationCreation(page: Page) {
  await page.goto('/')
  await page.getByTestId('create-name').fill('Congregation Example')
  await page.getByTestId('create-lang').selectOption('en')
  await page.getByTestId('create-weekday').selectOption('monday')
  await page.getByTestId('create-name-order').selectOption('firstname')
  await page.getByTestId('create-btn').click()
  await page.waitForTimeout(1000)
  await expect(page.getByTestId('toast')).toContainText('Congregation Added successfully')
}

test('Congregation creation', async ({ page }) => {
  await congregationCreation(page)
})

test('Navbar menu', async ({ page, isMobile }) => {
  await congregationCreation(page)
  if (isMobile) {
    await page.getByTestId('navbar-hamburger').click()
    await page.waitForTimeout(1000)
  }
  await page.getByTestId('navbar-publishers').click()
  await page.waitForTimeout(1000)
  await expect(page.getByTestId('publishers-create-btn')).toContainText('Create new Publisher')
  await page.getByTestId('navbar-schedules').click()
  await page.waitForTimeout(1000)
  await expect(page.getByTestId('schedules-create-btn')).toContainText('Create new Schedule')
  await page.getByTestId('navbar-turns').click()
  await page.waitForTimeout(1000)
  await expect(page.getByTestId('turns-generate-btn')).toContainText('Generate Turns')
  await page.getByTestId('navbar-incidences').click()
  await page.waitForTimeout(1000)
  await expect(page.getByTestId('incidences-create-btn')).toContainText('Create new Incidence')
  await page.getByTestId('navbar-settings').click()
  await page.waitForTimeout(1000)
  await expect(page.getByTestId('settings-update-btn')).toContainText('Update Congregation')
})

test('Create publisher', async ({ page, isMobile }) => {
  const gender = ['male', 'female'][Math.round(Math.random())]
  const firstname = faker.person.firstName(gender)
  const lastname = faker.person.lastName(gender)
  const priority = ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]

  await congregationCreation(page)
  if (isMobile) {
    await page.getByTestId('navbar-hamburger').click()
    await page.waitForTimeout(1000)
  }
  await page.getByTestId('navbar-publishers').click()
  await page.waitForTimeout(1000)
  await expect(page.getByTestId('publishers-create-btn')).toContainText('Create new Publisher')
  await page.getByTestId('publishers-create-btn').click()
  await page.waitForTimeout(1000)
  await page.getByTestId('publishers-firstname').fill(firstname)
  await page.getByTestId('publishers-lastname').fill(lastname)
  await page.getByTestId('publishers-gender').selectOption(gender)
  await page.getByTestId('publishers-weight-' + priority).check()
  await page.getByTestId('publishers-create-submit').click()
  await page.waitForTimeout(1000)
  await expect(page.locator("table > tbody > tr").nth(0).locator("td").nth(0)).toContainText(firstname + ' ' + lastname)
})

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = testInfo.outputPath(`failure.png`)
    testInfo.attachments.push({ name: 'screenshot', path: screenshotPath, contentType: 'image/png' })
    await page.screenshot({ path: screenshotPath, timeout: 5000 })
  }
})