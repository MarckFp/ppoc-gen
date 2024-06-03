import { expect, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker/locale/en'

export async function createIncidence(page: Page, publisher_id: number) {
    const startDate = faker.date.future()
    const endDate = faker.date.future({refDate: startDate})

    await page.goto('/app/incidences')
    await page.getByTestId('incidences-create-btn').waitFor()
    await page.getByTestId('incidences-create-btn').click()
    await page.getByTestId('incidences-create-publisher').waitFor()
    await page.getByTestId('incidences-create-publisher').selectOption(publisher_id.toString())
    await page.getByTestId('incidences-create-startDate').fill(startDate.toISOString().split('T')[0])
    await page.getByTestId('incidences-create-endDate').fill(endDate.toISOString().split('T')[0])
    await page.getByTestId('incidences-create-submit').click()
    await page.getByRole('alert').waitFor()
    await expect(page.getByRole('alert')).toContainText('Incidence created successfully')
}
