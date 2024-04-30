import { expect, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker/locale/en'

export async function createPublisher(page: Page, name_order: string = 'firstname') {
    const gender = ['male', 'female'][Math.round(Math.random())]
    const firstname = faker.person.firstName(gender)
    const lastname = faker.person.lastName(gender)
    const priority = ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]


    await page.goto('/publishers')
    await page.getByTestId('publishers-create-btn').waitFor()
    await page.getByTestId('publishers-create-btn').click()
    await page.getByTestId('publishers-firstname').waitFor()
    await page.getByTestId('publishers-firstname').fill(firstname)
    await page.getByTestId('publishers-lastname').fill(lastname)
    await page.getByTestId('publishers-gender').selectOption(gender)
    await page.getByTestId('publishers-weight-' + priority).check()
    await page.getByTestId('publishers-create-submit').click()
    await page.getByRole('alert').waitFor()
    if (name_order == 'firstname') {
        await expect(page.locator("table > tbody")).toContainText(firstname + ' ' + lastname)
    }
    if (name_order == 'lastname') {
        await expect(page.locator("table > tbody")).toContainText(lastname + ' ' + firstname)
    }
    await expect(page.getByRole('alert')).toContainText('Publisher created successfully')
    await page.getByRole('alert').locator("button").click()
    await page.getByRole('alert').waitFor({state: 'hidden'})
}
