import { CalendarOutlined } from '@ant-design/icons'
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
} from '@mui/material'
import React, { useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'
import { useTheme } from 'src/layout/ThemeContext'
import { getPathWithoutLang } from 'src/locale/allTranslations'
import DonateModal from 'src/pages/DonateModal/DonateModal'
import { EVENT_DATE_ISO, REGISTRATION_CLOSE_ISO } from 'src/pages/hackathon/challenges'
import { PAGES } from 'src/routes'
import './menu.scss'

type MainMenuProps = {
  collapsed?: boolean
}

type NavigationItem = {
  icon: React.ReactNode
  label: React.ReactNode
  labelText: string
  path: string
  onClick?: (event: React.MouseEvent) => void
  to?: string
}

const MENU_GROUPS = [
  {
    key: 'menu_group_analysis',
    paths: ['/single-line-map', '/timeline', '/gaps', '/gaps_patterns', '/operator', '/vehicle'],
  },
  {
    key: 'menu_group_maps',
    paths: ['/map', '/velocity-heatmap'],
  },
  {
    key: 'menu_group_community',
    paths: ['/public-appeal', '/about', '/donate'],
  },
] as const

const HACKATHON_REG_CLOSE_MS = new Date(REGISTRATION_CLOSE_ISO).getTime()
const HACKATHON_EVENT_MS = new Date(EVENT_DATE_ISO).getTime()
const HACKATHON_MENU_HIDE_MS = HACKATHON_EVENT_MS + 3 * 24 * 60 * 60 * 1000

const MainMenu = ({ collapsed = false }: MainMenuProps) => {
  const { t, i18n } = useTranslation()
  const { currentLanguage } = useTheme()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const [isDonateModalVisible, setDonateModalVisible] = useState(false)
  const menuRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const currentPath = getPathWithoutLang(pathname) || '/'

  const now = Date.now()
  const showHackathon = now < HACKATHON_MENU_HIDE_MS
  const hackathonDaysLeft =
    now < HACKATHON_REG_CLOSE_MS
      ? Math.ceil((HACKATHON_REG_CLOSE_MS - now) / (1000 * 60 * 60 * 24))
      : null

  const handleDonateClick = (event: React.MouseEvent) => {
    event.preventDefault()
    setDonateModalVisible(true)
    setDrawerOpen(false)
  }

  const routeItems = PAGES.reduce<Record<string, NavigationItem>>((items, page) => {
    items[page.path] = {
      icon: page.icon,
      label: t(page.label),
      labelText: t(page.label),
      path: page.path,
      ...(page.label === 'donate_title'
        ? { onClick: handleDonateClick }
        : { to: `/${currentLanguage}${page.path}` }),
    }
    return items
  }, {})

  const hackathonItem: NavigationItem | null = showHackathon
    ? {
        icon: <CalendarOutlined />,
        label: (
          <>
            {t('hackathon_title')}
            {hackathonDaysLeft !== null && (
              <span className="hackathon-badge">
                {t('hackathon_days_left_badge', { days: hackathonDaysLeft })}
              </span>
            )}
          </>
        ),
        labelText: t('hackathon_title'),
        path: '/hackathon',
        to: `/${currentLanguage}/hackathon`,
      }
    : null

  const homeAndHackathon = [routeItems['/'], hackathonItem].filter(Boolean) as NavigationItem[]
  const flatItems = [
    ...homeAndHackathon,
    ...MENU_GROUPS.flatMap(({ paths }) => paths.map((path) => routeItems[path]).filter(Boolean)),
  ]
  const hasSelectedItem = flatItems.some(({ path }) => path === currentPath)

  const closeDrawer = () => setDrawerOpen(false)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

    const links = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[data-sidebar-menu-item]') ?? [],
    )
    if (!links.length) return

    const focusedIndex = links.indexOf(document.activeElement as HTMLElement)
    let nextIndex: number
    if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = links.length - 1
    else if (event.key === 'ArrowDown') nextIndex = (focusedIndex + 1) % links.length
    else nextIndex = (focusedIndex - 1 + links.length) % links.length

    event.preventDefault()
    links.forEach((link, index) => link.setAttribute('tabindex', index === nextIndex ? '0' : '-1'))
    links[nextIndex].focus()
  }

  const renderItem = (item: NavigationItem) => {
    const selected = item.path === currentPath
    const button = (
      <ListItemButton
        className="sidebar-menu-item"
        component={item.to ? Link : 'button'}
        data-sidebar-menu-item
        key={item.path}
        onClick={item.onClick ?? closeDrawer}
        selected={selected}
        tabIndex={selected || (!hasSelectedItem && item.path === flatItems[0]?.path) ? 0 : -1}
        to={item.to}
        aria-label={collapsed ? item.labelText : undefined}
        aria-current={selected ? 'page' : undefined}>
        <ListItemIcon className="sidebar-menu-item-icon">{item.icon}</ListItemIcon>
        <ListItemText className="sidebar-menu-item-text" primary={item.label} />
      </ListItemButton>
    )

    return collapsed ? (
      <Tooltip
        key={item.path}
        placement={i18n.dir() === 'rtl' ? 'left' : 'right'}
        title={item.labelText}>
        {button}
      </Tooltip>
    ) : (
      button
    )
  }

  return (
    <>
      <List
        aria-label={t('website_name')}
        className={`sidebar-menu${collapsed ? ' sidebar-menu-collapsed' : ''}`}
        component="nav"
        onKeyDown={handleKeyDown}
        ref={menuRef}>
        {collapsed ? (
          flatItems.map(renderItem)
        ) : (
          <>
            {homeAndHackathon.map(renderItem)}
            {MENU_GROUPS.map(({ key, paths }) => (
              <Box className="sidebar-menu-group" component="div" key={key}>
                <ListSubheader className="sidebar-menu-group-title" component="div">
                  {t(key)}
                </ListSubheader>
                <Box>
                  {paths
                    .map((path) => routeItems[path])
                    .filter(Boolean)
                    .map(renderItem)}
                </Box>
              </Box>
            ))}
          </>
        )}
      </List>
      <DonateModal isVisible={isDonateModalVisible} onClose={() => setDonateModalVisible(false)} />
    </>
  )
}

export default MainMenu
