import LanguageIcon from '@mui/icons-material/Language'
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeContext'

const languages = [
  { key: 'he', label: 'עברית' },
  { key: 'en', label: 'English' },
  { key: 'ru', label: 'Русский' },
  { key: 'ar', label: 'العربية' },
]

export const LanguageToggleButton = () => {
  const { setLanguage, currentLanguage } = useTheme()
  const { t } = useTranslation()
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null)
  const menuOpen = Boolean(anchorElement)

  const handleLanguageChange = (key: string) => {
    setLanguage(key)
    setAnchorElement(null)
  }

  return (
    <>
      <Tooltip title={t('change_language')}>
        <IconButton
          size="small"
          aria-label={t('change_language')}
          aria-controls={menuOpen ? 'language-menu' : undefined}
          aria-expanded={menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          onClick={(event) => setAnchorElement(event.currentTarget)}
          sx={{ minWidth: 40, minHeight: 40 }}>
          <LanguageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorElement}
        open={menuOpen}
        onClose={() => setAnchorElement(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {languages.map(({ key, label }) => (
          <MenuItem
            key={key}
            selected={key === currentLanguage}
            onClick={() => handleLanguageChange(key)}>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
