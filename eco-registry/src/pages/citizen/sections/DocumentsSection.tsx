import { Stack } from '@mui/material'
import { DateInput, FieldGrid, RecordList, SelectInput, TextInput } from '../../../components/form'
import { DataTable } from '../../../components/ui/DataTable'
import { SectionCard } from '../../../components/ui/SectionCard'
import { ToneChip } from '../../../components/ui/ToneChip'
import { DOCUMENT_TYPES } from '../../../entities/citizen/dictionaries'
import type { ExtraDocument } from '../../../entities/citizen/types'
import { today } from '../../../lib/date'
import { formatDate } from '../../../lib/format'
import { rules } from '../../../lib/validators'

const isExpired = (document: ExtraDocument) => !!document.validUntil && document.validUntil < today().format('YYYY-MM-DD')

export function DocumentsSection() {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <SectionCard title="Паспорт гражданина РФ">
        <FieldGrid>
          <TextInput name="passport.series" label="Серия" span={3} mask="passportSeries" required />
          <TextInput name="passport.number" label="Номер" span={3} mask="passportNumber" required />
          <DateInput name="passport.issuedAt" label="Дата выдачи" span={3} disableFuture required />
          <TextInput name="passport.divisionCode" label="Код подразделения" span={3} mask="divisionCode" />
          <TextInput name="passport.issuedBy" label="Кем выдан" span={12} required />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Идентификаторы">
        <FieldGrid>
          <TextInput name="snils" label="СНИЛС" span={6} mask="snils" rules={rules.snils} required helperText="Проверяется контрольная сумма" />
          <TextInput name="inn" label="ИНН" span={6} mask="inn" rules={rules.inn} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Прочие документы">
        <RecordList<ExtraDocument>
          name="documents"
          emptyText="Дополнительные документы не добавлены"
          addLabel="Добавить документ"
          createItem={() => ({ id: crypto.randomUUID(), type: '', number: '', issuedBy: '', issuedAt: '', validUntil: '' })}
          itemTitle={(item, index) => item.type || `Документ ${index + 1}`}
          renderEdit={(index) => (
            <>
              <SelectInput name={`documents.${index}.type`} label="Тип документа" span={6} options={DOCUMENT_TYPES} required />
              <TextInput name={`documents.${index}.number`} label="Серия и номер" span={6} required />
              <TextInput name={`documents.${index}.issuedBy`} label="Кем выдан" span={6} />
              <DateInput name={`documents.${index}.issuedAt`} label="Дата выдачи" span={3} disableFuture />
              <DateInput name={`documents.${index}.validUntil`} label="Действует до" span={3} />
            </>
          )}
          renderView={(items) => (
            <DataTable
              rows={items}
              rowKey={(row) => row.id}
              columns={[
                { key: 'type', title: 'Документ', render: (row) => row.type },
                { key: 'number', title: 'Номер', render: (row) => row.number },
                { key: 'issuedBy', title: 'Кем выдан', render: (row) => row.issuedBy || '—' },
                { key: 'issuedAt', title: 'Выдан', render: (row) => formatDate(row.issuedAt) },
                {
                  key: 'valid',
                  title: 'Срок действия',
                  render: (row) =>
                    row.validUntil ? (
                      <ToneChip tone={isExpired(row) ? 'error' : 'success'} label={`до ${formatDate(row.validUntil)}`} />
                    ) : (
                      'бессрочно'
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
