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

test('the desktop sidebar collapses and remains keyboard accessible', async ({ page }) => {
  const sidebar = page.locator('.desktop-sidebar')
  const collapseButton = page.getByRole('button', { name: 'צמצום הניווט' })

  await expect(sidebar).toHaveAttribute('data-collapsed', 'false')
  await collapseButton.focus()
  await collapseButton.press('Enter')

  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  await expect(page.getByRole('button', { name: 'הרחבת הניווט' })).toBeFocused()
})

test('the mobile drawer opens from the RTL edge and closes explicitly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'פתיחת הניווט' }).click()

  const drawer = page.locator('.MuiDrawer-paper')
  await expect(drawer).toBeVisible()
  await expect.poll(async () => (await drawer.boundingBox())?.x).toBe(110)
  await expect(drawer).toHaveCSS('width', '280px')

  await page.getByRole('button', { name: 'סגירת הניווט' }).click()
  await expect(drawer).toBeHidden()
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
