import CheckIcon from '@mui/icons-material/Check'
import LinkIcon from '@mui/icons-material/Link'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { GlobalSearchContext } from 'src/model/globalState'
import { PageShareParamsContext } from 'src/model/routeContext'
import { buildShareUrl } from './shareUrl'

export const ShareButton = () => {
  const { search } = useContext(GlobalSearchContext)
  const { params: pageParams } = useContext(PageShareParamsContext)
  const location = useLocation()
  const [copied, setCopied] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { t } = useTranslation()

  const shareUrl = useMemo(
    () => buildShareUrl(location.pathname, search, pageParams),
    [location.pathname, search, pageParams],
  )

  const handleShare = useCallback(() => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true)
        if (copiedTimer.current) clearTimeout(copiedTimer.current)
        copiedTimer.current = setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        // clipboard API not available; silent fail
      })
  }, [shareUrl])

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    },
    [],
  )

  const tooltipTitle = copied ? (
    t('link_copied')
  ) : (
    <Box>
      <Typography variant="body2">{t('share_link')}</Typography>
      <Typography variant="caption" sx={{ opacity: 0.75, overflowWrap: 'anywhere' }}>
        {shareUrl}
      </Typography>
    </Box>
  )

  return (
    <Tooltip
      title={tooltipTitle}
      open={copied || tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      placement="bottom-end">
      <IconButton
        size="small"
        onClick={handleShare}
        aria-label={copied ? t('link_copied') : t('share_link')}
        sx={{ minWidth: 40, minHeight: 40 }}>
        {copied ? <CheckIcon fontSize="small" /> : <LinkIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  )
}
