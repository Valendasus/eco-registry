import { Box, Stack, Typography } from '@mui/material'
import { useWatch } from 'react-hook-form'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  DateInput,
  FieldGrid,
  FieldGroupTitle,
  RecordList,
  SelectInput,
  TextInput,
  ToggleInput,
} from '../../../components/form'
import { ChartTooltip } from '../../../components/ui/ChartTooltip'
import { DataTable } from '../../../components/ui/DataTable'
import { SectionCard } from '../../../components/ui/SectionCard'
import {
  ACCRUAL_METHODS,
  HOUSING_TYPES,
  OWNERSHIP_TYPES,
  PAYMENT_METHODS,
  PROPERTY_TYPES,
  RECEIPT_DELIVERY,
} from '../../../entities/citizen/dictionaries'
import type { Payment, Property } from '../../../entities/citizen/types'
import { dayjs } from '../../../lib/date'
import { formatMoney } from '../../../lib/format'
import { useChartPalette } from '../../../lib/useChartPalette'

function PaymentsChart({ payments }: { payments: Payment[] }) {
  const colors = useChartPalette()
  const data = [...payments].reverse().map((payment) => ({
    ...payment,
    label: dayjs(payment.month).format('MMM'),
  }))
  const accrued = payments.reduce((sum, payment) => sum + payment.accrued, 0)
  const paid = payments.reduce((sum, payment) => sum + payment.paid, 0)

  return (
    <Stack sx={{ gap: 2 }}>
      <Stack direction="row" sx={{ gap: 4 }}>
        {[
          ['Начислено за год', formatMoney(accrued), 'text.primary'],
          ['Оплачено', formatMoney(paid), 'success.main'],
          ['Разница', formatMoney(paid - accrued), paid < accrued ? 'error.main' : 'text.primary'],
        ].map(([label, value, color]) => (
          <div key={label}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {label}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 17, color }}>{value}</Typography>
          </div>
        ))}
      </Stack>
      <Box sx={{ height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} barGap={2} margin={{ left: -12, right: 0, top: 4 }}>
            <CartesianGrid vertical={false} stroke={colors.grid} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: colors.text, fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: colors.text, fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: colors.muted }}
              content={<ChartTooltip formatValue={formatMoney} formatLabel={(label) => label} />}
            />
            <Bar dataKey="accrued" name="Начислено" fill={colors.muted} radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="paid" name="Оплачено" fill={colors.primary} radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  )
}

export function AccountSection({ withHistory = true }: { withHistory?: boolean }) {
  const payments: Payment[] = useWatch({ name: 'payments' }) ?? []

  return (
    <Stack sx={{ gap: 2.5 }}>
      <SectionCard title="Договор и объект" description="Публичный договор на оказание услуги по обращению с ТКО">
        <FieldGrid>
          <TextInput name="accountNumber" label="Лицевой счёт" span={4} disabled />
          <TextInput name="account.contractNumber" label="Номер договора" span={4} />
          <DateInput name="account.contractDate" label="Дата договора" span={4} disableFuture />

          <FieldGroupTitle>Жилое помещение</FieldGroupTitle>
          <SelectInput name="account.housingType" label="Тип объекта" span={4} options={HOUSING_TYPES} required />
          <SelectInput name="account.ownership" label="Основание пользования" span={4} options={OWNERSHIP_TYPES} />
          <TextInput name="account.containerSite" label="Контейнерная площадка" span={4} />
          <TextInput name="account.area" label="Площадь" span={3} type="number" suffix="м²" />
          <TextInput name="account.rooms" label="Комнат" span={3} type="number" />
          <TextInput name="account.residentsRegistered" label="Зарегистрировано" span={3} type="number" suffix="чел." />
          <TextInput name="account.residentsActual" label="Проживает фактически" span={3} type="number" suffix="чел." />

          <FieldGroupTitle>Расчёты</FieldGroupTitle>
          <SelectInput name="account.accrualMethod" label="Способ начисления" span={4} options={ACCRUAL_METHODS} />
          <TextInput
            name="account.tariff"
            label="Тариф"
            span={4}
            disabled
            suffix="₽/чел. в мес."
            formatValue={(value) => `${formatMoney(Number(value))} за человека в месяц`}
          />
          <SelectInput name="account.paymentMethod" label="Способ оплаты" span={4} options={PAYMENT_METHODS} />
          <SelectInput name="account.receiptDelivery" label="Доставка квитанций" span={4} options={RECEIPT_DELIVERY} />
          <DateInput name="account.lastPaymentAt" label="Последний платёж" span={4} disableFuture />
          <TextInput
            name="debt"
            label="Задолженность"
            span={4}
            type="number"
            suffix="₽"
            formatValue={(value) => formatMoney(Number(value))}
          />
          <ToggleInput name="account.autopayment" label="Автоплатёж подключён" span={6} />
          <ToggleInput name="account.wasteSorting" label="Участвует в раздельном сборе" span={6} />
        </FieldGrid>
      </SectionCard>

      {withHistory && payments.length > 0 && (
        <SectionCard title="Начисления и оплаты" description="За последние 12 месяцев">
          <PaymentsChart payments={payments} />
        </SectionCard>
      )}

      <SectionCard title="Объекты недвижимости" description="Сведения из ЕГРН">
        <RecordList<Property>
          name="property"
          emptyText="Объекты недвижимости не указаны"
          addLabel="Добавить объект"
          createItem={() => ({ id: crypto.randomUUID(), type: '', cadastralNumber: '', address: '', share: '1', area: 0 })}
          itemTitle={(item, index) => item.type || `Объект ${index + 1}`}
          renderEdit={(index) => (
            <>
              <SelectInput name={`property.${index}.type`} label="Вид объекта" span={4} options={PROPERTY_TYPES} required />
              <TextInput name={`property.${index}.cadastralNumber`} label="Кадастровый номер" span={4} mask="cadastral" />
              <TextInput name={`property.${index}.share`} label="Доля" span={2} />
              <TextInput name={`property.${index}.area`} label="Площадь" span={2} type="number" suffix="м²" />
              <TextInput name={`property.${index}.address`} label="Адрес" span={12} helperText="Пусто — совпадает с адресом регистрации" />
            </>
          )}
          renderView={(items) => (
            <DataTable
              rows={items}
              rowKey={(row) => row.id}
              columns={[
                { key: 'type', title: 'Вид', render: (row) => row.type },
                { key: 'cadastral', title: 'Кадастровый номер', render: (row) => row.cadastralNumber || '—' },
                { key: 'address', title: 'Адрес', render: (row) => row.address || 'По адресу регистрации' },
                { key: 'share', title: 'Доля', align: 'center', render: (row) => row.share },
                { key: 'area', title: 'Площадь', align: 'right', render: (row) => `${row.area} м²` },
              ]}
            />
          )}
        />
      </SectionCard>
    </Stack>
  )
}
