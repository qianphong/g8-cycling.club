'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AthleteData, Cities, TrackFeature } from '@/types'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { FullscreenIcon } from 'lucide-react'

export const MapView: Component<{
  data: AthleteData
}> = ({ data }) => {
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

  const [fullscreen, setFullscreen] = useState(false)
  return (
    <div className="h-[600px]">
      <motion.div
        animate={fullscreen ? 'full' : 'exit'}
        initial="exit"
        className="relative h-full w-full left-0 top-0 z-10 overflow-hidden"
        variants={{
          full: {
            position: 'absolute',
          },
          exit: {
            position: 'relative',
          },
        }}
      >
        <div id="container" className="h-full w-full" />
        <div className="absolute left-5 top-5">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setFullscreen(full => !full)}
          >
            <FullscreenIcon />
          </Button>
        </div>
        <div className="absolute right-5 top-5">
          <Button onClick={toggleShowDistrictLayer}>我的足迹</Button>
        </div>
        {showStatText && (
          <div className="absolute right-0 bottom-0 text-right">
            <StatText data={data} />
          </div>
        )}
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full z-10 flex itmes-center justify-center bg-white bg-opacity-30">
            <Image
              src="/disk.svg"
              width={200}
              height={200}
              alt="disk loading"
            />
          </div>
        )}
      </motion.div>
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

const variants: Variants = {
  show: {
    y: 0,
    opacity: 1,
  },
  hidden: {
    y: 50,
    opacity: 0,
  },
}

const StatText: Component<{
  data: AthleteData
}> = ({ data }) => {
  const list = useMemo(() => {
    if (!data.cities) return []
    return Object.values(data.cities).sort((a, b) => b.count - a.count)
  }, [data.cities])
  return (
    <motion.div
      initial={'hidden'}
      animate={'show'}
      variants={{
        show: {
          transition: { staggerChildren: 0.2 },
        },
        hidden: {
          transition: { staggerChildren: 0.2, staggerDirection: -1 },
        },
      }}
      className="text-xl font-bold space-y-3 pointer-events-none p-5"
    >
      {/* <motion.div variants={variants}>
        <span className="text-primary text-4xl font-bold mx-2 underline">
          {data.year}
        </span>
        骑行
        <span className="text-primary text-4xl font-bold mx-2 underline">
          {data.totalRideCount}
        </span>
        次
      </motion.div> */}
      {list.length !== 0 && (
        <>
          <motion.div variants={variants}>
            已累计点亮
            <span className="text-primary text-5xl font-bold mx-2 underline">
              {list.length}
            </span>
            座城市
          </motion.div>
          <motion.div variants={variants}>
            在
            <div className="inline-block relative">
              <span className="text-primary text-3xl font-bold mx-2 border-b border-primary">
                {list[0].name}
              </span>
              <div className="text-primary text-sm font-bold absolute -bottom-5 w-full text-center">
                {list[0].count}次
              </div>
            </div>
            {/* <span className="text-primary text-3xl font-bold mx-2 underline">
              {list[0].name}
            </span> */}
            骑行次数最多
            {/* <span className="text-primary text-3xl font-bold mx-2 underline">
              {list[0].count}
            </span> */}
          </motion.div>
        </>
      )}
      {/* <motion.div variants={variants}>
        骑行距离可绕地球
        <div className="inline-block relative">
          <span className="text-primary text-3xl font-bold px-4 underline">
            {toFixed(data.totalRideDistance / 40000)}
          </span>
          <div className="text-primary text-xs absolute -bottom-4 w-full text-center">
            {toFixed(data.totalRideDistance)} km
          </div>
        </div>
        圈
      </motion.div>
      <motion.div variants={variants}>
        爬升了
        <div className="inline-block relative">
          <span className="text-primary text-3xl font-bold mx-2 underline">
            {toFixed(data.totalElevationGain / 8848)}
          </span>
          <div className="text-primary text-xs absolute -bottom-4 w-full text-center">
            {toFixed(data.totalElevationGain)} m
          </div>
        </div>
        个珠穆朗玛峰
      </motion.div> */}

      {/* <motion.div variants={variants}>
        累计骑行时长
        <span className="text-primary text-5xl font-bold mx-2">
          {data.totalTime}
        </span>
        s
      </motion.div> */}

      {/* <motion.div variants={variants}>
        最远骑行
        <span className="text-primary text-5xl font-bold mx-2">
          {toFixed(data.biggestRideDistance)}
        </span>
        km
      </motion.div>
      <motion.div variants={variants}>
        最大爬升
        <span className="text-primary text-5xl font-bold mx-2">
          {toFixed(data.biggestElevationGain)}
        </span>
        m
      </motion.div> */}
    </motion.div>
  )
}
