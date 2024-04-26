import { test, expect } from '@playwright/test'

test('Congregation creation', async ({ page, isMobile }) => {
  await page.goto('/')
  await page.getByTestId('create-name').fill('Congregation Example')
  await page.getByTestId('create-lang').selectOption('en')
  await page.getByTestId('create-weekday').selectOption('monday')
  await page.getByTestId('create-btn').click()
  await page.waitForTimeout(1000)
  await expect(page.getByTestId('toast')).toContainText('Congregation Added successfully')
})

test('Navbar menu', async ({ page, isMobile }) => {
  await page.goto('/')
  await page.getByTestId('create-name').fill('Congregation Example')
  await page.getByTestId('create-lang').selectOption('en')
  await page.getByTestId('create-weekday').selectOption('monday')
  await page.getByTestId('create-btn').click()
  await page.waitForTimeout(1000)
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