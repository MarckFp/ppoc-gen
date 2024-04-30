import { expect, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker/locale/en'

export async function createSchedule(page: Page) {
    await page.goto('/schedules')
}
