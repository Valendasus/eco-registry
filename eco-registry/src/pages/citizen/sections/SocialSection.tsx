import { Stack } from '@mui/material'
import { DateInput, FieldGrid, MultiSelectInput, RadioInput, SelectInput, TextInput } from '../../../components/form'
import { SectionCard } from '../../../components/ui/SectionCard'
import { BENEFITS, DISABILITY_GROUPS, PENSION_TYPES } from '../../../entities/citizen/dictionaries'

const COMPENSATION_OPTIONS = [0, 30, 50, 100].map((value) => ({
  value: String(value),
  label: value ? `${value}%` : 'Нет',
}))

export function SocialSection() {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <SectionCard title="Инвалидность и пенсия">
        <FieldGrid>
          <SelectInput name="social.disabilityGroup" label="Группа инвалидности" span={4} options={DISABILITY_GROUPS.slice(1)} allowEmpty />
          <DateInput name="social.disabilityUntil" label="Инвалидность установлена до" span={4} helperText="Пусто — бессрочно" />
          <SelectInput name="social.pensionType" label="Вид пенсии" span={4} options={PENSION_TYPES.slice(1)} allowEmpty />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Меры социальной поддержки" description="Назначаются органами соцзащиты, данные получены по СМЭВ">
        <FieldGrid>
          <MultiSelectInput name="social.benefits" label="Назначенные меры" span={12} options={BENEFITS} />
          <TextInput name="social.certificateNumber" label="Номер удостоверения" span={4} placeholder="МС № 000000" />
          <DateInput name="social.lowIncomeUntil" label="Статус малоимущих до" span={4} />
          <RadioInput
            name="social.compensationPercent"
            label="Компенсация платы за ТКО"
            span={4}
            options={COMPENSATION_OPTIONS}
            numeric
          />
        </FieldGrid>
      </SectionCard>
    </Stack>
  )
}
