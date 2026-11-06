export const MASKS = {
  phone: '+7 (###) ###-##-##',
  snils: '###-###-### ##',
  inn: '############',
  passportSeries: '## ##',
  passportNumber: '######',
  divisionCode: '###-###',
  postalCode: '######',
  cadastral: '##:##:#######:####',
} as const

export type MaskName = keyof typeof MASKS

export const onlyDigits = (value: string) => value.replace(/\D/g, '')

export function applyMask(value: string, pattern: string) {
  const fixedPrefix = pattern.startsWith('+7') ? '7' : ''
  let source = onlyDigits(value)
  if (fixedPrefix && source.startsWith(fixedPrefix)) source = source.slice(1)
  if (fixedPrefix && source.startsWith('8') && source.length > 10) source = source.slice(1)

  let result = ''
  let index = 0
  for (const char of pattern) {
    if (index >= source.length) break
    if (char === '#') {
      result += source[index++]
    } else {
      result += char
    }
  }
  return result
}

export const isMaskComplete = (value: string, pattern: string) =>
  onlyDigits(value).length === onlyDigits(pattern.replace(/#/g, '0')).length
