import { test, expect } from '@playwright/test'

test.describe('Minion Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should display app title and empty state', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Minion Tracker')
    await expect(page.getByText('No active minions')).toBeVisible()
  })

  test('should spawn a minion', async ({ page }) => {
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder(/Atk/).fill('4')
    await page.getByPlaceholder(/Damage/).fill('1d6+2')

    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    await expect(page.getByText('Goblin')).toBeVisible()
    await expect(page.getByText('7/7')).toBeVisible()
    await expect(page.getByText('No active minions')).not.toBeVisible()
  })

  test('should adjust HP by custom amount', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Orc')
    await page.getByPlaceholder('HP').fill('15')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder(/Atk/).fill('5')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Click HP stat to enter adjustment mode
    await page.getByText('15/15').click()

    // Damage by 7
    await page.getByPlaceholder('Amount').fill('7')
    await page.getByRole('button', { name: 'Dmg' }).click()

    await expect(page.getByText('8/15')).toBeVisible()
  })

  test('should heal damaged minion', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('10')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder(/Atk/).fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Damage first
    await page.getByText('10/10').click()
    await page.getByPlaceholder('Amount').fill('6')
    await page.getByRole('button', { name: 'Dmg' }).click()

    // Heal
    await page.getByText('4/10').click()
    await page.getByPlaceholder('Amount').fill('3')
    await page.getByRole('button', { name: 'Heal' }).click()

    await expect(page.getByText('7/10')).toBeVisible()
  })

  test('should show low HP warning', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('10')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder(/Atk/).fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Damage to half HP
    await page.getByText('10/10').click()
    await page.getByPlaceholder('Amount').fill('5')
    await page.getByRole('button', { name: 'Dmg' }).click()
    await page.getByRole('button', { name: '✕' }).click()

    const hpStat = page.locator('.hp-low').filter({ hasText: '5/10' })
    await expect(hpStat).toBeVisible()
  })

  test('should cancel HP adjustment', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder(/Atk/).fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Enter adjustment mode
    await page.getByText('7/7').click()
    await expect(page.getByPlaceholder('Amount')).toBeVisible()

    // Cancel
    await page.getByRole('button', { name: '✕' }).click()
    await expect(page.getByPlaceholder('Amount')).not.toBeVisible()
  })

  test('should dismiss a minion', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder(/Atk/).fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Dismiss
    await page.getByRole('button', { name: 'Dismiss' }).click()

    await expect(page.getByText('Goblin')).not.toBeVisible()
    await expect(page.getByText('No active minions')).toBeVisible()
  })

  test('should persist minions in localStorage', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder(/Atk/).fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Damage minion
    await page.getByText('7/7').click()
    await page.getByPlaceholder('Amount').fill('3')
    await page.getByRole('button', { name: 'Dmg' }).click()

    // Reload page
    await page.reload()

    // Verify persistence
    await expect(page.getByText('Goblin')).toBeVisible()
    await expect(page.getByText('4/7')).toBeVisible()
  })

  test('should use collapsible notes field', async ({ page }) => {
    const detailsElement = page.locator('details')
    await expect(detailsElement).toBeVisible()

    const summary = page.locator('summary', { hasText: 'Notes' })
    await expect(summary).toBeVisible()

    // Expand notes
    await summary.click()
    const notesTextarea = page.getByPlaceholder(/Special abilities/)
    await expect(notesTextarea).toBeVisible()

    // Add notes
    await notesTextarea.fill('Sneaky and fast')

    // Spawn with notes
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder(/Atk/).fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    await expect(page.getByText('Sneaky and fast')).toBeVisible()
  })

  test('should handle multiple minions', async ({ page }) => {
    // Spawn first minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder(/Atk/).fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Spawn second minion
    await page.getByPlaceholder('Name').fill('Orc')
    await page.getByPlaceholder('HP').fill('15')
    await page.getByPlaceholder('AC').fill('12')
    await page.getByPlaceholder(/Atk/).fill('5')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Verify both visible
    await expect(page.getByText('Goblin')).toBeVisible()
    await expect(page.getByText('Orc')).toBeVisible()

    // Dismiss first
    const dismissButtons = page.getByRole('button', { name: 'Dismiss' })
    await dismissButtons.first().click()

    // Verify only second remains
    await expect(page.getByText('Goblin')).not.toBeVisible()
    await expect(page.getByText('Orc')).toBeVisible()
  })
})
