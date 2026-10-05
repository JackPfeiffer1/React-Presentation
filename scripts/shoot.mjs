// Dev helper: step through the deck and screenshot every step.
// Usage: node scripts/shoot.mjs [startSlide=1] [presses=10] [wait=2500] [width=1920] [height=1080]
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const [start = '1', presses = '10', wait = '2500', width = '1920', height = '1080'] = process.argv.slice(2)
const url = process.env.DECK_URL ?? 'http://localhost:5173/React-Presentation/'
mkdirSync('artifacts/shots', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(`${url}#/${start}/0`)
await page.waitForSelector('.slide', { timeout: 15000 })
await page.waitForTimeout(800)
const shot = async (i) => {
  const hash = await page.evaluate(() => location.hash)
  const name = `artifacts/shots/${String(i).padStart(2, '0')}_${hash.replace(/[#/]+/g, '_')}.png`
  await page.screenshot({ path: name })
  console.log(name)
}
await shot(0)
for (let i = 1; i <= Number(presses); i++) {
  const typing = await page.evaluate(() => document.activeElement?.tagName === 'INPUT')
  if (typing) {
    await page.keyboard.type('Taylor Swift', { delay: 40 })
    await page.keyboard.press('Tab')
    await page.keyboard.type('Singer', { delay: 40 })
    await page.waitForTimeout(400)
    await shot(`${i}a`)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(800)
    await shot(`${i}b`)
    await page.keyboard.press('PageDown')
  } else {
    await page.keyboard.press('ArrowRight')
  }
  await page.waitForTimeout(Number(wait))
  await shot(i)
}
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
