import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import minMax from 'dayjs/plugin/minMax'

dayjs.extend(minMax)
dayjs.locale('ru')

export const ISO_DATE = 'YYYY-MM-DD'

export const today = () => dayjs().startOf('day')

export const toIsoDate = (value: dayjs.ConfigType) => dayjs(value).format(ISO_DATE)

export { dayjs }
