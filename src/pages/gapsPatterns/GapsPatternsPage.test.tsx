import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import type { ReactNode } from 'react'
import dayjs from 'src/dayjs'
import { GapsByHour } from './GapsPatternsPage'
import { useGapsList } from './useGapsList'

jest.mock('./useGapsList', () => ({
  useGapsList: jest.fn(() => [
    {
      planned_hour: '08:00',
      planned_rides: 10,
      actual_rides: 8,
    },
  ]),
}))

jest.mock('recharts', () => ({
  Bar: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  Cell: () => null,
  ComposedChart: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

jest.mock('src/shared/Widget', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}))

const mockUseGapsList = jest.mocked(useGapsList)

describe('GapsByHour sorting control', () => {
  test('sorts by hour initially and switches to severity', async () => {
    const user = userEvent.setup()

    render(
      <GapsByHour
        lineRef={42}
        operatorRef="3"
        fromDate={dayjs('2026-07-01')}
        toDate={dayjs('2026-07-02')}
      />,
    )

    const byHour = screen.getByRole('radio', { name: i18next.t('order_by_hour') })
    const bySeverity = screen.getByRole('radio', { name: i18next.t('order_by_severity') })

    expect(byHour).toBeChecked()
    expect(bySeverity).not.toBeChecked()
    expect(mockUseGapsList).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      '3',
      42,
      'hour',
    )

    await user.click(bySeverity)

    expect(bySeverity).toBeChecked()
    expect(byHour).not.toBeChecked()
    expect(mockUseGapsList).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      '3',
      42,
      'severity',
    )
  })
})
