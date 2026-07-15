import { Box, Link, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Widget from 'src/shared/Widget'

const pageName = 'publicAppealPage'
// product name, not translatable
const strideApiLinkText = 'Open Bus Stride API'

type TaskDetails = {
  title: string
  description: string
}

const PublicAppeal = () => {
  const { t } = useTranslation()
  const tasks = t(`${pageName}.tasks`, { returnObjects: true }) as TaskDetails[]

  return (
    <Box component="main" sx={{ px: 2, width: '100%' }}>
      <Stack spacing={2} sx={{ mx: 'auto', width: '100%', maxWidth: 960 }}>
        <Typography
          component="h1"
          variant="h4"
          className="page-title"
          sx={{ fontWeight: 700, textWrap: 'balance' }}>
          {t(`${pageName}.title`)}
        </Typography>
        {tasks.map((task) => (
          <Task {...task} key={task.title} />
        ))}
      </Stack>
    </Box>
  )
}

const Task = ({ title, description }: TaskDetails) => {
  return (
    <Widget title={title}>
      <Typography component="p" sx={{ textWrap: 'pretty' }}>
        {description}
      </Typography>
      <Link
        href="https://open-bus-stride-api.hasadna.org.il/docs"
        sx={{ display: 'inline-flex', alignItems: 'center', minHeight: 40 }}>
        {strideApiLinkText}
      </Link>
    </Widget>
  )
}

export default PublicAppeal
