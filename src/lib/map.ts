import gcoord from 'gcoord'
import { decode } from '@mapbox/polyline'
import type { DetailedActivityResponse } from '@/types/strava'
import type { Position } from 'geojson'

// Feature 的 path
export const pathForFeature = (
  activity: DetailedActivityResponse,
): Position[] => {
  if (!activity.map?.summary_polyline) return []
  try {
    const c = decode(activity.map.summary_polyline)
    // return c.map(arr => [arr[1], arr[0]])
    return c.map(arr =>
      gcoord.transform([arr[1], arr[0]], gcoord.WGS84, gcoord.GCJ02),
    )
  } catch (err) {
    return []
  }
}
// 生成TrackFeatureCollection
// export const generateTrackFeatureCollection = (
//   activities: DetailedActivityResponse[],
// ): TrackFeatureCollection => {
//   return {
//     type: 'FeatureCollection',
//     features: activities.map(activity => {
//       return buildTrackFeature(activity)
//     }),
//   }
// }
