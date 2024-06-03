import { expect, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker/locale/en'

export async function createCongregation(page: Page, lang: string = 'en', weekday: string = 'monday', name_order: string = 'firstname') {
    await page.goto('/new')
    await page.getByTestId('create-name').waitFor()
    await page.getByTestId('create-name').fill('Congregation ' + faker.location.city())
    await page.getByTestId('create-lang').selectOption(lang)
    await page.getByTestId('create-weekday').selectOption(weekday)
    await page.getByTestId('create-name-order').selectOption(name_order)
    await page.getByTestId('create-btn').click()
}

export async function importCongregation(page: Page) {
    await page.goto('/new')
    await page.getByTestId('create-import').waitFor()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByTestId('create-import').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles('./tests/helpers/test.pgen')
    await page.getByRole('alert').waitFor()
    await expect(page.getByRole('alert')).toContainText('Congregation Imported successfully')
    await expect(page.getByText('Welcome Test')).toBeVisible()
}
