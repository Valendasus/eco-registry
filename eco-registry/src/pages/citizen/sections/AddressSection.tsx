import { Stack } from '@mui/material'
import { useWatch } from 'react-hook-form'
import {
  FieldGrid,
  MultiSelectInput,
  RecordList,
  SelectInput,
  TextInput,
  ToggleInput,
} from '../../../components/form'
import { DataTable } from '../../../components/ui/DataTable'
import { SectionCard } from '../../../components/ui/SectionCard'
import { ToneChip } from '../../../components/ui/ToneChip'
import { MESSENGERS, PHONE_KINDS, PREFERRED_CHANNELS, recordToOptions } from '../../../entities/citizen/dictionaries'
import type { Phone } from '../../../entities/citizen/types'
import { rules } from '../../../lib/validators'

function AddressFields({ prefix }: { prefix: 'registrationAddress' | 'actualAddress' }) {
  return (
    <FieldGrid>
      <TextInput name={`${prefix}.postalCode`} label="Индекс" span={3} mask="postalCode" />
      <TextInput name={`${prefix}.region`} label="Регион" span={5} required />
      <TextInput name={`${prefix}.district`} label="Район" span={4} />
      <TextInput name={`${prefix}.locality`} label="Населённый пункт" span={4} required />
      <TextInput name={`${prefix}.street`} label="Улица" span={8} required />
      <TextInput name={`${prefix}.house`} label="Дом" span={4} required />
      <TextInput name={`${prefix}.building`} label="Корпус / строение" span={4} />
      <TextInput name={`${prefix}.apartment`} label="Квартира" span={4} />
    </FieldGrid>
  )
}

export function AddressSection() {
  const sameAddress = useWatch({ name: 'sameAddress' })

  return (
    <Stack sx={{ gap: 2.5 }}>
      <SectionCard title="Адрес регистрации">
        <AddressFields prefix="registrationAddress" />
      </SectionCard>

      <SectionCard title="Фактический адрес" description="Используется для расчёта по месту оказания услуги">
        <FieldGrid>
          <ToggleInput name="sameAddress" label="Совпадает с адресом регистрации" span={12} />
        </FieldGrid>
        {!sameAddress && (
          <Stack sx={{ mt: 2 }}>
            <AddressFields prefix="actualAddress" />
          </Stack>
        )}
      </SectionCard>
    </Stack>
  )
}

export function ContactsSection() {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <SectionCard title="Телефоны">
        <RecordList<Phone>
          name="phones"
          emptyText="Телефоны не указаны"
          addLabel="Добавить телефон"
          createItem={() => ({ id: crypto.randomUUID(), kind: 'mobile', number: '', primary: false })}
          itemTitle={(item) => PHONE_KINDS[item.kind]}
          renderEdit={(index) => (
            <>
              <SelectInput name={`phones.${index}.kind`} label="Тип" span={3} options={recordToOptions(PHONE_KINDS)} />
              <TextInput name={`phones.${index}.number`} label="Номер" span={5} mask="phone" rules={rules.phone} required />
              <ToggleInput name={`phones.${index}.primary`} label="Основной" span={4} variant="checkbox" />
            </>
          )}
          renderView={(items) => (
            <DataTable
              rows={items}
              rowKey={(row) => row.id}
              columns={[
                { key: 'kind', title: 'Тип', width: 160, render: (row) => PHONE_KINDS[row.kind] },
                { key: 'number', title: 'Номер', render: (row) => row.number },
                {
                  key: 'primary',
                  title: '',
                  align: 'right',
                  render: (row) => (row.primary ? <ToneChip tone="primary" label="Основной" /> : null),
                },
              ]}
            />
          )}
        />
      </SectionCard>

      <SectionCard title="Каналы связи и согласия">
        <FieldGrid>
          <TextInput name="email" label="Электронная почта" span={6} type="email" rules={rules.email} />
          <SelectInput name="preferredChannel" label="Предпочтительный способ связи" span={6} options={PREFERRED_CHANNELS} />
          <MultiSelectInput name="messengers" label="Мессенджеры" span={12} options={MESSENGERS} />
          <ToggleInput
            name="consentPersonalData"
            label="Согласие на обработку персональных данных"
            description="152-ФЗ, подписано при постановке на учёт"
            span={6}
          />
          <ToggleInput
            name="consentNotifications"
            label="Согласие на информационные рассылки"
            description="Напоминания об оплате и изменениях графика"
            span={6}
          />
        </FieldGrid>
      </SectionCard>
    </Stack>
  )
}
