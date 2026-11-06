import {
  Autocomplete,
  Checkbox,
  Chip,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import type { ReactNode } from 'react'
import { useController, useFormContext, type RegisterOptions } from 'react-hook-form'
import type { Option } from '../../entities/citizen/dictionaries'
import { dayjs, ISO_DATE } from '../../lib/date'
import { formatDate } from '../../lib/format'
import { applyMask, MASKS, type MaskName } from '../../lib/masks'
import { FieldCell, type SpanProps } from './FieldGrid'
import { useFieldMode } from './FieldMode'
import { ReadOnlyField } from './ReadOnlyField'

interface BaseProps extends SpanProps {
  name: string
  label: string
  rules?: RegisterOptions
  helperText?: ReactNode
  disabled?: boolean
  required?: boolean
}

const normalizeOptions = (options: readonly (Option | string)[]): Option[] =>
  options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option))

function useField({ name, rules, required }: Pick<BaseProps, 'name' | 'rules' | 'required'>) {
  const mergedRules = required && !rules?.required ? { ...rules, required: 'Обязательное поле' } : rules
  const { trigger } = useFormContext()
  const controller = useController({ name, rules: mergedRules })
  const { editing } = useFieldMode()
  const hasError = !!controller.fieldState.error

  const field = {
    ...controller.field,
    onChange: (value: unknown) => {
      controller.field.onChange(value)
      if (hasError) trigger(name)
    },
  }

  return { ...controller, field, editing, error: controller.fieldState.error?.message }
}

interface TextInputProps extends BaseProps {
  mask?: MaskName
  multiline?: boolean
  rows?: number
  type?: 'text' | 'number' | 'email'
  suffix?: string
  placeholder?: string
  formatValue?: (value: string) => ReactNode
}

export function TextInput({ span, label, helperText, disabled, mask, multiline, rows, type = 'text', suffix, placeholder, formatValue, ...base }: TextInputProps) {
  const { field, editing, error } = useField(base)
  const value = field.value ?? ''

  if (!editing) {
    const display = value === '' || value === null ? '' : formatValue ? formatValue(value) : `${value}${suffix ? ` ${suffix}` : ''}`
    return (
      <FieldCell span={span}>
        <ReadOnlyField label={label} value={display} />
      </FieldCell>
    )
  }

  return (
    <FieldCell span={span}>
      <TextField
        {...field}
        value={value}
        onChange={(event) => {
          const raw = event.target.value
          if (mask) field.onChange(applyMask(raw, MASKS[mask]))
          else if (type === 'number') field.onChange(raw === '' ? null : Number(raw))
          else field.onChange(raw)
        }}
        label={label}
        type={type}
        required={base.required}
        disabled={disabled}
        multiline={multiline}
        minRows={rows}
        placeholder={placeholder ?? (mask ? MASKS[mask].replace(/#/g, '_') : undefined)}
        error={!!error}
        helperText={error ?? helperText}
        slotProps={{
          input: suffix ? { endAdornment: <InputAdornment position="end">{suffix}</InputAdornment> } : undefined,
          htmlInput: mask ? { inputMode: 'numeric' } : undefined,
        }}
      />
    </FieldCell>
  )
}

interface SelectInputProps extends BaseProps {
  options: readonly (Option | string)[]
  allowEmpty?: boolean
}

export function SelectInput({ span, label, helperText, disabled, options, allowEmpty, ...base }: SelectInputProps) {
  const { field, editing, error } = useField(base)
  const items = normalizeOptions(options)

  if (!editing) {
    return (
      <FieldCell span={span}>
        <ReadOnlyField label={label} value={items.find((item) => item.value === field.value)?.label ?? field.value} />
      </FieldCell>
    )
  }

  return (
    <FieldCell span={span}>
      <TextField
        {...field}
        value={field.value ?? ''}
        select
        label={label}
        required={base.required}
        disabled={disabled}
        error={!!error}
        helperText={error ?? helperText}
      >
        {allowEmpty && (
          <MenuItem value="">
            <Typography component="em" sx={{ color: 'text.secondary', fontSize: 'inherit' }}>
              Не указано
            </Typography>
          </MenuItem>
        )}
        {items.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>
    </FieldCell>
  )
}

interface DateInputProps extends BaseProps {
  disableFuture?: boolean
  disablePast?: boolean
  views?: ('year' | 'month' | 'day')[]
}

export function DateInput({ span, label, helperText, disabled, disableFuture, disablePast, views, ...base }: DateInputProps) {
  const { field, editing, error } = useField(base)
  const yearOnly = views?.length === 1 && views[0] === 'year'

  if (!editing) {
    return (
      <FieldCell span={span}>
        <ReadOnlyField label={label} value={field.value ? (yearOnly ? dayjs(field.value).year() : formatDate(field.value)) : ''} />
      </FieldCell>
    )
  }

  return (
    <FieldCell span={span}>
      <DatePicker
        label={label}
        value={field.value ? dayjs(field.value) : null}
        onChange={(value) => field.onChange(value?.isValid() ? value.format(ISO_DATE) : '')}
        disabled={disabled}
        disableFuture={disableFuture}
        disablePast={disablePast}
        views={views}
        inputRef={field.ref}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            required: base.required,
            onBlur: field.onBlur,
            error: !!error,
            helperText: error ?? helperText,
          },
        }}
      />
    </FieldCell>
  )
}

interface AutocompleteInputProps extends BaseProps {
  options: readonly string[]
  freeSolo?: boolean
}

export function AutocompleteInput({ span, label, helperText, disabled, options, freeSolo = true, ...base }: AutocompleteInputProps) {
  const { field, editing, error } = useField(base)

  if (!editing) {
    return (
      <FieldCell span={span}>
        <ReadOnlyField label={label} value={field.value} />
      </FieldCell>
    )
  }

  return (
    <FieldCell span={span}>
      <Autocomplete
        freeSolo={freeSolo}
        options={options}
        value={field.value ?? ''}
        disabled={disabled}
        onChange={(_, value) => field.onChange(value ?? '')}
        onInputChange={(_, value, reason) => freeSolo && reason === 'input' && field.onChange(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={field.ref}
            onBlur={field.onBlur}
            label={label}
            required={base.required}
            error={!!error}
            helperText={error ?? helperText}
          />
        )}
      />
    </FieldCell>
  )
}

interface MultiSelectInputProps extends BaseProps {
  options: readonly (Option | string)[]
  limitTags?: number
}

export function MultiSelectInput({ span, label, helperText, disabled, options, limitTags, ...base }: MultiSelectInputProps) {
  const { field, editing, error } = useField(base)
  const items = normalizeOptions(options)
  const value: string[] = field.value ?? []
  const selected = items.filter((item) => value.includes(item.value))

  if (!editing) {
    return (
      <FieldCell span={span}>
        <ReadOnlyField
          label={label}
          value={
            selected.length ? (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.25 }}>
                {selected.map((item) => (
                  <Chip key={item.value} label={item.label} size="small" />
                ))}
              </Stack>
            ) : (
              ''
            )
          }
        />
      </FieldCell>
    )
  }

  return (
    <FieldCell span={span}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        limitTags={limitTags}
        options={items}
        value={selected}
        disabled={disabled}
        isOptionEqualToValue={(option, current) => option.value === current.value}
        getOptionLabel={(option) => option.label}
        onChange={(_, next) => field.onChange(next.map((item) => item.value))}
        renderOption={({ key, ...props }, option, { selected: checked }) => (
          <li key={key} {...props}>
            <Checkbox size="small" checked={checked} sx={{ mr: 1, p: 0.25 }} />
            {option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} inputRef={field.ref} label={label} error={!!error} helperText={error ?? helperText} />
        )}
      />
    </FieldCell>
  )
}

