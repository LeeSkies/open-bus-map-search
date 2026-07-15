import MenuIcon from '@mui/icons-material/Menu'
import { Box, IconButton } from '@mui/material'
import { Suspense, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'
import { EasterEgg } from 'src/pages/components/EasterEgg/EasterEgg'
import { Envelope } from 'src/pages/components/EasterEgg/Envelope'
import Preloader from 'src/shared/Preloader'
import AppFooter from './AppFooter'
import { MAIN_SCROLL_CONTAINER_ID } from './constants'
import LayoutContext, { LayoutContextInterface, LayoutCtx } from './LayoutContext'
import SideBar from './sidebar/SideBar'
import { useTheme } from './ThemeContext'
import './layout.scss'

const MobileMenuButton = () => {
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const { t, i18n } = useTranslation()
  const { currentLanguage } = useTheme()

  return (
    <IconButton
      aria-label={t('navigation_open')}
      className="mobile-menu-button hideOnDesktop"
      dir={i18n.dir(currentLanguage)}
      onClick={() => setDrawerOpen(true)}>
      <MenuIcon />
    </IconButton>
  )
}

export function MainLayout() {
  return (
    <Box className="main app-layout" sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      <LayoutContext>
        <MobileMenuButton />
        <SideBar />
        <Box className="app-layout-main">
          <Box className="app-content" component="main" id={MAIN_SCROLL_CONTAINER_ID}>
            <Box className="app-content-body">
              <Suspense fallback={<Preloader />}>
                <Outlet />
                <EasterEgg code="storybook">
                  <a href="/storybook/index.html">
                    <Envelope />
                  </a>
                </EasterEgg>
                <EasterEgg code="geek">
                  <Link to="/data-research">
                    <Envelope />
                  </Link>
                </EasterEgg>
                <EasterEgg code="dashboard">
                  <Link to="/dashboard">
                    <Envelope />
                  </Link>
                </EasterEgg>
              </Suspense>
            </Box>
          </Box>
          <AppFooter />
        </Box>
      </LayoutContext>
    </Box>
  )
}
