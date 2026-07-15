import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import GitHubIcon from '@mui/icons-material/GitHub'
import { Box, Drawer, IconButton } from '@mui/material'
import cn from 'classnames'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { PAGES } from 'src/routes'
import { LanguageToggleButton } from '../header/LanguageToggleButton'
import { ShareButton } from '../header/ShareButton'
import ToggleThemeButton from '../header/ToggleThemeButton'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import { Logo } from './logo'
import Menu from './menu/Menu'
import './sidebar.scss'

const DESKTOP_SIDEBAR_WIDTH = 250
const COLLAPSED_SIDEBAR_WIDTH = 60
const MOBILE_SIDEBAR_WIDTH = 280

const CollapsedLogo = () => <h1 className="sidebar-logo-collapsed">🚌</h1>

type SidebarActionsProps = {
  isDarkTheme?: boolean
  onReportBug: () => void
  toggleTheme: () => void
}

const SidebarActions = ({ isDarkTheme, onReportBug, toggleTheme }: SidebarActionsProps) => {
  const { t } = useTranslation()

  return (
    <Box className="sidebar-actions">
      <ShareButton />
      <LanguageToggleButton />
      <ToggleThemeButton toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
      <IconButton
        aria-label={t('report_a_bug_title')}
        className="sidebar-action-button"
        title={t('report_a_bug_title')}
        onClick={onReportBug}>
        <BugReportOutlinedIcon />
      </IconButton>
      <IconButton
        aria-label={t('github_link')}
        className="sidebar-action-button"
        title={t('github_link')}
        onClick={() =>
          void window.open('https://github.com/hasadna/open-bus-map-search', '_blank')
        }>
        <GitHubIcon />
      </IconButton>
    </Box>
  )
}

export default function SideBar() {
  const { t, i18n } = useTranslation()
  const { drawerOpen, setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const [collapsed, setCollapsed] = useState(false)
  const { isDarkTheme, currentLanguage, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isRtl = i18n.dir() === 'rtl'
  const closeDrawer = () => setDrawerOpen(false)
  const reportBug = () => {
    closeDrawer()
    void navigate('/report-a-bug')
  }
  const CollapseIcon = isRtl
    ? collapsed
      ? ChevronLeftIcon
      : ChevronRightIcon
    : collapsed
      ? ChevronRightIcon
      : ChevronLeftIcon

  return (
    <>
      <Drawer
        // MUI mirrors horizontal anchors with the theme direction, so `left`
        // represents the logical start edge (physical right in RTL).
        anchor="left"
        className={cn('mobile-sidebar hideOnDesktop', { dark: isDarkTheme })}
        onClose={closeDrawer}
        open={drawerOpen}
        slotProps={{ paper: { sx: { width: MOBILE_SIDEBAR_WIDTH } } }}>
        <Box className="mobile-sidebar-header">
          <IconButton
            aria-label={t('navigation_close')}
            className="sidebar-action-button"
            onClick={closeDrawer}>
            <CloseIcon />
          </IconButton>
          <SidebarActions
            isDarkTheme={isDarkTheme}
            onReportBug={reportBug}
            toggleTheme={toggleTheme}
          />
        </Box>
        <Box className="mobile-sidebar-scroll">
          <Logo title={t('website_name')} dark={isDarkTheme} />
          <div className="sidebar-divider" />
          <Menu />
        </Box>
      </Drawer>

      <Box
        component="aside"
        className={cn('desktop-sidebar hideOnMobile', { dark: isDarkTheme })}
        data-collapsed={collapsed}
        sx={{
          bgcolor: 'background.paper',
          boxShadow: isDarkTheme ? '0 0 12px 4px rgba(0,0,0,0.7)' : '0 0 12px 4px rgba(0,0,0,0.12)',
          width: collapsed ? COLLAPSED_SIDEBAR_WIDTH : DESKTOP_SIDEBAR_WIDTH,
        }}>
        <Box className="sider-inner">
          <Box className="sider-scroll">
            <Link
              aria-label={t('homepage_title')}
              className="sidebar-home-link"
              to={`/${currentLanguage}${PAGES[0].path}`}
              replace>
              {collapsed ? (
                <CollapsedLogo />
              ) : (
                <Logo title={t('website_name')} dark={isDarkTheme} />
              )}
            </Link>
            <div className="sidebar-divider" />
            <Menu collapsed={collapsed} />
          </Box>
          <Box className="sider-footer">
            <IconButton
              aria-expanded={!collapsed}
              aria-label={t(collapsed ? 'navigation_expand' : 'navigation_collapse')}
              className="sidebar-action-button"
              onClick={() => setCollapsed((value) => !value)}>
              <CollapseIcon />
            </IconButton>
            {!collapsed && (
              <SidebarActions
                isDarkTheme={isDarkTheme}
                onReportBug={reportBug}
                toggleTheme={toggleTheme}
              />
            )}
          </Box>
        </Box>
      </Box>
    </>
  )
}