interface ToggleInputProps extends BaseProps {
  description?: string
  variant?: 'switch' | 'checkbox'
}

export function ToggleInput({ span, label, description, disabled, variant = 'switch', ...base }: ToggleInputProps) {
  const { field, editing, error } = useField(base)

  if (!editing) {
    return (
      <FieldCell span={span}>
        <ReadOnlyField label={label} value={field.value ? 'Да' : 'Нет'} />
      </FieldCell>
    )
  }

  const Control = variant === 'switch' ? Switch : Checkbox
  return (
    <FieldCell span={span}>
      <FormControlLabel
        disabled={disabled}
        control={<Control checked={!!field.value} onChange={(event) => field.onChange(event.target.checked)} />}
        label={
          <div>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{label}</Typography>
            {description && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {description}
              </Typography>
            )}
          </div>
        }
        sx={{ alignItems: description ? 'flex-start' : 'center', ml: 0, gap: 1, '& .MuiSwitch-root': { mt: description ? -0.5 : 0 } }}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FieldCell>
  )
}

interface RadioInputProps extends BaseProps {
  options: readonly (Option | string)[]
  numeric?: boolean
}

export function RadioInput({ span, label, disabled, options, numeric, ...base }: RadioInputProps) {
  const { field, editing, error } = useField(base)
  const items = normalizeOptions(options)
  const current = field.value === null || field.value === undefined ? '' : String(field.value)

  if (!editing) {
    return (
      <FieldCell span={span}>
        <ReadOnlyField label={label} value={items.find((item) => item.value === current)?.label} />
      </FieldCell>
    )
  }

  return (
    <FieldCell span={span}>
      <FormLabel sx={{ fontSize: 12 }} error={!!error}>
        {label}
      </FormLabel>
      <RadioGroup
        row
        value={current}
        onChange={(event) => field.onChange(numeric ? Number(event.target.value) : event.target.value)}
      >
        {items.map((item) => (
          <FormControlLabel
            key={item.value}
            value={item.value}
            disabled={disabled}
            control={<Radio size="small" />}
            label={<Typography sx={{ fontSize: 14 }}>{item.label}</Typography>}
          />
        ))}
      </RadioGroup>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FieldCell>
  )
}
