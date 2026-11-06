import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import { Badge, Box, Button, Card, Skeleton, Stack, Tab, Tabs } from '@mui/material'
import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useParams, useSearchParams } from 'react-router'
import { useCitizen, useSaveCitizen } from '../../api/hooks'
import { FieldModeContext } from '../../components/form'
import { EmptyState } from '../../components/ui/EmptyState'
import { useNotify } from '../../components/ui/notify'
import { PageHeader } from '../../components/ui/PageHeader'
import type { CitizenDetails } from '../../entities/citizen/types'
import { shortName } from '../../lib/format'
import { CitizenHeader } from './CitizenHeader'
import { AccountSection } from './sections/AccountSection'
import { AddressSection, ContactsSection } from './sections/AddressSection'
import { AppealsSection } from './sections/AppealsSection'
import { DocumentsSection } from './sections/DocumentsSection'
import { EducationSection } from './sections/EducationSection'
import { FamilySection } from './sections/FamilySection'
import { HistorySection } from './sections/HistorySection'
import { PersonalSection } from './sections/PersonalSection'
import { SocialSection } from './sections/SocialSection'
import { CITIZEN_TABS, tabsWithErrors, type CitizenTab } from './tabs'

const READ_ONLY_TABS: CitizenTab[] = ['appeals', 'history']

export function CitizenPage() {
  const id = Number(useParams().id)
  const { data: citizen, isLoading, isError } = useCitizen(Number.isInteger(id) ? id : null)

  if (isLoading) {
    return (
      <Stack sx={{ gap: 2.5, pt: 1 }}>
        <Skeleton width={260} height={40} />
        <Skeleton variant="rounded" height={260} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rounded" height={48} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
      </Stack>
    )
  }

  if (isError || !citizen) {
    return (
      <EmptyState
        icon={<PersonOffOutlinedIcon sx={{ fontSize: 48, opacity: 0.5 }} />}
        title="Карточка не найдена"
        description="Проверьте номер или вернитесь в картотеку"
        action={
          <Button component={Link} to="/citizens" variant="contained" sx={{ mt: 1 }}>
            В картотеку
          </Button>
        }
      />
    )
  }

  return <CitizenCard citizen={citizen} />
}

function CitizenCard({ citizen }: { citizen: CitizenDetails }) {
  const notify = useNotify()
  const save = useSaveCitizen()
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const form = useForm<CitizenDetails>({ defaultValues: citizen, mode: 'onTouched' })

  const tabParam = params.get('tab') as CitizenTab | null
  const tab: CitizenTab = CITIZEN_TABS.some((item) => item.id === tabParam) ? tabParam! : 'main'
  const errorTabs = tabsWithErrors(form.formState.errors)

  useEffect(() => {
    if (!editing) form.reset(citizen)
  }, [citizen, editing, form])

  const setTab = (next: CitizenTab) =>
    setParams(next === 'main' ? {} : { tab: next }, { replace: true })

  const startEditing = () => {
    setEditing(true)
    if (READ_ONLY_TABS.includes(tab)) setTab('main')
  }

  const cancel = () => {
    form.reset(citizen)
    setEditing(false)
  }

  const submit = form.handleSubmit(
    async (values) => {
      await save.mutateAsync(values)
      setEditing(false)
      notify('Изменения сохранены')
    },
    (errors) => {
      const [first] = tabsWithErrors(errors)
      if (first) setTab(first)
      notify('Не все поля заполнены корректно', 'error')
    },
  )

  const sections: Record<CitizenTab, ReactNode> = {
    main: <PersonalSection />,
    documents: <DocumentsSection />,
    address: <AddressSection />,
    contacts: <ContactsSection />,
    family: <FamilySection />,
    education: <EducationSection />,
    social: <SocialSection />,
    account: <AccountSection />,
    appeals: <AppealsSection citizen={citizen} />,
    history: <HistorySection citizen={citizen} />,
  }

  const actions = editing ? (
    <>
      <Button color="inherit" onClick={cancel} disabled={save.isPending}>
        Отмена
      </Button>
      <Button variant="contained" onClick={submit} loading={save.isPending} disabled={!form.formState.isDirty}>
        Сохранить
      </Button>
    </>
  ) : (
    <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={startEditing}>
      Редактировать
    </Button>
  )

  return (
    <FormProvider {...form}>
      <FieldModeContext.Provider value={{ editing }}>
        <PageHeader
          title="Карточка гражданина"
          breadcrumbs={[
            { label: 'Главная', to: '/' },
            { label: 'Картотека', to: '/citizens' },
            { label: shortName(citizen) },
          ]}
        />

        <CitizenHeader citizen={citizen} actions={actions} />

        <Card sx={{ mb: 2.5, px: 2.5, position: 'sticky', top: 68, zIndex: 5 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            {CITIZEN_TABS.map((item) => (
              <Tab
                key={item.id}
                value={item.id}
                disabled={editing && READ_ONLY_TABS.includes(item.id)}
                label={
                  <Badge color="error" variant="dot" invisible={!errorTabs.has(item.id)} sx={{ pr: errorTabs.has(item.id) ? 1 : 0 }}>
                    {item.id === 'appeals' ? `${item.label} · ${citizen.appeals.length}` : item.label}
                  </Badge>
                }
              />
            ))}
          </Tabs>
        </Card>

        <Box component="form" onSubmit={submit} noValidate>
          {sections[tab]}
        </Box>
      </FieldModeContext.Provider>
    </FormProvider>
  )
}
