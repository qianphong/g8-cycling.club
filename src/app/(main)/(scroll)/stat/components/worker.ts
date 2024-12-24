// This is a module worker, so we can use imports (in the browser too!)
import { pLimit } from 'plimit-lit'
import type { Position } from 'geojson'
import { getDistrict } from '@pxxtech/district'
import { booleanIntersects } from '@turf/turf'
import type {
  CityFeature,
  CityFeatureCollection,
  Cities,
  TrackFeature,
} from '@/types'

const IGNORED_PROVINCE_CODES = [
  '110000', // 北京
  '120000', // 天津
  '310000', // 上海
  '500000', // 重庆
  '710000', // 台湾
  '810000', // 香港
  '810000', // 澳门
]

// 缓存请求和GeoJSON `https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`
const cacheFetch: Record<string, Promise<void>> = {}
const geoJSONMap: Record<string, CityFeatureCollection> = {}
const fetchGeoJSON = async (code: string) => {
  const res = await fetch(`/api/areas/${code}`)
  geoJSONMap[code] = await res.json()
}

// 根据adcode加载GeoJSON
const loadGeoJSON = async (code: string) => {
  if (!geoJSONMap[code]) {
    cacheFetch[code] ??= fetchGeoJSON(code)
    await cacheFetch[code]
  }
  return geoJSONMap[code]
}

const isCityOrSpecialRegion = (adcode: string, level: string) => {
  return level === 'city' || IGNORED_PROVINCE_CODES.includes(adcode)
}

// 获取GeoJSON并向下判断途经城市
const analyseArea = async (
  coordinates: Position[],
  city: CityFeature,
  adcodes: string[],
) => {
  // 判断线路是否经过该城市
  const intersects = booleanIntersects(
    {
      type: 'MultiPoint',
      coordinates,
    },
    city.geometry,
  )
  if (intersects) {
    const { adcode, level, parent } = city.properties
    // 向路线添加途经城市数据直到为市级行政区或者直辖市/特别行政区/台湾省
    if (isCityOrSpecialRegion(adcode.toString(), level)) {
      adcodes.push(adcode?.toString())
    } else {
      await getIntersectingCities(coordinates, adcode, adcodes)
    }
  }
}

const getIntersectingCities = async (
  coordinates: Position[],
  adcode = '100000',
  adcodes: string[] = [],
) => {
  const geoJSON = await loadGeoJSON(adcode)
  await Promise.all(
    geoJSON.features.map(area => analyseArea(coordinates, area, adcodes)),
  )
  return adcodes
}

const limit = pLimit(5)
addEventListener('message', async (event: MessageEvent<TrackFeature[]>) => {
  const city: Cities = {}
  await Promise.all(
    event.data.map(async feature =>
      limit(async () => {
        const adcodes = await getIntersectingCities(
          feature.geometry.coordinates,
        )
        adcodes.forEach(adcode => {
          city[adcode] ??= {
            count: 0,
            adcode,
            name: getDistrict(adcode)?.city?.name || '',
          }
          city[adcode].count += 1
        })
      }),
    ),
  )
  postMessage(city)
})
