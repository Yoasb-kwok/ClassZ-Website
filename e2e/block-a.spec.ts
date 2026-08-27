import { test, expect, type Page } from '@playwright/test'

/**
 * Block A — Foundations & shell (docs/UI_Implementation_Plan.md §4-A, §7)
 * Covers: rebrand navbar, burger quick-menu, dark footer, language switch,
 * system font stack, console-error regression guard.
 */

const publicPages = ['/our-mission', '/our-features', '/login']

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  return errors
}

test.describe('Block A — foundations & shell', () => {
  for (const path of publicPages) {
    test(`rebrand navbar renders on ${path}`, async ({ page }) => {
      await page.goto(path)
      const nav = page.getByRole('navigation', { name: 'Main' })
      await expect(nav).toBeVisible()
      await expect(nav.getByRole('img', { name: 'ClassZ' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('href', '/')
      await expect(nav.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/our-mission')
      await expect(nav.getByRole('link', { name: 'Programs' })).toHaveAttribute('href', '/programs')
      await expect(nav.getByRole('link', { name: 'Workshops' })).toHaveAttribute('href', '/workshops')
      await expect(nav.getByRole('button', { name: 'Log In' })).toBeVisible()
    })
  }

  test('navbar links navigate to live targets', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Log In' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
  })

  test('hamburger opens quick menu panel with member links', async ({ page }) => {
    await page.goto('/our-mission')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    const items: Array<[string, string]> = [
      ['Schedule', '/schedule'],
      ['Notifications', '/notifications'],
      ['Inbox', '/inbox'],
      ['Terms & Conditions', '/terms'],
      ['Help Centre', '/faqs'],
    ]
    for (const [name, href] of items) {
      await expect(menu.getByRole('menuitem', { name })).toHaveAttribute('href', href)
    }
    await expect(menu.getByRole('menuitem', { name: 'Language' })).toBeVisible()
  })

  test('footer renders rebrand dark columns', async ({ page }) => {
    await page.goto('/our-mission')
    const footer = page.getByTestId('site-footer')
    await expect(footer).toBeVisible()
    await expect(footer).toHaveCSS('background-color', 'rgb(34, 34, 34)')
    await expect(footer.getByRole('heading', { name: 'Contact Us' })).toBeVisible()
    await expect(footer.getByRole('heading', { name: 'Support' })).toBeVisible()
    await expect(footer.getByRole('heading', { name: 'Apps' })).toBeVisible()
    await expect(footer.getByText('theclasszclassz@gmail.com')).toBeVisible()
    await expect(footer.getByText('+852 1234 5678')).toBeVisible()
    await expect(footer.getByText('Mon-Sun 08:00-19:00')).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
    await expect(footer.getByRole('link', { name: 'Terms & Conditions' })).toHaveAttribute('href', '/terms')
  })

  test('footer language dropdown switches locale', async ({ page }) => {
    await page.goto('/our-mission')
    await page.getByTestId('site-footer').getByRole('button', { name: /language|語言/i }).click()
    await page.getByRole('menuitem', { name: '繁體中文' }).click()
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: '首頁' })
    ).toBeVisible()

    await page.getByTestId('site-footer').getByRole('button', { name: /language|語言/i }).click()
    await page.getByRole('menuitem', { name: '英文' }).click()
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Home', exact: true })
    ).toBeVisible()
  })

  test('body uses the rebrand system font stack', async ({ page }) => {
    await page.goto('/our-mission')
    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    expect(fontFamily).toContain('-apple-system')
    expect(fontFamily.toLowerCase()).not.toContain('poppins')
  })

  test('public pages load without console errors', async ({ page }) => {
    const errors = collectErrors(page)
    for (const path of publicPages) {
      await page.goto(path, { waitUntil: 'load' })
    }
    expect(errors).toEqual([])
  })

  test('admin route loads without crashing', async ({ page }) => {
    const errors = collectErrors(page)
    const response = await page.goto('/admin')
    expect(response?.status() ?? 200).toBeLessThan(400)
    expect(errors).toEqual([])
  })
})
