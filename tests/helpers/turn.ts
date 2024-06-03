import { expect, type Page } from '@playwright/test'

export async function generateTurns(page: Page, startDate: Date, endDate: Date) {
    await page.goto('/app/turns')
    await page.getByTestId('turns-generate-btn').waitFor()
    await page.getByTestId('turns-date-from').fill(startDate.toISOString().split('T')[0])
    await page.getByTestId('turns-date-to').fill(endDate.toISOString().split('T')[0])
    await page.getByTestId('turns-generate-btn').click()
    await page.getByRole('alert').waitFor()
    await expect(page.getByRole('alert')).toContainText('Turns created successfully')
}
