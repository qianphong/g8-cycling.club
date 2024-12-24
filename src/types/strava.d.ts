import { Position } from 'geojson'

export interface PolylineMapResponse {
  id: string
  polyline: string
  summary_polyline: string
}
type SportType =
  | 'AlpineSki'
  | 'BackcountrySki'
  | 'Canoeing'
  | 'Crossfit'
  | 'EBikeRide'
  | 'Elliptical'
  | 'EMountainBikeRide'
  | 'Golf'
  | 'GravelRide'
  | 'Handcycle'
  | 'Hike'
  | 'IceSkate'
  | 'InlineSkate'
  | 'Kayaking'
  | 'Kitesurf'
  | 'MountainBikeRide'
  | 'NordicSki'
  | 'Ride'
  | 'RockClimbing'
  | 'RollerSki'
  | 'Rowing'
  | 'Run'
  | 'Sail'
  | 'Skateboard'
  | 'Snowboard'
  | 'Snowshoe'
  | 'Soccer'
  | 'StairStepper'
  | 'StandUpPaddling'
  | 'Surfing'
  | 'Swim'
  | 'TrailRun'
  | 'Velomobile'
  | 'VirtualRide'
  | 'VirtualRun'
  | 'Walk'
  | 'WeightTraining'
  | 'Wheelchair'
  | 'Windsurf'
  | 'Workout'
  | 'Yoga'

export interface DetailedActivityResponse {
  /** 活动 ID */
  id: string
  athlete: {
    resource_state: number
    firstname: string
    lastname: string
  }
  /** 活动的名称 */
  name: string
  /** 活动的距离，以米为单位 */
  distance?: number
  /** 活动的移动时间，以秒为单位 */
  moving_time?: number
  /** 活动的运行时间，以秒为单位 */
  elapsed_time?: number
  /** 活动的总爬升 */
  total_elevation_gain?: number
  /** 活动的最高海拔，以米为单位 */
  elev_high?: number
  /** 活动的最低海拔，以米为单位 */
  elev_low?: number
  /** 活动类型 */
  sport_type: SportType
  /** 活动开始的时间 */
  start_date: string
  /** 在当地时区开始活动的时间 */
  start_date_local: string
  /** 时区 */
  timezone?: string
  utc_offset?: number
  location_city?: string
  location_state?: string
  location_country?: string
  /** 地图信息 */
  map?: PolylineMapResponse
  /** 此活动是否记录在训练机器上 */
  trainer?: boolean
  /** 此活动是否为通勤 */
  commute?: boolean
  /** 此活动是否为私有活动 */
  private?: boolean
  /** 活动的平均速度（以米/秒为单位） */
  average_speed?: number
  /** 活动的最大速度，以米/秒为单位 */
  max_speed?: number
  /** 活动装备的 ID */
  gear_id?: string
  /** 活动描述 */
  description?: string
  /** 此活动期间消耗的千卡数 */
  calories?: number
  /** 路线起点坐标 */
  start_latlng: Position
  /** 路线终点坐标 */
  end_latlng: Position
}

export interface RefreshTokenResponse {
  token_type: string
  access_token: string
  expires_at: number
  expires_in: number
  refresh_token: string
}
