import { expect, test, type Page } from '@playwright/test'

const LAST = '#/12/2'

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  return errors
}

async function open(page: Page, hash = '#/1/0') {
  await page.goto(`./${hash}`)
  await page.locator('.slide').first().waitFor()
}

const hash = (page: Page) => page.evaluate(() => location.hash)

async function inInput(page: Page) {
  return page.evaluate(() => document.activeElement?.tagName === 'INPUT')
}

test('the stage fits inside the viewport', async ({ page }) => {
  await open(page)
  const box = await page.locator('.stage').boundingBox()
  const vp = page.viewportSize()!
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(-1)
  expect(box!.y).toBeGreaterThanOrEqual(-1)
  expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 1)
  expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 1)
})

test('steps through the whole deck forward and back without errors', async ({ page }) => {
  const errors = trackErrors(page)
  await open(page)

  for (let i = 0; i < 400 && (await hash(page)) !== LAST; i++) {
    await page.keyboard.press((await inInput(page)) ? 'PageDown' : 'ArrowRight')
    await page.waitForTimeout(60)
  }
  expect(await hash(page)).toBe(LAST)
  await expect(page.locator('.slide[data-slide="close"]')).toBeVisible()

  for (let i = 0; i < 400 && (await hash(page)) !== '#/1/0'; i++) {
    await page.keyboard.press((await inInput(page)) ? 'PageUp' : 'ArrowLeft')
    await page.waitForTimeout(40)
  }
  expect(await hash(page)).toBe('#/1/0')
  await page.waitForTimeout(500)
  expect(errors).toEqual([])
})

test('clicker keys navigate too', async ({ page }) => {
  await open(page, '#/10/0')
  await page.keyboard.press('PageDown')
  await expect.poll(() => hash(page)).toBe('#/10/1')
  await page.keyboard.press('PageUp')
  await expect.poll(() => hash(page)).toBe('#/10/0')
  await page.keyboard.press('.')
  await page.keyboard.press('b')
  expect(await hash(page)).toBe('#/10/0')
})

test('deep link opens the right slide and step', async ({ page }) => {
  await open(page, '#/6/4')
  await expect(page.locator('.slide[data-slide="props"]')).toBeVisible()
  expect(await hash(page)).toBe('#/6/4')
})

test('R resets the current slide demo', async ({ page }) => {
  await open(page, '#/8/5')
  await page.keyboard.press('r')
  await expect.poll(() => hash(page)).toBe('#/8/0')
  await expect(page.locator('.slide[data-slide="state"]')).toBeVisible()
})

test('F5 does not reload the deck', async ({ page }) => {
  await open(page, '#/4/2')
  await page.evaluate(() => ((window as unknown as { __alive: boolean }).__alive = true))
  await page.keyboard.press('F5')
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => (window as unknown as { __alive?: boolean }).__alive)).toBe(true)
  expect(await hash(page)).toBe('#/4/2')
})

test('typing in the audience form does not navigate, PageDown does', async ({ page }) => {
  await open(page, '#/6/5')
  const name = page.locator('.slide input').first()
  await expect(name).toBeFocused()
  await page.keyboard.type('Grace Brr ')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Tab')
  await page.keyboard.type('Rapper')
  expect(await hash(page)).toBe('#/6/5')
  await expect(name).toHaveValue('Grace Brr')
  await page.keyboard.press('Enter')
  await expect(page.locator('.code-panel').last()).toContainText('name="Grace Brr"')
  await expect(page.locator('.code-panel').last()).toContainText('role="Rapper"')
  await expect(page.locator('.card')).toHaveCount(1)
  await expect(name).toBeDisabled()
  expect(await inInput(page)).toBe(false)
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => hash(page)).toBe('#/7/0')
})

test('jump menu goes to a typed slide number', async ({ page }) => {
  await open(page)
  await page.keyboard.press('g')
  await page.keyboard.press('9')
  await page.keyboard.press('Enter')
  await expect.poll(() => hash(page)).toBe('#/9/0')
  await expect(page.locator('.slide[data-slide="everywhere"]')).toBeVisible()
})

test('the like button counts clicks', async ({ page }) => {
  await open(page, '#/8/7')
  const button = page.locator('.like-demo button').first()
  await button.click()
  await button.click()
  await expect(button).toContainText('2')
  await page.keyboard.press('h')
  await expect(button).toContainText('3')
  await expect(page.locator('.like-demo button').nth(1)).toContainText('0')
})
