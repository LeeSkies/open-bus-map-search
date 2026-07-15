import { expect, setupTest, test } from './utils'

const MENU_ITEMS = [
  'ראשי',
  'מסלול נסיעה',
  'היסטוריית נסיעות',
  'נסיעות שלא בוצעו',
  'דפוסי נסיעות שלא בוצעו',
  'חברה מפעילה',
  'רכב',
  'מפת תחבורה',
  'מפת מהירות',
  'קול קורא',
  'אודות',
  'לתרומות',
]

test.beforeEach(async ({ page }) => {
  await setupTest(page)
})

test('should display logo and menu items correctly', async ({ page }) => {
  await expect(page.locator('h1.sidebar-logo')).toContainText('דאטאבוס')
  const menu = page.locator('.sidebar-menu:visible')
  for (const label of MENU_ITEMS) {
    await expect(menu.getByText(label, { exact: true })).toBeVisible()
  }
})

test("the sidebar footer doesn't show duplicate icons", async ({ page }) => {
  const footerLocator = page.locator('.sider-footer')
  const svgLocators = footerLocator.locator('svg')
  const innerHTMLs = await svgLocators.evaluateAll((svgs) => svgs.map((svg) => svg.innerHTML))
  expect(innerHTMLs).not.toHaveDuplications()
  expect(innerHTMLs.length).toBeGreaterThan(0)
})

test('make sure the corner GitHub icon leads to DataBus GitHub project', async ({
  page,
  context,
}) => {
  await context.route(/github\.com/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html><body><h1>open-bus-map-search</h1></body></html>',
    }),
  )
  const page1Promise = page.waitForEvent('popup')
  await page.getByLabel('למעבר אל GitHub').locator('svg').click()
  const page1 = await page1Promise
  await expect(page1).toHaveURL(/open-bus-map-search/)
  await expect(page1.getByRole('heading', { name: 'open-bus-map-search' })).toBeVisible()
})
