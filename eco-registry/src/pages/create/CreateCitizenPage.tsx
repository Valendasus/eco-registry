import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import {
  Box,
  Button,
  Card,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useCreateCitizen } from '../../api/hooks'
import { FieldModeContext } from '../../components/form'
import { useNotify } from '../../components/ui/notify'
import { PageHeader } from '../../components/ui/PageHeader'
import { createEmptyCitizen } from '../../entities/citizen/factory'
import type { CitizenDetails } from '../../entities/citizen/types'
import { WIZARD_STEPS } from './steps'

const DRAFT_KEY = 'eco-registry.draft'

function readDraft(): CitizenDetails {
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    return saved ? { ...createEmptyCitizen(), ...JSON.parse(saved) } : createEmptyCitizen()
  } catch {
    return createEmptyCitizen()
  }
}

export function CreateCitizenPage() {
  const theme = useTheme()
  const compact = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const notify = useNotify()
  const create = useCreateCitizen()
  const [active, setActive] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [initialValues] = useState(readDraft)
  const form = useForm<CitizenDetails>({ defaultValues: initialValues, mode: 'onTouched' })

  useEffect(() => {
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
        } catch {
          return
        }
      },
    })
  }, [form])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [active])

  const step = WIZARD_STEPS[active]
  const last = active === WIZARD_STEPS.length - 1

  const validateStep = async (index: number) => {
    const valid = await form.trigger(WIZARD_STEPS[index].fields, { shouldFocus: true })
    setCompleted((current) => {
      const next = new Set(current)
      if (valid) next.add(index)
      else next.delete(index)
      return next
    })
    return valid
  }

  const goTo = async (index: number) => {
    if (index > active && !(await validateStep(active))) return
    setActive(index)
  }

  const finish = form.handleSubmit(
    async (values) => {
      const citizen = await create.mutateAsync(values)
      localStorage.removeItem(DRAFT_KEY)
      notify(`Карточка ${citizen.regNumber} создана`)
      navigate(`/citizens/${citizen.id}`)
    },
    () => notify('Проверьте обязательные поля на предыдущих шагах', 'error'),
  )

  const resetDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    form.reset(createEmptyCitizen())
    setCompleted(new Set())
    setActive(0)
  }

  return (
    <FormProvider {...form}>
      <FieldModeContext.Provider value={{ editing: true }}>
        <PageHeader
          title="Новый гражданин"
          subtitle="Постановка на учёт и открытие лицевого счёта ТКО. Черновик сохраняется автоматически."
          breadcrumbs={[
            { label: 'Главная', to: '/' },
            { label: 'Картотека', to: '/citizens' },
            { label: 'Новая карточка' },
          ]}
          actions={
            <Button color="inherit" onClick={resetDraft}>
              Очистить форму
            </Button>
          }
        />

        <Card sx={{ p: { xs: 2, md: 3 }, mb: 2.5 }}>
          <Stepper nonLinear activeStep={active} alternativeLabel={!compact} orientation="horizontal">
            {WIZARD_STEPS.map((item, index) => (
              <Step key={item.title} completed={completed.has(index) && index !== active}>
                <StepButton onClick={() => goTo(index)} sx={{ py: 0 }}>
                  <StepLabel optional={!compact && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.caption}</Typography>}>
                    {compact ? (index === active ? item.title : '') : item.title}
                  </StepLabel>
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Card>

        <Box component="form" noValidate onSubmit={(event) => event.preventDefault()} sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Шаг {active + 1} из {WIZARD_STEPS.length}
          </Typography>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {step.title}
          </Typography>

          <Stack sx={{ gap: 2.5 }}>{step.content}</Stack>

          <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 3 }}>
            <Button
              color="inherit"
              startIcon={<ArrowBackRoundedIcon />}
              disabled={active === 0}
              onClick={() => setActive(active - 1)}
            >
              Назад
            </Button>
            {last ? (
              <Button variant="contained" size="large" startIcon={<CheckRoundedIcon />} onClick={finish} loading={create.isPending}>
                Создать карточку
              </Button>
            ) : (
              <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={() => goTo(active + 1)}>
                Далее
              </Button>
            )}
          </Stack>
        </Box>
      </FieldModeContext.Provider>
    </FormProvider>
  )
}
