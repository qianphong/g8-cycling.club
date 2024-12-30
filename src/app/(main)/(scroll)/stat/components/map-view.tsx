'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AthleteData, Cities, TrackFeature } from '@/types'
import Image from 'next/image'
import { useAtomValue } from 'jotai'
import { isVerifiedAtom } from '@/store'
import { MedalIcon } from 'lucide-react'
import clsx from 'clsx'
import { ScrollArea } from '@/components/ui/scroll-area'
import Ranking from './ranking'

export const MapView: Component<{
  data: AthleteData
}> = ({ data }) => {
  const isVerified = useAtomValue(isVerifiedAtom)
  const map = useRef<AMap.Map | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const polylineLayout = useRef<AMap.Overlay | null>(null)
  const districtLayer = useRef<AMap.Overlay | null>(null)
  const [loading, setLoading] = useState(false)
  const [showStatText, setShowStatText] = useState(false)
  const trackFeatures = useMemo(() => {
    return data.trackFeatures.filter(
      item => item.properties.sport_type === 'Ride',
    )
  }, [data])
  useEffect(() => {
    window._AMapSecurityConfig = {
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
    }
    import('@amap/amap-jsapi-loader').then(AmapLoader => {
      AmapLoader.default
        .load({
          key: process.env.NEXT_PUBLIC_AMAP_KEY!,
          version: '2.0',
          plugins: ['AMap.GeoJSON', 'AMap.DistrictLayer'],
        })
        .then(() => {
          map.current = new AMap.Map('container', {
            zoom: 9,
            // center: [106.9, 32.4],
            mapStyle: 'amap://styles/dark',
            // 解决导出时 canvas 白屏
            // @ts-expect-error
            WebGLParams: {
              preserveDrawingBuffer: true,
            },
          })

          polylineLayout.current = setPolylineLayout(map.current, trackFeatures)
        })
    })
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url))

    return () => {
      map.current?.destroy()
      map.current = null
      workerRef.current?.terminate()
      workerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (workerRef.current) {
      // 使用 web worker分析路线，计算量大放在主线程会卡住
      workerRef.current.onmessage = (event: MessageEvent<Cities>) => {
        data.cities = event.data

        setShowStatText(true)
        districtLayer.current = setDistrictLayer(event.data)
        map.current?.add(districtLayer.current)

        setLoading(false)
      }
    }
    if (map.current) {
      // 删除路线图层
      if (polylineLayout.current) {
        map.current.remove(polylineLayout.current)
        polylineLayout.current = null
      }
      // 如果存在市区图层则删除
      if (districtLayer.current) {
        map.current?.remove(districtLayer.current)
        districtLayer.current = null
        setShowStatText(false)
      }
      // 创建新的路线图层
      polylineLayout.current = setPolylineLayout(map.current, trackFeatures)
    }
  }, [data, trackFeatures])

  const toggleShowDistrictLayer = async () => {
    if (showStatText) {
      setShowStatText(false)
      if (districtLayer.current) {
        map.current?.remove(districtLayer.current)
        districtLayer.current = null
      }
    } else {
      // 如果已缓存则直接显示
      if (data.cities) {
        setShowStatText(true)
        districtLayer.current = setDistrictLayer(data.cities)
        map.current?.add(districtLayer.current)
      } else {
        // 未加载则通过 web worker 处理
        setLoading(true)
        workerRef.current?.postMessage(data.trackFeatures)
      }
    }
  }
  return (
    <div className="h-[600px] relative overflow-hidden">
      <div id="container" className="h-full w-full" />
      {isVerified && (
        <div className={clsx('absolute right-0 transition-top w-80 top-0')}>
          <StatText data={data} />
          <div
            className="h-10 bg-primary bg-opacity-30 rounded-b-5 flex items-center justify-center cursor-pointer"
            onClick={toggleShowDistrictLayer}
          >
            查看去过的城市
          </div>
        </div>
      )}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full z-10 flex itmes-center justify-center bg-white bg-opacity-30">
          <Image src="/disk.svg" width={200} height={200} alt="disk loading" />
        </div>
      )}
    </div>
  )
}

const setPolylineLayout = (map: AMap.Map, data: TrackFeature[]) => {
  if (data.length === 0) return null
  const center = data[data.length - 1].properties.start_latlng
  map.setCenter([center[1], center[0]])

  const layer = new AMap.GeoJSON({
    geoJSON: {
      type: 'FeatureCollection',
      features: data,
    } as any,
    getPolyline(_, path) {
      return new AMap.Polyline({
        path,
        map,
        strokeColor: 'rgb(224,237,94)',
        strokeOpacity: 0.5,
        strokeWeight: 2,
        strokeStyle: 'dashed',
        strokeDasharray: [4, 2],
        zIndex: 9,
      })
    },
  })

  map.add(layer)
  return layer
}

const setDistrictLayer = (city: Cities) => {
  const layer = new AMap.DistrictLayer.Country({
    zIndex: 10,
    zooms: [2, 15],
    SOC: 'CHN',
    depth: 2,
    styles: {
      'nation-stroke': 'rgba(180,180,180,0)',
      'coastline-stroke': 'rgba(180,180,180,0)',
      'province-stroke': 'rgba(180,180,180,0.2)',
      'city-stroke': (props: any) => {
        return city[props.adcode] ? '#FF8F1F' : 'rgba(100,100,100,0.5)'
      },
      'fill': (props: any) => {
        return city[props.adcode]
          ? 'rgba(0,225,255,0.1)'
          : 'rgba(0,225,255,0.0)'
      },
    },
  })
  return layer
}

const StatText: Component<{
  data: AthleteData
}> = ({ data }) => {
  const list = useMemo(() => {
    if (!data.cities) return []
    return Object.values(data.cities).sort((a, b) => b.count - a.count)
  }, [data.cities])
  return (
    <div className=" bg-black bg-opacity-60 border-x border-t border-primary">
      <div className="p-5 flex items-center justify-around text-center">
        <div>
          <div className="text-sm">总运动次数</div>
          <div>
            <span className="text-3xl font-bold text-primary">
              {data.totalRideCount}
            </span>
          </div>
        </div>
        <div>
          <div className="text-sm">去过的城市</div>
          <div>
            <span className="text-3xl font-bold text-primary mr-2">
              {list.length || '?'}
            </span>
          </div>
        </div>
      </div>
      {list.length > 0 && <Ranking data={list} />}
    </div>
  )
}
