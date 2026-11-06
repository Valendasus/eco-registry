import { Stack } from '@mui/material'
import { useWatch } from 'react-hook-form'
import {
  AutocompleteInput,
  DateInput,
  FieldGrid,
  MultiSelectInput,
  RadioInput,
  SelectInput,
  TextInput,
} from '../../../components/form'
import { SectionCard } from '../../../components/ui/SectionCard'
import {
  CITIZEN_STATUSES,
  CITIZENSHIPS,
  DISTRICTS,
  GENDERS,
  MARITAL_STATUSES,
  recordToOptions,
  SOCIAL_CATEGORIES,
} from '../../../entities/citizen/dictionaries'
import { rules } from '../../../lib/validators'

const LOCALITIES = DISTRICTS.flatMap((district) => district.localities)

export function PersonalSection({ withAccounting = true }: { withAccounting?: boolean }) {
  const districtId = useWatch({ name: 'districtId' })
  const localities = DISTRICTS.find((district) => district.value === districtId)?.localities ?? LOCALITIES

  return (
    <Stack sx={{ gap: 2.5 }}>
      <SectionCard title="Личные данные" description="Сведения из документа, удостоверяющего личность">
        <FieldGrid>
          <TextInput name="lastName" label="Фамилия" span={4} rules={rules.personName} required />
          <TextInput name="firstName" label="Имя" span={4} rules={rules.personName} required />
          <TextInput name="middleName" label="Отчество" span={4} helperText="Если есть" />
          <DateInput name="birthDate" label="Дата рождения" span={4} disableFuture required />
          <TextInput name="birthPlace" label="Место рождения" span={8} />
          <RadioInput name="gender" label="Пол" span={4} options={recordToOptions(GENDERS)} required />
          <SelectInput name="citizenship" label="Гражданство" span={4} options={CITIZENSHIPS} />
          <SelectInput name="maritalStatus" label="Семейное положение" span={4} options={MARITAL_STATUSES} allowEmpty />
        </FieldGrid>
      </SectionCard>

      {withAccounting && (
        <SectionCard title="Учёт в реестре" description="Привязка к территории и льготные категории">
          <FieldGrid>
            <SelectInput name="status" label="Статус учёта" span={4} options={recordToOptions(CITIZEN_STATUSES)} required />
            <SelectInput
              name="districtId"
              label="Муниципальное образование"
              span={4}
              options={DISTRICTS.map(({ value, label }) => ({ value, label }))}
              required
            />
            <AutocompleteInput name="locality" label="Населённый пункт" span={4} options={localities} required />
            <MultiSelectInput
              name="categories"
              label="Льготные категории"
              span={12}
              options={recordToOptions(SOCIAL_CATEGORIES)}
              helperText="Влияют на размер компенсации за вывоз ТКО"
            />
            <TextInput name="notes" label="Примечание оператора" span={12} multiline rows={3} />
          </FieldGrid>
        </SectionCard>
      )}
    </Stack>
  )
}
