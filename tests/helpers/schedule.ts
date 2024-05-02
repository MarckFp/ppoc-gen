import { expect, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker/locale/en'

export async function createSchedule(page: Page) {
    const weekday = faker.date.weekday().toLowerCase()
    const startTime = '10:00'
    const endTime = '14:00'
    const location = faker.location.street()
    const n_brothers = faker.number.int({min: 1, max: 4}).toString()
    const n_sisters = faker.number.int({min: 1, max: 4}).toString()

    await page.goto('/schedules')
    await page.getByTestId('schedules-create-btn').waitFor()
    await page.getByTestId('schedules-create-btn').click()
    await page.getByTestId('schedules-create-weekday').waitFor()
    await page.getByTestId('schedules-create-weekday').selectOption(weekday)
    await page.getByTestId('schedules-create-startTime').fill(startTime)
    await page.getByTestId('schedules-create-endTime').fill(endTime)
    await page.getByTestId('schedules-create-location').fill(location)
    await page.getByTestId('schedules-create-nBrothers').fill(n_brothers)
    await page.getByTestId('schedules-create-nSisters').fill(n_sisters)
    await page.getByTestId('schedules-create-submit').click()
    await page.getByRole('alert').waitFor()
    await expect(page.getByRole('alert')).toContainText('Schedule created successfully')
}
