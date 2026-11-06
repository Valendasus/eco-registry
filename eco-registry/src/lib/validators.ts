import { onlyDigits } from './masks'

export function snilsChecksum(base: string) {
  const sum = base
    .split('')
    .reduce((acc, digit, index) => acc + Number(digit) * (9 - index), 0)
  if (sum < 100) return sum
  if (sum === 100 || sum === 101) return 0
  const rest = sum % 101
  return rest === 100 ? 0 : rest
}

export function isValidSnils(value: string) {
  const digits = onlyDigits(value)
  if (digits.length !== 11) return false
  return snilsChecksum(digits.slice(0, 9)) === Number(digits.slice(9))
}

export function isValidInn(value: string) {
  const digits = onlyDigits(value).split('').map(Number)
  if (digits.length !== 12) return false
  const check = (weights: number[]) =>
    (weights.reduce((sum, weight, index) => sum + weight * digits[index], 0) % 11) % 10
  return (
    check([7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === digits[10] &&
    check([3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === digits[11]
  )
}

export const rules = {
  required: { required: 'Обязательное поле' },
  personName: {
    required: 'Обязательное поле',
    pattern: { value: /^[А-ЯЁа-яё-]+(\s[А-ЯЁа-яё-]+)*$/, message: 'Только кириллица' },
  },
  snils: {
    validate: (value: string) => !value || isValidSnils(value) || 'Неверная контрольная сумма СНИЛС',
  },
  inn: {
    validate: (value: string) => !value || isValidInn(value) || 'Некорректный ИНН',
  },
  email: {
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: 'Некорректный адрес' },
  },
  phone: {
    validate: (value: string) => !value || onlyDigits(value).length === 11 || 'Номер неполный',
  },
}
