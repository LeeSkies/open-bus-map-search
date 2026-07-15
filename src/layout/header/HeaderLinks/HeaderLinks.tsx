import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { HEADER_LINKS, PAGES } from 'src/routes'

type LinkType = Omit<(typeof HEADER_LINKS)[number], 'element'>
const LANG_PREFIXES = new Set(['he', 'en', 'ru', 'ar'])

function normalizeRoutePath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (LANG_PREFIXES.has(segments[0])) {
    segments.shift()
  }
  return segments.length ? `/${segments.join('/')}` : '/'
}

type HeaderLinksProps = {
  children?: React.ReactNode
}

const HeaderLinks: FC<HeaderLinksProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {children}
      {HEADER_LINKS.map((item) => {
        if (item.element === null) {
          return (
            <ExternalLink key={item.label} label={item.label} icon={item.icon} path={item.path} />
          )
        } else {
          return (
            <InternalLink key={item.label} label={item.label} icon={item.icon} path={item.path} />
          )
        }
      })}
    </Box>
  )
}

const ExternalLink = ({ label, path, icon }: LinkType) => {
  const { t } = useTranslation()
  return (
    <IconButton
      size="small"
      aria-label={t(label)}
      title={t(label)}
      onClick={() => void window.open(path, '_blank')}>
      {icon}
    </IconButton>
  )
}

const InternalLink = ({ label, path, icon }: LinkType) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const currentRoute = PAGES.find((page) => page.path === normalizeRoutePath(location.pathname))

  return (
    <IconButton
      size="small"
      aria-label={t(label)}
      title={t(label)}
      onClick={() => {
        navigate(path, {
          state: currentRoute
            ? {
                from: {
                  path: `${location.pathname}${location.search}`,
                  title: t(currentRoute.label),
                },
              }
            : undefined,
        })
      }}>
      {icon}
    </IconButton>
  )
}

export default HeaderLinks
