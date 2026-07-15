import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import type { ReactNode } from 'react'
import { useGroupBy } from 'src/api/groupByService'
import dayjs from 'src/dayjs'
import DayTimeChart from './DayTimeChart'

jest.mock('src/api/groupByService', () => ({
  useGroupBy: jest.fn(() => [[], false, null]),
}))

jest.mock('./ArrivalByTimeChart', () => ({
  __esModule: true,
  default: function MockArrivalByTimeChart() {
    return <div data-testid="arrival-by-time-chart" />
  },
}))

jest.mock('src/shared/Widget', () => ({
  __esModule: true,
  default: ({ children, title }: { children: ReactNode; title: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}))

const mockUseGroupBy = jest.mocked(useGroupBy)

describe('DayTimeChart grouping control', () => {
  test('groups by day initially and switches the query to hourly data', async () => {
    const user = userEvent.setup()

    render(
      <DayTimeChart
        startDate={dayjs('2026-07-01')}
        endDate={dayjs('2026-07-02')}
        operatorId="3"
        alertAllDayTimeChartHandling={jest.fn()}
      />,
    )

    const byDay = screen.getByRole('radio', {
      name: i18next.t('group_by_day_tooltip_content'),
    })
    const byHour = screen.getByRole('radio', {
      name: i18next.t('group_by_hour_tooltip_content'),
    })

    expect(byDay).toBeChecked()
    expect(byHour).not.toBeChecked()
    expect(mockUseGroupBy).toHaveBeenLastCalledWith(
      expect.objectContaining({ groupBy: 'operator_ref,gtfs_route_date' }),
    )

    await user.click(byHour)

    expect(byHour).toBeChecked()
    expect(byDay).not.toBeChecked()
    expect(mockUseGroupBy).toHaveBeenLastCalledWith(
      expect.objectContaining({ groupBy: 'operator_ref,gtfs_route_hour' }),
    )
  })
})
