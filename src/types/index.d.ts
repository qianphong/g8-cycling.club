import type { DetailedActivityResponse } from './strava'
import type {
  FeatureCollection,
  LineString,
  MultiPolygon,
  Feature,
} from 'geojson'

/**城市信息 [province：省级行政区，city：市级行政区（可省略）] */
export type Cities = Record<
  string,
  {
    adcode: string
    name: string
    count: number
  }
>

/**路线 Feature 的属性 */
type TrackProperties = {
  /**骑行轨迹id */
  id: DetailedActivityResponse['id']
  /**骑行日期 */
  date: string
  /**骑行活动id */
  name: string
  /**本次骑行距离 */
  distance: number
  /**路线途经城市 */
  // cities?: City[]
  /** 路线起点坐标 */
  start_latlng: DetailedActivityResponse['start_latlng']
  /** 路线终点坐标 */
  end_latlng: DetailedActivityResponse['end_latlng']
  /** 路线类型 */
  sport_type: DetailedActivityResponse['sport_type']
}
/**城市 Feature 的属性 */
type CityProperties = {
  /**城市adcode */
  adcode: string
  /**城市名称 */
  name: string
  /**城市等级，Provice：省级行政区，city：市级行政区 */
  level: 'province' | 'city'
  parent: { adcode: string }
}

/**路线 GeoJSON数据 */
export type TrackFeature = Feature<LineString, TrackProperties>
export type TrackFeatureCollection = FeatureCollection<
  LineString,
  TrackProperties
>
/**城市 GeoJSON数据 */
export type CityFeature = Feature<MultiPolygon, CityProperties>
export type CityFeatureCollection = FeatureCollection<
  MultiPolygon,
  CityProperties
>
/**日历数据 */
export interface CalendarInfo {
  value: number
  date: string
}
export interface AthleteBaseData {
  /**累计时长 */
  totalTime: number
  /**累计骑行次数 */
  totalRideCount: number
  /**累计骑行距离 */
  totalRideDistance: number
  /**累计爬升 */
  totalElevationGain: number
  /**最远骑行距离 */
  biggestRideDistance: number
  /**最大爬升 */
  biggestElevationGain: number
}

/**数据统计 */
export interface AthleteData extends AthleteBaseData {
  /**数据年份 */
  year: number
  /**途经城市集合 */
  cities?: Cities
  /**路线集合 */
  trackFeatures: TrackFeature[]
  /**日历图数据 */
  calendarData: CalendarInfo[]
}
