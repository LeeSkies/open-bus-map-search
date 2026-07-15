import type { ComplaintFormSchemaAnyOf } from '@hasadna/open-bus-api-client'
import { Close } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard, useLocalStorage } from 'usehooks-ts'
import { COMPLAINTS_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import {
  useBoardingStationQuery,
  useBusOperatorQuery,
  useCitiesQuery,
  useLinesQuery,
} from 'src/hooks/useFormQuerys'
import { EasterEgg } from '../../EasterEgg/EasterEgg'
import {
  allComplaintFields,
  buildComplaintTitle,
  ComplaintFieldControl,
  type FieldOption,
  mobileOnly,
  validateComplaintField,
} from './ComplaintModalFields'
import { complaintTypeMappings } from './ComplaintModalForms'
import type {
  ComplaintField,
  ComplaintFormValues,
  ComplaintModalProps,
  ComplaintType,
  ComplaintUser,
} from './ComplaintModalTypes'
import { complaintTypes } from './ComplaintModalTypes'

const DEBUG_COMPLAINT_TYPES: ComplaintType[] = [
  'overcrowded',
  'add_or_remove_station',
  'add_new_line',
  'add_frequency',
  'driver_behavior',
  'cleanliness',
  'fine_appeal',
  'route_change',
  'line_switch',
  'station_signs',
  'ticketing_fares_discounts',
  'other',
]

const ComplaintModal = ({
  modalOpen = false,
  setModalOpen,
  position,
  route,
}: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [userStorage, setUserStorage] = useLocalStorage<Partial<ComplaintUser>>('complaint', {})
  const [, copy] = useCopyToClipboard()
  const date = useMemo(
    () => (position.point?.recordedAtTime ? dayjs(position.point.recordedAtTime) : undefined),
    [position.point?.recordedAtTime],
  )
  const routeParts = useMemo(
    () => route.routeLongName?.split(/[<->,-]/u).filter((part) => part.trim()),
    [route.routeLongName],
  )
  const defaultValues = useMemo(
    () =>
      ({
        ...userStorage,
        addOrRemoveStation: '2',
        busOperator: position.operator,
        eventDate: date,
        eventHour: date,
        wait: [date?.add(-30, 'm'), date?.add(30, 'm')],
        raisingStationCity: routeParts?.[1],
        destinationStationCity: routeParts?.[3],
        licenseNum: position.point?.siriRideVehicleRef,
        lineNumberText: route.routeShortName,
        debug: false,
      }) as ComplaintFormValues,
    [
      date,
      position.operator,
      position.point?.siriRideVehicleRef,
      route.routeShortName,
      routeParts,
      userStorage,
    ],
  )

  const submitMutation = useMutation({
    mutationFn: (post: { debug: boolean; data: ComplaintFormSchemaAnyOf }) =>
      COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest: post }),
  })

  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => handleSubmit(value),
  })
  const values = useStore(form.store, (state) => state.values)
  const { debug, eventDate, reportdate, busOperator, lineNumberText, direction, complaintType } =
    values

  const busOperatorQuery = useBusOperatorQuery()
  const citiesQuery = useCitiesQuery()
  const linesQuery = useLinesQuery(eventDate || reportdate, busOperator, lineNumberText)
  const stationQuery = useBoardingStationQuery(
    direction !== undefined ? linesQuery.data?.[direction] : undefined,
  )
  const routeDependencies = `${eventDate?.valueOf() ?? ''}|${reportdate?.valueOf() ?? ''}|${busOperator ?? ''}|${lineNumberText ?? ''}`
  const previousRouteDependencies = useRef(routeDependencies)

  useEffect(() => {
    if (previousRouteDependencies.current !== routeDependencies) {
      previousRouteDependencies.current = routeDependencies
      form.setFieldValue('direction', undefined)
      form.setFieldValue('raisingStation', undefined)
    }
  }, [form, routeDependencies])

  useEffect(() => {
    form.setFieldValue('raisingStation', undefined)
  }, [direction, form])

  useEffect(() => {
    if (values.addOrRemoveStation === '2') form.setFieldValue('raisingStation', undefined)
    else form.setFieldValue('raisingStationAddress', undefined)
  }, [form, values.addOrRemoveStation])

  useEffect(() => {
    if (values.wait) void form.validateField('wait', 'change')
  }, [form, values.eventHour])

  const buildComplaintData = useCallback(
    (complaintData: ComplaintFormValues): ComplaintFormSchemaAnyOf => {
      const selectedOperator = busOperatorQuery.data?.find(
        (operator) => operator.dataCode === complaintData.busOperator,
      )
      const selectedDirection =
        complaintData.direction !== undefined
          ? linesQuery.data?.[complaintData.direction]
          : undefined
      const selectedStation =
        complaintData.raisingStation !== undefined
          ? stationQuery.data?.[complaintData.raisingStation]
          : undefined
      return {
        personalDetails: {
          firstName: complaintData.firstName,
          lastName: complaintData.lastName,
          iDNum: complaintData.iDNum,
          email: complaintData.email,
          mobile: complaintData.mobile,
        },
        requestSubject: complaintTypeMappings[complaintData.complaintType].subject,
        title: buildComplaintTitle(complaintData),
        busAndOther: {
          applyContent: complaintData.applyContent,
          busDirectionFrom: complaintData.busDirectionFrom,
          busDirectionTo: complaintData.busDirectionTo,
          fillByMakatOrAddress: '2',
          licenseNum: complaintData.licenseNum,
          lineNumberText: complaintData.lineNumberText,
          eventHour: complaintData.eventHour?.format('HH:mm'),
          fromHour: complaintData.wait?.[0]?.format('HH:mm'),
          toHour: complaintData.wait?.[1]?.format('HH:mm'),
          eventDate: complaintData.eventDate?.toDate(),
          operator: selectedOperator
            ? { dataText: selectedOperator.dataText, dataCode: selectedOperator.dataCode }
            : undefined,
          direction: selectedDirection
            ? {
                dataText: selectedDirection.directionText!,
                dataCode: selectedDirection.directionCode!,
              }
            : undefined,
          raisingStation: selectedStation
            ? { dataText: selectedStation.stationName!, dataCode: selectedStation.stationId! }
            : undefined,
        },
      }
    },
    [busOperatorQuery.data, linesQuery.data, stationQuery.data],
  )

  function handleSubmit(complaintData: ComplaintFormValues) {
    submitMutation.reset()
    submitMutation.mutate({
      debug: Boolean(complaintData.debug),
      data: buildComplaintData(complaintData),
    })
  }

  useEffect(() => {
    if (route.routeShortName === lineNumberText && linesQuery.data?.length) {
      const index = linesQuery.data.findIndex(
        ({ lineCode, directionCode }) =>
          Number(route.routeMkt) === lineCode && Number(directionCode) === directionCode,
      )
      if (index !== -1 && direction !== index) form.setFieldValue('direction', index)
    }
  }, [direction, form, lineNumberText, linesQuery.data, route])

  useEffect(() => {
    const mobile = values.mobile
    if (mobile && mobileOnly.test(mobile) && mobile.length === 10) {
      form.setFieldValue('mobile', `${mobile.slice(0, 3)}-${mobile.slice(3)}`)
      return
    }
    setUserStorage({
      firstName: values.firstName,
      lastName: values.lastName,
      iDNum: values.iDNum,
      email: values.email,
      mobile: values.mobile,
    })
  }, [form, setUserStorage, values.email, values.firstName, values.iDNum, values.lastName, values.mobile])

  const optionMap = useMemo<Partial<Record<ComplaintField, FieldOption[]>>>(() => {
    const visibleTypes = debug
      ? complaintTypes
      : complaintTypes.filter((type) => !DEBUG_COMPLAINT_TYPES.includes(type))
    return {
      complaintType: visibleTypes.map((type) => ({ value: type, label: t(`complaints.${type}`) })),
      addingFrequencyReason: [
        { label: t('complaints.add_frequency_load_topics'), value: 'LoadTopics' },
        { label: t('complaints.add_frequency_long_waiting'), value: 'LongWaiting' },
        { label: t('complaints.add_frequency_extension_time'), value: 'ExtensionHours' },
      ],
      addOrRemoveStation: [
        { label: t('complaints.add_station'), value: '2' },
        { label: t('complaints.remove_station'), value: '1' },
      ],
      busOperator: busOperatorQuery.data
        ?.filter(({ dataText, dataCode }) => dataText != null && dataCode != null)
        .map(({ dataText, dataCode }) => ({ label: String(dataText), value: Number(dataCode) })),
      raisingStation: stationQuery.data?.map(({ stationName }, index) => ({
        label: stationName!,
        value: index,
      })),
      direction: linesQuery.data?.map(({ directionText }, index) => ({
        label: directionText!,
        value: index,
      })),
      raisingStationCity: citiesQuery.data
        ?.filter(({ dataText }) => dataText != null)
        .map(({ dataText }) => ({ label: String(dataText), value: String(dataText) })),
      destinationStationCity: citiesQuery.data
        ?.filter(({ dataText }) => dataText != null)
        .map(({ dataText }) => ({ label: String(dataText), value: String(dataText) })),
    }
  }, [busOperatorQuery.data, citiesQuery.data, debug, linesQuery.data, stationQuery.data, t])

  const renderField = (
    name: ComplaintField,
    overrides: { disabled?: boolean; required?: boolean } = {},
  ) => (
    <form.Field
      key={name}
      name={name}
      validators={{
        onChange: ({ value }) =>
          validateComplaintField(name, value, form.state.values, t, overrides.required),
      }}>
      {(field) => (
        <ComplaintFieldControl
          config={allComplaintFields[name]}
          field={field}
          options={optionMap[name]}
          disabled={overrides.disabled}
          required={overrides.required}
          t={t}
        />
      )}
    </form.Field>
  )

  const dynamicFields = useMemo(() => {
    if (!complaintType) return []
    const isAddStation = values.addOrRemoveStation === '2'
    return complaintTypeMappings[complaintType].fields.map((name) => {
      if (complaintType === 'add_or_remove_station' && name === 'raisingStationAddress')
        return renderField(name, { disabled: !isAddStation, required: isAddStation })
      if (complaintType === 'add_or_remove_station' && name === 'raisingStation')
        return renderField(name, { disabled: isAddStation, required: !isAddStation })
      if (name === 'raisingStationAddress' && complaintType === 'station_signs')
        return renderField(name, { required: true })
      return renderField(name)
    })
  }, [complaintType, optionMap, values.addOrRemoveStation])

  return (
    <Dialog
      dir={i18n.dir()}
      open={modalOpen}
      onClose={() => setModalOpen?.(false)}
      fullWidth
      maxWidth="sm"
      aria-labelledby="complaint-dialog-title"
      slotProps={{ paper: { sx: { width: { xs: 'calc(100% - 24px)', sm: '100%' } } } }}>
      <DialogTitle
        id="complaint-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="span" variant="h5" sx={{ fontWeight: 700, textWrap: 'balance' }}>
          {t('complaints.complaint')}
        </Typography>
        <IconButton
          aria-label={t('complaints.close')}
          onClick={() => setModalOpen?.(false)}
          sx={{ minWidth: 40, minHeight: 40 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {submitMutation.isSuccess ? (
          <Stack spacing={3}>
            <Button
              variant="outlined"
              sx={{ minHeight: 80, fontVariantNumeric: 'tabular-nums' }}
              onClick={() => copy(submitMutation.data?.referenceNumber || '')}>
              <Typography variant="h6">
                {t('complaints.complaint_number')}
                <br />
                <strong>{submitMutation.data?.referenceNumber}</strong>
              </Typography>
            </Button>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={() => setModalOpen?.(false)}>
                {t('complaints.close')}
              </Button>
              <Button
                onClick={() => {
                  submitMutation.reset()
                  form.reset(defaultValues)
                }}>
                {t('complaints.new_complaint')}
              </Button>
            </Stack>
          </Stack>
        ) : busOperatorQuery.isLoading ? (
          <Stack spacing={2} role="status" sx={{ alignItems: 'center' }}>
            <span>{t('loading_routes')}</span>
            <CircularProgress />
          </Stack>
        ) : (
          <Box
            component="form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}>
            <Stack spacing={2.5}>
              {submitMutation.isError && <Alert severity="error">{t('reportBug.error')}</Alert>}
              {renderField('firstName')}
              {renderField('lastName')}
              {renderField('iDNum')}
              {renderField('email')}
              {renderField('mobile')}
              {renderField('complaintType')}
              {dynamicFields}
              {complaintType && renderField('applyContent')}
              <EasterEgg
                code="debug"
                autohide={false}
                onShow={() => form.setFieldValue('debug', true)}>
                {renderField('debug')}
              </EasterEgg>
              <DialogActions sx={{ px: 0 }}>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!canSubmit || isSubmitting || submitMutation.isPending}
                      loading={submitMutation.isPending}>
                      {t('complaints.submit_complaint')}
                    </Button>
                  )}
                </form.Subscribe>
              </DialogActions>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ComplaintModal
