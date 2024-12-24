import dayjs, { ConfigType } from 'dayjs'
import dayOfYearPlugin from 'dayjs/plugin/dayOfYear'
dayjs.extend(dayOfYearPlugin)

/**
 * 获取日期在当年是第几天
 * @param date 日期
 * @returns 日期一年第几天
 */
export function getDayOfYear(date: ConfigType) {
  return dayjs(date).dayOfYear()
}

/**
 * 获取一年有多少天
 * @param year 年
 * @returns 一年多少天
 */
export function getDaysInYear(year: number) {
  const endOfYear = dayjs(`${year}-12-31`)
  const startOfYear = dayjs(`${year}-01-01`)
  // 计算天数
  return endOfYear.diff(startOfYear, 'day') + 1
}

/**
 * 获取是第几周
 * @param date 日期
 * @returns
 */
export function getWeekNumber(date: ConfigType) {
  // 当年第一天星期几
  const yearStartDay = getDayOfWeek(dayjs(date).startOf('year'))
  // 计算第几周
  return Math.ceil((yearStartDay + getDayOfYear(date)) / 7)
}

/**
 * 格式化日期
 * @param date 日期
 * @returns 格式化的日期
 */
export function formatDate(date: ConfigType, template = 'YYYY-MM-DD') {
  return dayjs(date).format(template)
}

/**
 * 获取日期周几
 * @param date 日期
 * @returns 周几
 */
export function getDayOfWeek(date: ConfigType) {
  return dayjs(date).get('day')
}

/**
 * 获取某个时间段的时间戳
 * @param start
 * @param end
 * @returns 返回时间戳
 */
export function getUnixTimestamps(start: string, end: string) {
  const after = dayjs(start).unix().toString()
  const before = dayjs(end).unix().toString()

  return { after, before }
}
