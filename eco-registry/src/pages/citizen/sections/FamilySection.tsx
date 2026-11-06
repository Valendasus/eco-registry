import { Stack } from '@mui/material'
import { DateInput, RecordList, SelectInput, TextInput, ToggleInput } from '../../../components/form'
import { DataTable } from '../../../components/ui/DataTable'
import { SectionCard } from '../../../components/ui/SectionCard'
import { ToneChip } from '../../../components/ui/ToneChip'
import { RELATIONS } from '../../../entities/citizen/dictionaries'
import type { FamilyMember } from '../../../entities/citizen/types'
import { formatAge, formatDate } from '../../../lib/format'

export function FamilySection() {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <SectionCard
        title="Члены семьи"
        description="Совместно проживающие учитываются при начислении платы по количеству жильцов"
      >
        <RecordList<FamilyMember>
          name="family"
          emptyText="Члены семьи не указаны"
          addLabel="Добавить члена семьи"
          createItem={() => ({
            id: crypto.randomUUID(),
            relation: '',
            fullName: '',
            birthDate: '',
            livesTogether: true,
            dependent: false,
          })}
          itemTitle={(item, index) => item.fullName || `Член семьи ${index + 1}`}
          renderEdit={(index) => (
            <>
              <SelectInput name={`family.${index}.relation`} label="Степень родства" span={4} options={RELATIONS} required />
              <TextInput name={`family.${index}.fullName`} label="ФИО" span={5} required />
              <DateInput name={`family.${index}.birthDate`} label="Дата рождения" span={3} disableFuture />
              <ToggleInput name={`family.${index}.livesTogether`} label="Проживает совместно" span={6} variant="checkbox" />
              <ToggleInput name={`family.${index}.dependent`} label="На иждивении" span={6} variant="checkbox" />
            </>
          )}
          renderView={(items) => (
            <DataTable
              rows={items}
              rowKey={(row) => row.id}
              columns={[
                { key: 'relation', title: 'Родство', width: 140, render: (row) => row.relation },
                { key: 'fullName', title: 'ФИО', render: (row) => row.fullName },
                {
                  key: 'birthDate',
                  title: 'Дата рождения',
                  render: (row) => (row.birthDate ? `${formatDate(row.birthDate)} (${formatAge(row.birthDate)})` : '—'),
                },
                {
                  key: 'flags',
                  title: 'Отметки',
                  align: 'right',
                  render: (row) => (
                    <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'flex-end' }}>
                      <ToneChip tone={row.livesTogether ? 'success' : 'default'} label={row.livesTogether ? 'Совместно' : 'Отдельно'} />
                      {row.dependent && <ToneChip tone="info" label="Иждивенец" />}
                    </Stack>
                  ),
                },
              ]}
            />
          )}
        />
      </SectionCard>
    </Stack>
  )
}
