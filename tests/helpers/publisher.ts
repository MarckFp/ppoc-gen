import { expect, type Locator, type Page } from '@playwright/test'
import { faker } from '@faker-js/faker/locale/en'

export async function createPublisher(page: Page, name_order: string = 'firstname', availability: boolean = false) {
    const gender = ['male', 'female'][Math.round(Math.random())]
    const firstname = faker.person.firstName(gender)
    const lastname = faker.person.lastName(gender)
    const priority = ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
    let publisher_id,
        child: Locator

    await page.goto('/app/publishers')
    await page.getByTestId('publishers-create-btn').waitFor()
    await page.getByTestId('publishers-create-btn').click()
    await page.getByTestId('publishers-firstname').waitFor()
    await page.getByTestId('publishers-firstname').fill(firstname)
    await page.getByTestId('publishers-lastname').fill(lastname)
    await page.getByTestId('publishers-gender').selectOption(gender)
    await page.getByTestId('publishers-weight-' + priority).check()
    if (availability) {
        const availabilities = await page.getByTestId('publishers-availability').getByRole('checkbox')
        const availabilitiesCount = await availabilities.count()
        let selected: number[] = []
        for (let i = 0; i < 5; i++) {
            let random = Math.floor(Math.random() * (availabilitiesCount - 1 + 0) + 0)
            if (selected.includes(random)) {
                i--
                continue
            }
            await availabilities.nth(random).check()
            selected.push(random)
        }
    }
    await page.getByTestId('publishers-create-submit').click()

    //Checks
    await page.getByRole('alert').waitFor()
    if (name_order == 'firstname') {
        await expect(page.locator("table > tbody")).toContainText(firstname + ' ' + lastname)
        child = await page.locator("table > tbody").getByText(firstname + ' ' + lastname)
    } else if (name_order == 'lastname') {
        await expect(page.locator("table > tbody")).toContainText(lastname + ' ' + firstname)
        child = await page.locator("table > tbody > tr > td").getByText(lastname + ' ' + firstname)
    }
    await expect(page.getByRole('alert')).toContainText('Publisher created successfully')

    //Retrieve User ID
    const editBtn = await child.locator('xpath=..').getByTestId('publishers-edit-btn')
    publisher_id = await editBtn.getAttribute('id')
    return publisher_id?.split('-')[1]
}
