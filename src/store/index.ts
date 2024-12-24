import { AthleteData } from '@/types'
import { atom, createStore } from 'jotai'
import { formatDate, getDayOfYear, getDaysInYear } from '@/lib/date'
import { pathForFeature } from '@/lib/map'
import { CalendarInfo } from '@/types'
import { DetailedActivityResponse } from '@/types/strava'

// 定义用于存储历史数据
const history = new Map<number, AthleteData>()

export const store = createStore()
// 定义是否已验证用户
export const isVerifiedAtom = atom(false)
// 定义用于存储年份的 atom
export const yearAtom = atom<number>()
// 加载状态
export const loadingAtom = atom(false)
// 错误状态
export const errorAtom = atom('')
// 定义用于管理按年份获取数据的 atom
export const dataAtom = atom(get => {
  const year = get(yearAtom)
  if (!year) return
  return history.get(year)
})
export const getData = async (year: number) => {
  if (!year) return

  // 如果有该年份的历史数据，则不需要重新获取
  if (history.get(year)) {
    store.set(yearAtom, year)
    return
  }

  // 设置加载状态为 true
  store.set(loadingAtom, true)
  // 设置错误状态为空
  store.set(errorAtom, '')
  // 异步获取数据
  const response = await fetch(`/api/activities?year=${year}`)
  const data: { message: string; success: boolean; data: any } =
    await response.json()
  if (data.success) {
    // 将数据保存到 historyAtom 中
    history.set(year, generateData(year, data.data))
    // 关闭加载状态
    store.set(loadingAtom, false)
    store.set(yearAtom, year)
  } else {
    store.set(loadingAtom, false)
    store.set(errorAtom, data.message || '获取数据失败')
  }
}
// 生成数据
function generateData(year: number, activities: DetailedActivityResponse[]) {
  const yearData: AthleteData = {
    year,
    trackFeatures: [],
    calendarData: buildYearArray(year),
    totalTime: 0,
    totalRideCount: 0,
    totalRideDistance: 0,
    totalElevationGain: 0,
    biggestElevationGain: 0,
    biggestRideDistance: 0,
  }
  activities.forEach(item => {
    if (!['VirtualRide', 'Ride'].includes(item.sport_type)) return
    // 重置时间，删除时分秒  避免因为时区不同日期计算错误
    item.start_date_local = item.start_date_local.split('T')[0]

    // 本次活动距离（km） m -> km，保留两位小数
    const distance = Math.round((item.distance || 0) / 10) / 100
    // 本次活动爬升
    const total_elevation_gain = item.total_elevation_gain || 0
    // 存储路线轨迹，根据活动生成 LineString Feature
    if (item.map?.summary_polyline) {
      yearData.trackFeatures.push({
        type: 'Feature',
        properties: {
          id: item.id,
          name: item.name,
          date: item.start_date_local,
          distance: distance,
          end_latlng: item.end_latlng,
          start_latlng: item.start_latlng,
          sport_type: item.sport_type,
        },
        geometry: {
          type: 'LineString',
          coordinates: pathForFeature(item),
        },
      })
    }

    // 当日距离累加当日数据
    const data = yearData.calendarData[getDayOfYear(item.start_date_local) - 1]
    // 距离累加
    data.value += distance
    // 骑行次数
    yearData.totalRideCount += 1
    // 累计距离
    yearData.totalRideDistance += distance
    // 累计爬升
    yearData.totalElevationGain += total_elevation_gain
    // 累计时长
    yearData.totalTime += item.moving_time || 0
    // 最远距离
    if (yearData.biggestRideDistance < distance) {
      yearData.biggestRideDistance = distance
    }
    // 最大爬升
    if (yearData.biggestElevationGain < total_elevation_gain) {
      yearData.biggestElevationGain = total_elevation_gain
    }
  })
  return yearData
  // const summary: AthleteBaseData = {
  //   totalTime: 0,
  //   totalRideCount: 0,
  //   totalRideDistance: 0,
  //   totalElevationGain: 0,
  //   biggestRideDistance: 0,
  //   biggestElevationGain: 0,
  // }

  // const data = Object.values(datas).sort((a, b) => b.year - a.year)
  // data.reduce((prev, curr) => {
  //   prev.totalElevationGain += curr.totalElevationGain
  //   prev.totalTime += curr.totalTime
  //   prev.totalRideCount += curr.totalRideCount
  //   prev.totalRideDistance += curr.totalRideDistance
  //   // 最远距离
  //   if (prev.biggestRideDistance < curr.biggestRideDistance) {
  //     prev.biggestRideDistance = curr.biggestRideDistance
  //   }
  //   // 最大爬升
  //   if (prev.biggestElevationGain < curr.biggestElevationGain) {
  //     prev.biggestElevationGain = curr.biggestElevationGain
  //   }
  //   return prev
  // }, summary)
  // {
  //   data,
  //   summary,
  // }
}

// 创建默认日历数据
function buildYearArray(year: number) {
  return Array.from<unknown, CalendarInfo>(
    { length: getDaysInYear(year) },
    (_, index) => {
      return {
        value: 0,
        level: 0,
        date: formatDate(new Date(year, 0, index + 1)),
      }
    },
  )
}
