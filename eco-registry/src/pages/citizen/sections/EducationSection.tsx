import { Box, Stack, Typography } from '@mui/material'
import {
  AutocompleteInput,
  DateInput,
  FieldGrid,
  RecordList,
  SelectInput,
  TextInput,
} from '../../../components/form'
import { DataTable } from '../../../components/ui/DataTable'
import { SectionCard } from '../../../components/ui/SectionCard'
import {
  EDUCATION_FORMS,
  EDUCATION_LEVELS,
  EMPLOYMENT_STATUSES,
  INSTITUTIONS,
  ORGANIZATIONS,
  POSITIONS,
  SPECIALITIES,
} from '../../../entities/citizen/dictionaries'
import type { Education, Job } from '../../../entities/citizen/types'
import { dayjs } from '../../../lib/date'
import { formatMoney } from '../../../lib/format'

const period = (job: Job) =>
  `${dayjs(job.from).format('MMM YYYY')} — ${job.to ? dayjs(job.to).format('MMM YYYY') : 'по настоящее время'}`

export function EducationSection() {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <SectionCard title="Образование">
        <RecordList<Education>
          name="education"
          emptyText="Сведений об образовании нет"
          addLabel="Добавить образование"
          createItem={() => ({ id: crypto.randomUUID(), level: '', institution: '', speciality: '', form: 'Очная', graduationYear: null })}
          itemTitle={(item, index) => item.level || `Образование ${index + 1}`}
          renderEdit={(index) => (
            <>
              <SelectInput name={`education.${index}.level`} label="Уровень" span={6} options={EDUCATION_LEVELS} required />
              <SelectInput name={`education.${index}.form`} label="Форма обучения" span={3} options={EDUCATION_FORMS} />
              <TextInput name={`education.${index}.graduationYear`} label="Год окончания" span={3} type="number" />
              <AutocompleteInput name={`education.${index}.institution`} label="Учебное заведение" span={6} options={INSTITUTIONS} />
              <AutocompleteInput name={`education.${index}.speciality`} label="Специальность" span={6} options={SPECIALITIES} />
            </>
          )}
          renderView={(items) => (
            <Stack sx={{ gap: 0 }}>
              {items.map((item, index) => (
                <Stack key={item.id} direction="row" sx={{ gap: 2 }}>
                  <Stack sx={{ alignItems: 'center', pt: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    {index < items.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5 }} />}
                  </Stack>
                  <Box sx={{ pb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.level}
                      {item.graduationYear && (
                        <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                          {item.graduationYear}
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="body2">{item.institution}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {[item.speciality, item.form && `${item.form.toLowerCase()} форма`].filter(Boolean).join(' · ')}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
        />
      </SectionCard>

      <SectionCard title="Текущая занятость">
        <FieldGrid>
          <SelectInput name="employment.status" label="Статус занятости" span={4} options={EMPLOYMENT_STATUSES} />
          <AutocompleteInput name="employment.organization" label="Организация" span={8} options={ORGANIZATIONS} />
          <AutocompleteInput name="employment.position" label="Должность" span={4} options={POSITIONS} />
          <DateInput name="employment.since" label="Работает с" span={4} disableFuture />
          <TextInput
            name="employment.income"
            label="Среднемесячный доход"
            span={4}
            type="number"
            suffix="₽"
            formatValue={(value) => formatMoney(Number(value))}
            helperText="Для расчёта субсидии"
          />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Трудовая деятельность">
        <RecordList<Job>
          name="workHistory"
          emptyText="Записей о трудовой деятельности нет"
          addLabel="Добавить место работы"
          createItem={() => ({ id: crypto.randomUUID(), organization: '', position: '', from: '', to: '' })}
          itemTitle={(item, index) => item.organization || `Место работы ${index + 1}`}
          renderEdit={(index) => (
            <>
              <AutocompleteInput name={`workHistory.${index}.organization`} label="Организация" span={6} options={ORGANIZATIONS} required />
              <AutocompleteInput name={`workHistory.${index}.position`} label="Должность" span={6} options={POSITIONS} />
              <DateInput name={`workHistory.${index}.from`} label="Начало" span={6} views={['year', 'month']} disableFuture />
              <DateInput name={`workHistory.${index}.to`} label="Окончание" span={6} views={['year', 'month']} helperText="Пусто — работает сейчас" />
            </>
          )}
          renderView={(items) => (
            <DataTable
              rows={items}
              rowKey={(row) => row.id}
              columns={[
                { key: 'organization', title: 'Организация', render: (row) => row.organization },
                { key: 'position', title: 'Должность', render: (row) => row.position || '—' },
                { key: 'period', title: 'Период', render: period },
              ]}
            />
          )}
        />
      </SectionCard>
    </Stack>
  )
}
