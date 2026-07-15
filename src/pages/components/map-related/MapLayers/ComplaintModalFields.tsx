import type { AnyFieldApi } from '@tanstack/form-core'
import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from '@mui/material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import type { TFunction } from 'i18next'
import dayjs from 'src/dayjs'
import { useGovTimeQuery } from 'src/hooks/useFormQuerys'
import { complaintTypeMappings } from './ComplaintModalForms'
import type {
  ComplaintField,
  ComplaintFormValues,
  ComplaintTitleData,
} from './ComplaintModalTypes'

const numberOnly = /^[0-9]+$/u
const hebOnly = /^[א-ת-\s'"()]+/u
export const mobileOnly = /^05[0-689]-?[2-9][0-9]{6}$/u

export type FieldOption = { label: string; value: string | number }
type FieldType =
  | 'Input'
  | 'TextArea'
  | 'DatePicker'
  | 'TimePicker'
  | 'TimeRangePicker'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'Radio'
  | 'Select'

export type FormFieldConfig = {
  name: ComplaintField
  type: FieldType
  required?: boolean
  maxLength?: number
  rows?: number
  pre_title?: string
}

const createField = (field: FormFieldConfig) => field

export const allComplaintFields: Record<ComplaintField, FormFieldConfig> = {
  firstName: createField({ name: 'firstName', type: 'Input', required: true, maxLength: 25 }),
  lastName: createField({ name: 'lastName', type: 'Input', required: true, maxLength: 25 }),
  iDNum: createField({ name: 'iDNum', type: 'Input', required: true, maxLength: 9 }),
  email: createField({ name: 'email', type: 'Input', required: true }),
  mobile: createField({ name: 'mobile', type: 'Input', required: true, maxLength: 11 }),
  complaintType: createField({ name: 'complaintType', type: 'Select', required: true }),
  applyContent: createField({
    name: 'applyContent',
    type: 'TextArea',
    required: true,
    rows: 4,
    maxLength: 1500,
  }),
  busOperator: createField({ name: 'busOperator', type: 'Select', required: true }),
  licenseNum: createField({ name: 'licenseNum', type: 'Input' }),
  eventDate: createField({
    name: 'eventDate',
    type: 'DatePicker',
    required: true,
    pre_title: 'ביום',
  }),
  lineNumberText: createField({
    name: 'lineNumberText',
    type: 'Input',
    required: true,
    maxLength: 5,
    pre_title: 'קו',
  }),
  eventHour: createField({
    name: 'eventHour',
    type: 'TimePicker',
    required: true,
    pre_title: 'בשעה',
  }),
  direction: createField({ name: 'direction', type: 'Select', required: true }),
  wait: createField({ name: 'wait', type: 'TimeRangePicker', required: true }),
  raisingStation: createField({ name: 'raisingStation', type: 'Select' }),
  raisingStationCity: createField({ name: 'raisingStationCity', type: 'Select', required: true }),
  destinationStationCity: createField({
    name: 'destinationStationCity',
    type: 'Select',
    required: true,
  }),
  reportdate: createField({
    name: 'reportdate',
    type: 'DatePicker',
    required: true,
    pre_title: 'ביום',
  }),
  reportTime: createField({
    name: 'reportTime',
    type: 'TimePicker',
    required: true,
    pre_title: 'בשעה',
  }),
  busDirectionFrom: createField({ name: 'busDirectionFrom', type: 'Input', required: true }),
  busDirectionTo: createField({ name: 'busDirectionTo', type: 'Input', required: true }),
  addOrRemoveStation: createField({ name: 'addOrRemoveStation', type: 'Radio', required: true }),
  raisingStationAddress: createField({ name: 'raisingStationAddress', type: 'Input' }),
  addingFrequencyReason: createField({
    name: 'addingFrequencyReason',
    type: 'CheckboxGroup',
    required: true,
  }),
  firstDeclaration: createField({ name: 'firstDeclaration', type: 'Checkbox', required: true }),
  secondDeclaration: createField({ name: 'secondDeclaration', type: 'Checkbox', required: true }),
  ravKavNumber: createField({ name: 'ravKavNumber', type: 'Input', required: true, maxLength: 11 }),
  debug: createField({ name: 'debug', type: 'Checkbox' }),
}

const empty = (value: unknown) =>
  value === undefined || value === null || value === '' ||
  (Array.isArray(value) && value.length === 0) || value === false

export function validateComplaintField(
  name: ComplaintField,
  value: unknown,
  values: ComplaintFormValues,
  t: TFunction,
  required = allComplaintFields[name].required,
): string | undefined {
  const labelKey = name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  if (required && empty(value)) {
    return String(
      t('reportBug.validation.required', {
        field: String(t(`complaints.${labelKey}` as never)),
      }),
    )
  }
  if (empty(value)) return undefined
  const text = String(value)
  if ((name === 'firstName' || name === 'lastName') && !hebOnly.test(text))
    return t('complaints.only_hebrew_allowed')
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(text))
    return t('reportBug.validation.email')
  if (name === 'mobile' && !mobileOnly.test(text)) return t('complaints.invalid_mobile')
  if (name === 'iDNum') {
    if (text.length !== 9 || !numberOnly.test(text)) return t('complaints.invalid_id')
    const sum = text
      .split('')
      .map((digit, index) => Number(digit) * ((index % 2) + 1))
      .reduce((total, number) => total + Math.floor(number / 10) + (number % 10), 0)
    if (sum % 10 !== 0) return t('complaints.invalid_id')
  }
  if (name === 'ravKavNumber' && (text.length !== 11 || !numberOnly.test(text)))
    return t('complaints.invalid_rav_kav_number')
  if (name === 'applyContent' && text.trim().length < 2)
    return t('reportBug.validation.min', { field: t('complaints.apply_content'), count: 2 })
  if (name === 'wait' && Array.isArray(value) && values.eventHour) {
    const [start, end] = value as [dayjs.Dayjs | undefined, dayjs.Dayjs | undefined]
    if (start && end && (values.eventHour.isBefore(start) || values.eventHour.isAfter(end)))
      return t('complaints.event_hour_between_wait')
  }
  return undefined
}

