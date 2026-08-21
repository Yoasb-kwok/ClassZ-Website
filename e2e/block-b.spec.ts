import { test, expect, type Page } from '@playwright/test'

/**
 * Block B — Discovery (docs/UI_Implementation_Plan.md §4-B, §7)
 * Covers: landing hero CTA, programs listing + search + region filter,
 * program detail + class option cards + enroll entry, workshops variant,
 * 404 on unknown program, zh-TW copy swap.
 *
 * Assertions target SEEDED records (ClassZ API :3003) to prove the real
 * /api path — not demo fallback data.
 */

const SEEDED = {
  ballet: { id: 1, name: '兒童芭蕾', location: 'sanpokong', price: '480' },
  kpop: { id: 6, name: 'K-Pop 流行舞', location: 'causewaybay' },
  jazz: { id: 4, name: '爵士舞', location: 'fotan' },
  hiphop: { id: 2, name: '青少年街舞', location: 'causewaybay' },
}

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  return errors
}

async function switchToZhTw(page: Page) {
  await page.getByTestId('site-footer').getByRole('button', { name: /language|語言/i }).click()
  await page.getByRole('menuitem', { name: '繁體中文' }).click()
}

test.describe('Block B — programs listing', () => {
  test('renders intro, search box and all seeded programs', async ({ page }) => {
    await page.goto('/programs')
    await expect(page.getByRole('heading', { name: 'Find the right program for your child' })).toBeVisible()
    await expect(page.getByPlaceholder('Search')).toBeVisible()
    for (const name of [SEEDED.ballet.name, SEEDED.hiphop.name, SEEDED.jazz.name, SEEDED.kpop.name]) {
      await expect(page.getByRole('link', { name: new RegExp(name) })).toBeVisible()
    }
  })

  test('cards link to program detail', async ({ page }) => {
    await page.goto('/programs')
    await expect(
      page.getByRole('link', { name: new RegExp(SEEDED.ballet.name) })
    ).toHaveAttribute('href', `/programs/${SEEDED.ballet.id}`)
  })

  test('search narrows listing by name', async ({ page }) => {
    await page.goto('/programs')
    await page.getByPlaceholder('Search').fill('芭蕾')
    await expect(page.getByRole('link', { name: new RegExp(SEEDED.ballet.name) })).toBeVisible()
    await expect(page.getByRole('link', { name: new RegExp(SEEDED.kpop.name) })).toHaveCount(0)
  })

  test('region filter (Kowloon) narrows listing to San Po Kong program', async ({ page }) => {
    await page.goto('/programs')
    // Expand the Kowloon region, select its district pill
    await page.getByRole('button', { name: 'Kowloon' }).click()
    await page.getByRole('button', { name: 'San Po Kong' }).click()
    await expect(page.getByRole('link', { name: new RegExp(SEEDED.ballet.name) })).toBeVisible()
    await expect(page.getByRole('link', { name: new RegExp(SEEDED.kpop.name) })).toHaveCount(0)
    await expect(page.getByRole('link', { name: new RegExp(SEEDED.jazz.name) })).toHaveCount(0)
  })

  test('region filter (New Territories) narrows listing', async ({ page }) => {
    await page.goto('/programs')
    await page.getByRole('button', { name: 'New Territories' }).click()
    await page.getByRole('button', { name: 'Fo Tan' }).click()
    await expect(page.getByRole('link', { name: new RegExp(SEEDED.jazz.name) })).toBeVisible()
    await expect(page.getByRole('link', { name: new RegExp(SEEDED.ballet.name) })).toHaveCount(0)
  })

  test('zh-TW toggle swaps listing copy', async ({ page }) => {
    await page.goto('/programs')
    await switchToZhTw(page)
    await expect(
      page.getByRole('heading', { name: '為孩子尋找合適的課程' })
    ).toBeVisible()
  })

  test('no console errors', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/programs', { waitUntil: 'load' })
    await expect(page.getByRole('link', { name: new RegExp(SEEDED.ballet.name) })).toBeVisible()
    expect(errors).toEqual([])
  })
})

test.describe('Block B — program detail', () => {
  test('renders seeded program info and class option card', async ({ page }) => {
    await page.goto(`/programs/${SEEDED.ballet.id}`)
    await expect(page.getByRole('heading', { name: SEEDED.ballet.name })).toBeVisible()
    // intro text from seed
    await expect(page.getByText('培養芭蕾基本功與音樂感')).toBeVisible()
    // option card derived from the seeded KB-A class rows
    await expect(page.getByText('8 lessons').first()).toBeVisible()
    await expect(page.getByText(/李老師/).first()).toBeVisible()
  })

  test('shows price and age from seed', async ({ page }) => {
    await page.goto(`/programs/${SEEDED.ballet.id}`)
    await expect(page.getByText('$480').first()).toBeVisible()
    await expect(page.getByText('Age 5-8')).toBeVisible()
  })

  test('enroll entry navigates to login (booking funnel entry)', async ({ page }) => {
    await page.goto(`/programs/${SEEDED.kpop.id}`)
    await page.getByRole('link', { name: 'Enroll' }).first().click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('unknown program id returns 404', async ({ page }) => {
    const response = await page.goto('/programs/99999')
    expect(response?.status()).toBe(404)
  })

  test('no console errors', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(`/programs/${SEEDED.ballet.id}`, { waitUntil: 'load' })
    await expect(page.getByRole('heading', { name: SEEDED.ballet.name })).toBeVisible()
    expect(errors).toEqual([])
  })
})

test.describe('Block B — workshops variant', () => {
  test('renders workshops listing with empty state (no workshop-type courses seeded)', async ({ page }) => {
    await page.goto('/workshops')
    await expect(
      page.getByRole('heading', { name: 'Find the right program for your child' })
    ).toBeVisible()
    // no seeded course has course_type != regular → empty state shows
    await expect(page.getByRole('link', { name: new RegExp(SEEDED.ballet.name) })).toHaveCount(0)
    await expect(page.getByText(/No workshops/i)).toBeVisible()
  })
})

test.describe('Block B — landing', () => {
  test('landing hero CTA navigates to programs listing', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'One Child. Every Perspective. One Platform.' })).toBeVisible()
    await page.getByRole('link', { name: 'See all programs' }).click()
    await expect(page).toHaveURL(/\/programs/)
  })
})
