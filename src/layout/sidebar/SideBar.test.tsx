import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { LayoutCtx } from '../LayoutContext'
import SideBar from './SideBar'

const setDrawerOpen = jest.fn()
let mockDirection = 'ltr'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { dir: () => mockDirection },
    t: (key: string) => key,
  }),
}))

jest.mock('../ThemeContext', () => ({
  useTheme: () => ({
    currentLanguage: 'en',
    isDarkTheme: false,
    toggleTheme: jest.fn(),
  }),
}))

jest.mock('src/routes', () => ({
  PAGES: [{ path: '/' }],
}))

jest.mock('./menu/Menu', () => ({
  __esModule: true,
  default: ({ collapsed }: { collapsed?: boolean }) => (
    <nav data-testid="sidebar-menu" data-collapsed={!!collapsed} />
  ),
}))

jest.mock('./logo', () => ({
  Logo: ({ title }: { title: string }) => <h1>{title}</h1>,
}))

jest.mock('../header/LanguageToggleButton', () => ({
  LanguageToggleButton: () => <button type="button">language</button>,
}))

jest.mock('../header/ShareButton', () => ({
  ShareButton: () => <button type="button">share</button>,
}))

jest.mock('../header/ToggleThemeButton', () => ({
  __esModule: true,
  default: () => <button type="button">theme</button>,
}))

const renderSidebar = (drawerOpen = false) =>
  render(
    <MemoryRouter>
      <LayoutCtx.Provider value={{ drawerOpen, setDrawerOpen }}>
        <SideBar />
      </LayoutCtx.Provider>
    </MemoryRouter>,
  )

describe('SideBar', () => {
  beforeEach(() => {
    mockDirection = 'ltr'
    setDrawerOpen.mockClear()
  })

  it('collapses and expands the desktop sidebar with an accessible control', async () => {
    const user = userEvent.setup()
    renderSidebar()

    const sidebar = document.querySelector<HTMLElement>('.desktop-sidebar')!
    const collapseButton = screen.getByRole('button', { name: 'navigation_collapse' })
    expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true')

    await user.click(collapseButton)

    expect(sidebar).toHaveAttribute('data-collapsed', 'true')
    expect(screen.getByRole('button', { name: 'navigation_expand' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByTestId('sidebar-menu')).toHaveAttribute('data-collapsed', 'true')
  })

  it('uses direction-aware collapse icons in RTL', () => {
    mockDirection = 'rtl'
    renderSidebar()

    expect(screen.getByTestId('ChevronRightIcon')).toBeInTheDocument()
  })

  it('closes the mobile drawer explicitly', async () => {
    const user = userEvent.setup()
    mockDirection = 'rtl'
    renderSidebar(true)

    await user.click(screen.getByRole('button', { name: 'navigation_close' }))
    expect(setDrawerOpen).toHaveBeenCalledWith(false)
  })
})
