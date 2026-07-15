import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { LayoutCtx } from 'src/layout/LayoutContext'
import MainMenu from './Menu'

const setDrawerOpen = jest.fn()

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { dir: () => 'ltr' },
    t: (key: string, options?: { days?: number }) =>
      options?.days === undefined ? key : `${key}:${options.days}`,
  }),
}))

jest.mock('src/layout/ThemeContext', () => ({
  useTheme: () => ({ currentLanguage: 'en' }),
}))

jest.mock('src/pages/DonateModal/DonateModal', () => ({
  __esModule: true,
  default: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div role="dialog">donate_dialog</div> : null,
}))

jest.mock('src/pages/hackathon/challenges', () => ({
  EVENT_DATE_ISO: '2099-07-21T18:00:00+03:00',
  REGISTRATION_CLOSE_ISO: '2099-07-20T23:59:00+03:00',
}))

jest.mock('src/routes', () => ({
  PAGES: [
    { label: 'homepage_title', path: '/', icon: null },
    { label: 'timeline_page_title', path: '/timeline', icon: null },
    { label: 'gaps_page_title', path: '/gaps', icon: null },
    { label: 'gaps_patterns_page_title', path: '/gaps_patterns', icon: null },
    { label: 'time_based_map_page_title', path: '/map', icon: null },
    { label: 'velocity_heatmap_page_title', path: '/velocity-heatmap', icon: null },
    { label: 'singleline_map_page_title', path: '/single-line-map', icon: null },
    { label: 'vehicle_page_title', path: '/vehicle', icon: null },
    { label: 'operator_title', path: '/operator', icon: null },
    { label: 'about_title', path: '/about', icon: null },
    { label: 'donate_title', path: '/donate', icon: null },
    { label: 'public_appeal_title', path: '/public-appeal', icon: null },
  ],
}))

const renderMenu = (path = '/en/timeline', collapsed = false) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LayoutCtx.Provider value={{ drawerOpen: true, setDrawerOpen }}>
        <MainMenu collapsed={collapsed} />
      </LayoutCtx.Provider>
    </MemoryRouter>,
  )

describe('MainMenu', () => {
  beforeEach(() => setDrawerOpen.mockClear())

  it('groups routes and marks the current page', () => {
    renderMenu()

    expect(screen.getByText('menu_group_analysis')).toBeInTheDocument()
    expect(screen.getByText('menu_group_maps')).toBeInTheDocument()
    expect(screen.getByText('menu_group_community')).toBeInTheDocument()

    const currentLink = screen.getByRole('link', { name: 'timeline_page_title' })
    expect(currentLink).toHaveAttribute('href', '/en/timeline')
    expect(currentLink).toHaveAttribute('aria-current', 'page')
    expect(currentLink).toHaveAttribute('tabindex', '0')
  })

  it('supports roving keyboard navigation, including wrapping and boundary keys', () => {
    renderMenu()
    const navigation = screen.getByRole('navigation', { name: 'website_name' })
    const linksAndButtons = Array.from(
      navigation.querySelectorAll<HTMLElement>('[data-sidebar-menu-item]'),
    )
    const currentIndex = linksAndButtons.findIndex(
      (item) => item.getAttribute('aria-current') === 'page',
    )
    act(() => linksAndButtons[currentIndex].focus())

    fireEvent.keyDown(navigation, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(linksAndButtons[currentIndex + 1])

    fireEvent.keyDown(navigation, { key: 'End' })
    expect(document.activeElement).toBe(linksAndButtons.at(-1))

    fireEvent.keyDown(navigation, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(linksAndButtons[0])

    fireEvent.keyDown(navigation, { key: 'Home' })
    expect(document.activeElement).toBe(linksAndButtons[0])
  })

  it('closes the drawer after navigation and opens donations without changing routes', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('link', { name: 'about_title' }))
    expect(setDrawerOpen).toHaveBeenCalledWith(false)

    await user.click(screen.getByRole('button', { name: 'donate_title' }))
    expect(setDrawerOpen).toHaveBeenLastCalledWith(false)
    expect(screen.getByRole('dialog')).toHaveTextContent('donate_dialog')
  })

  it('flattens the menu when collapsed while retaining accessible labels and hit areas', () => {
    renderMenu('/en/map', true)

    expect(screen.queryByText('menu_group_analysis')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'time_based_map_page_title' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    document.querySelectorAll('[data-sidebar-menu-item]').forEach((item) => {
      expect(item).toHaveClass('sidebar-menu-item')
    })
  })
})
