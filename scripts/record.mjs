// Records a paced run-through of the whole deck to artifacts/video.
// Usage: DECK_URL=http://localhost:4173/React-Presentation/ node scripts/record.mjs [wait=2200]
import { chromium } from '@playwright/test'

const [wait = '2200'] = process.argv.slice(2)
const url = process.env.DECK_URL ?? 'http://localhost:4173/React-Presentation/'
const LAST = '#/11/2'
const LONG = { '#/2/3': 12000, '#/2/4': 3500, '#/1/5': 3500, '#/7/3': 3500, '#/3/1': 3500 }

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: 'artifacts/video', size: { width: 1920, height: 1080 } },
})
const page = await context.newPage()
await page.goto(`${url}#/1/0`)
await page.locator('.slide').first().waitFor()
await page.waitForTimeout(1500)

for (let i = 0; i < 120; i++) {
  const hash = await page.evaluate(() => location.hash)
  if (hash === LAST) break
  const typing = await page.evaluate(() => document.activeElement?.tagName === 'INPUT')
  if (typing) {
    await page.keyboard.type('Taylor Swift', { delay: 70 })
    await page.keyboard.press('Tab')
    await page.keyboard.type('Singer', { delay: 70 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1800)
    await page.keyboard.press('PageDown')
  } else {
    if (hash === '#/8/6' || hash === '#/8/7') {
      for (let k = 0; k < 3; k++) {
        await page.keyboard.press('h')
        await page.waitForTimeout(350)
      }
    }
    await page.keyboard.press('ArrowRight')
  }
  const now = await page.evaluate(() => location.hash)
  await page.waitForTimeout(LONG[now] ?? Number(wait))
}
await page.waitForTimeout(2500)
const video = page.video()
await context.close()
console.log('video:', await video?.path())
await browser.close()
