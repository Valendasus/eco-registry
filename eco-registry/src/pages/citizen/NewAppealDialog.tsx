import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useAddAppeal } from '../../api/hooks'
import { DateInput, FieldGrid, FieldModeContext, RadioInput, SelectInput, TextInput, ToggleInput } from '../../components/form'
import { useNotify } from '../../components/ui/notify'
import {
  APPEAL_CHANNELS,
  APPEAL_PRIORITIES,
  APPEAL_TOPICS,
  DEPARTMENTS,
  EXECUTORS,
  recordToOptions,
} from '../../entities/citizen/dictionaries'
import type { AppealChannel, AppealPriority, AppealTopic, CitizenDetails } from '../../entities/citizen/types'
import { dayjs, ISO_DATE } from '../../lib/date'

interface AppealDraft {
  channel: AppealChannel
  topic: AppealTopic
  subject: string
  description: string
  priority: AppealPriority
  department: string
  executor: string
  dueDate: string
  notifyCitizen: boolean
}

const DUE_DAYS: Partial<Record<AppealTopic, number>> = { billing: 30, contract: 30 }

interface NewAppealDialogProps {
  citizen: CitizenDetails
  open: boolean
  onClose: () => void
}

export function NewAppealDialog({ citizen, open, onClose }: NewAppealDialogProps) {
  const notify = useNotify()
  const addAppeal = useAddAppeal()
  const form = useForm<AppealDraft>({
    defaultValues: {
      channel: 'phone',
      topic: 'schedule',
      subject: '',
      description: '',
      priority: 'normal',
      department: DEPARTMENTS[0],
      executor: '',
      dueDate: dayjs().add(10, 'day').format(ISO_DATE),
      notifyCitizen: true,
    },
  })

  const topic = useWatch({ control: form.control, name: 'topic' })

  useEffect(() => {
    form.setValue('dueDate', dayjs().add(DUE_DAYS[topic] ?? 10, 'day').format(ISO_DATE))
  }, [form, topic])

  const submit = form.handleSubmit(async ({ notifyCitizen: _notify, ...draft }) => {
    await addAppeal.mutateAsync({
      citizen,
      appeal: {
        ...draft,
        createdAt: dayjs().format('YYYY-MM-DDTHH:mm'),
        status: draft.executor ? 'inProgress' : 'new',
        closedAt: null,
        rating: null,
      },
    })
    notify('Обращение зарегистрировано')
    form.reset()
    onClose()
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Новое обращение</DialogTitle>
      <FormProvider {...form}>
        <FieldModeContext.Provider value={{ editing: true }}>
          <DialogContent dividers>
          <FieldGrid>
            <SelectInput name="channel" label="Канал поступления" span={4} options={recordToOptions(APPEAL_CHANNELS)} required />
            <SelectInput
              name="topic"
              label="Тематика"
              span={8}
              options={recordToOptions(APPEAL_TOPICS)}
              required
            />
            <TextInput name="subject" label="Краткое содержание" span={12} required />
            <TextInput name="description" label="Текст обращения" span={12} multiline rows={4} />
            <RadioInput name="priority" label="Приоритет" span={12} options={recordToOptions(APPEAL_PRIORITIES)} />
            <SelectInput name="department" label="Подразделение" span={4} options={DEPARTMENTS} />
            <SelectInput name="executor" label="Исполнитель" span={4} options={EXECUTORS} allowEmpty helperText="Без исполнителя — статус «Новое»" />
            <DateInput name="dueDate" label="Срок ответа" span={4} disablePast required />
            <ToggleInput
              name="notifyCitizen"
              label="Уведомить заявителя о регистрации"
              description={`Через канал «${citizen.preferredChannel}»`}
              span={12}
            />
          </FieldGrid>
          </DialogContent>
        </FieldModeContext.Provider>
      </FormProvider>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="contained" onClick={submit} loading={addAppeal.isPending}>
          Зарегистрировать
        </Button>
      </DialogActions>
    </Dialog>
  )
}
