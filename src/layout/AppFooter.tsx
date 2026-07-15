import { Box } from '@mui/material'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { useTheme } from './ThemeContext'
import './AppFooter.scss'

const AppFooter = () => {
  const { isDarkTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <Box className={cn('app-footer', { dark: isDarkTheme })} component="footer">
      <span className="hideOnMobile footer-copyright">
        {`${t('homepage.copyright')} ${new Date().getFullYear()}`}
      </span>
    </Box>
  )
}

export default AppFooter
