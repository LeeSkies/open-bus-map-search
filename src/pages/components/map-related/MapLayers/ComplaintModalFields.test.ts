import type { TFunction } from 'i18next'
import dayjs from 'src/dayjs'
import { buildComplaintTitle, validateComplaintField } from './ComplaintModalFields'
import type { ComplaintFormValues } from './ComplaintModalTypes'

const t = ((key: string) => key) as TFunction
const values = { complaintType: 'no_ride' } as ComplaintFormValues

describe('complaint form validation', () => {
  it('requires fields and validates Israeli personal details', () => {
    expect(validateComplaintField('firstName', '', values, t)).toBe(
      'reportBug.validation.required',
    )
    expect(validateComplaintField('firstName', 'Lee', values, t)).toBe(
      'complaints.only_hebrew_allowed',
    )
    expect(validateComplaintField('iDNum', '123456789', values, t)).toBe(
      'complaints.invalid_id',
    )
    expect(validateComplaintField('iDNum', '123456782', values, t)).toBeUndefined()
    expect(validateComplaintField('mobile', '050-1234567', values, t)).toBe(
      'complaints.invalid_mobile',
    )
    expect(validateComplaintField('mobile', '050-2345678', values, t)).toBeUndefined()
  })

  it('requires the event time to fall inside the selected wait range', () => {
    const timedValues = { ...values, eventHour: dayjs('2026-07-15T12:00:00') }
    expect(
      validateComplaintField(
        'wait',
        [dayjs('2026-07-15T12:05:00'), dayjs('2026-07-15T12:30:00')],
        timedValues,
        t,
      ),
    ).toBe('complaints.event_hour_between_wait')
    expect(
      validateComplaintField(
        'wait',
        [dayjs('2026-07-15T11:30:00'), dayjs('2026-07-15T12:30:00')],
        timedValues,
        t,
      ),
    ).toBeUndefined()
  })
})

describe('complaint title construction', () => {
  it('preserves the Ministry complaint title format', () => {
    expect(
      buildComplaintTitle({
        complaintType: 'no_ride',
        lineNumberText: '18',
        eventDate: dayjs('2026-07-15'),
        eventHour: dayjs('2026-07-15T08:05:00'),
      }),
    ).toBe('אי ביצוע נסיעה קו 18 ביום 15/07/2026 בשעה 08:05')
  })
})
