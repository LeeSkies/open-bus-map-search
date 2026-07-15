import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import { Dayjs } from 'src/dayjs'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import Widget from 'src/shared/Widget'
import ArrivalByTimeChart from './ArrivalByTimeChart'

const convertToGraphCompatibleStruct = (arr: GroupByRes[]) => {
  return arr.map((item) => {
    return {
      operatorId: item.operatorRef?.operatorRef.toString() || 'Unknown',
      name: item.operatorRef?.agencyName || 'Unknown',
      current: item.totalActualRides,
      max: item.totalPlannedRides,
      percent: (item.totalActualRides / item.totalPlannedRides) * 100,
      gtfsRouteDate: item.gtfsRouteDate ? new Date(item.gtfsRouteDate) : undefined,
      gtfsRouteHour: item.gtfsRouteHour ? new Date(item.gtfsRouteHour) : undefined,
    }
  })
}

interface DayTimeChartProps {
  startDate: Dayjs
  endDate: Dayjs
  operatorId: string
  alertAllDayTimeChartHandling: (arg: boolean) => void
}

const DayTimeChart: FC<DayTimeChartProps> = ({
  startDate,
  endDate,
  operatorId,
  alertAllDayTimeChartHandling,
}) => {
  const { t } = useTranslation()
  const [groupByHour, setGroupByHour] = useState<boolean>(false)

  const [data, loadingGraph] = useGroupBy({
    dateFrom: startDate,
    dateTo: endDate,
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  })

  const graphData = useMemo(
    () => convertToGraphCompatibleStruct(data),
    [endDate, groupByHour, startDate, data.length],
  )

  useEffect(() => {
    const totalElements = data.length
    const totalZeroElements = data.filter((el) => el.totalActualRides === 0).length
    if (totalElements === 0 || totalZeroElements === totalElements) {
      alertAllDayTimeChartHandling(true)
    } else {
      alertAllDayTimeChartHandling(false)
    }
  }, [data])

  return (
    <Widget title={t(`dashboard_page_graph_title_${groupByHour ? 'hour' : 'day'}`)} marginBottom>
      <RadioGroup
        row
        aria-label={`${t('group_by_day_tooltip_content')} / ${t('group_by_hour_tooltip_content')}`}
        value={groupByHour ? 'byHour' : 'byDay'}
        onChange={(_, value) => setGroupByHour(value === 'byHour')}
        sx={{ mb: 1.25, flexWrap: 'wrap' }}>
        <FormControlLabel
          value="byDay"
          control={<Radio />}
          label={t('group_by_day_tooltip_content')}
          sx={{ minHeight: 40 }}
        />
        <FormControlLabel
          value="byHour"
          control={<Radio />}
          label={t('group_by_hour_tooltip_content')}
          sx={{ minHeight: 40 }}
        />
      </RadioGroup>
      {loadingGraph ? (
        <SkeletonLoader active />
      ) : (
        <ArrivalByTimeChart data={graphData} operatorId={operatorId} />
      )}
    </Widget>
  )
}

export default DayTimeChart