const firstError = (errors: unknown[]) => (errors.length ? String(errors[0]) : undefined)

type ComplaintFieldControlProps = {
  config: FormFieldConfig
  field: AnyFieldApi
  options?: FieldOption[]
  disabled?: boolean
  required?: boolean
  t: TFunction
}

export function ComplaintFieldControl({
  config,
  field,
  options = [],
  disabled,
  required = config.required,
  t,
}: ComplaintFieldControlProps) {
  const { data: governmentTime } = useGovTimeQuery()
  const labelKey = config.name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  const label = String(t(`complaints.${labelKey}` as never))
  const error = firstError(field.state.meta.errors)
  const commonTextProps = {
    id: config.name,
    name: config.name,
    label,
    required,
    disabled,
    fullWidth: true,
    error: Boolean(error),
    helperText: error,
    onBlur: field.handleBlur,
  }

  switch (config.type) {
    case 'Input':
    case 'TextArea':
      return (
        <TextField
          {...commonTextProps}
          value={(field.state.value as string | undefined) ?? ''}
          multiline={config.type === 'TextArea'}
          minRows={config.rows}
          slotProps={{ htmlInput: { maxLength: config.maxLength } }}
          onChange={(event) => field.handleChange(event.target.value)}
        />
      )
    case 'DatePicker':
      return (
        <DatePicker
          label={label}
          value={(field.state.value as dayjs.Dayjs | undefined) ?? null}
          disabled={disabled}
          maxDate={governmentTime ? dayjs(governmentTime).startOf('day').add(1, 'day') : undefined}
          onChange={(value) => field.handleChange(value ?? undefined)}
          slotProps={{ textField: commonTextProps }}
        />
      )
    case 'TimePicker':
      return (
        <TimePicker
          label={label}
          value={(field.state.value as dayjs.Dayjs | undefined) ?? null}
          disabled={disabled}
          ampm={false}
          minutesStep={5}
          onChange={(value) => field.handleChange(value ?? undefined)}
          slotProps={{ textField: commonTextProps }}
        />
      )
    case 'TimeRangePicker': {
      const range = (field.state.value as ComplaintFormValues['wait']) ?? [undefined, undefined]
      return (
        <FormControl fullWidth required={required} error={Boolean(error)} disabled={disabled}>
          <FormLabel>{label}</FormLabel>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TimePicker
              label={t('start')}
              value={range[0] ?? null}
              ampm={false}
              minutesStep={5}
              onChange={(value) => field.handleChange([value ?? undefined, range[1]])}
              slotProps={{ textField: { fullWidth: true, onBlur: field.handleBlur } }}
            />
            <TimePicker
              label={t('end')}
              value={range[1] ?? null}
              ampm={false}
              minutesStep={5}
              onChange={(value) => field.handleChange([range[0], value ?? undefined])}
              slotProps={{ textField: { fullWidth: true, onBlur: field.handleBlur } }}
            />
          </Stack>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )
    }
    case 'Select': {
      const selected = options.find((option) => option.value === field.state.value) ?? null
      return (
        <Autocomplete
          options={options}
          value={selected}
          disabled={disabled}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(_, option) => field.handleChange(option?.value)}
          onBlur={field.handleBlur}
          renderInput={(params) => <TextField {...params} {...commonTextProps} />}
        />
      )
    }
    case 'Radio':
      return (
        <FormControl required={required} error={Boolean(error)} disabled={disabled}>
          <FormLabel>{label}</FormLabel>
          <RadioGroup
            name={config.name}
            value={(field.state.value as string | undefined) ?? ''}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                sx={{ minHeight: 40 }}
              />
            ))}
          </RadioGroup>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )
    case 'CheckboxGroup': {
      const selected = (field.state.value as string[] | undefined) ?? []
      return (
        <FormControl required={required} error={Boolean(error)} disabled={disabled}>
          <FormLabel>{label}</FormLabel>
          <FormGroup>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                sx={{ minHeight: 40 }}
                control={
                  <Checkbox
                    checked={selected.includes(String(option.value))}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.checked
                          ? [...selected, String(option.value)]
                          : selected.filter((value) => value !== String(option.value)),
                      )
                    }
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )
    }
    case 'Checkbox':
      return (
        <FormControl required={required} error={Boolean(error)} disabled={disabled}>
          <FormControlLabel
            sx={{ minHeight: 40 }}
            control={
              <Checkbox
                name={config.name}
                checked={Boolean(field.state.value)}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.checked)}
              />
            }
            label={label}
          />
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )
  }
}

export const buildComplaintTitle = (data: ComplaintTitleData): string => {
  const { complaintType, eventDate, eventHour, lineNumberText, licenseNum } = data
  const applyTypeText = complaintTypeMappings[complaintType]?.subject?.applyType?.dataText || ''
  const titleParts = [applyTypeText]
  for (const fieldName of complaintTypeMappings[complaintType]?.title_order || []) {
    const preTitle = allComplaintFields[fieldName]?.pre_title
    const value =
      fieldName === 'eventDate'
        ? eventDate?.format('DD/MM/YYYY')
        : fieldName === 'eventHour'
          ? eventHour?.format('HH:mm')
          : fieldName === 'lineNumberText'
            ? lineNumberText
            : fieldName === 'licenseNum'
              ? licenseNum
              : undefined
    if (value) titleParts.push(preTitle ? `${preTitle} ${value}` : value)
  }
  return titleParts.join(' ')
}
