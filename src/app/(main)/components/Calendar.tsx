import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'
import { Text3D } from '@react-three/drei'
import {
  EffectComposer,
  Outline,
  Select,
  Selection,
} from '@react-three/postprocessing'
import gsap from 'gsap'
import { AthleteData } from '@/types'
import { getDayOfWeek, getWeekNumber } from '@/lib/date'
import { mergeBufferGeometries } from 'three-stdlib'
import { siteConfig } from '@/config/site'
import { User } from 'next-auth'

export const Calendar: Component<{ data: AthleteData; userInfo: User }> = ({
  data,
  userInfo,
}) => {
  // 创建裁剪平面
  const clippingPlane = useMemo(
    () => [
      new THREE.Plane(
        new THREE.Vector3(-1, 0, 0),
        -(TOP_WIDTH * WIDTH_RATIO) / 2,
      ),
      new THREE.Plane(
        new THREE.Vector3(-1, 0, 0),
        -(TOP_WIDTH * WIDTH_RATIO) / 2,
      ),
    ],
    [],
  )
  const [opacity, setOpacity] = useState(1)
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const tl = gsap.timeline()

    tl.to(clippingPlane[0], {
      constant: (TOP_WIDTH * WIDTH_RATIO) / 2,
      duration: 2,
      ease: 'power1.in',
    })
    tl.to(
      clippingPlane[1],
      {
        constant: (TOP_WIDTH * WIDTH_RATIO) / 2,
        duration: 2,
        ease: 'power1.in',
      },
      '-=1.8',
    )
    tl.to(
      { opacity: 1 },
      {
        opacity: 0,
        duration: 1,
        ease: 'power1.out',
        onUpdate() {
          setOpacity(this.targets()[0].opacity)
        },
        onComplete() {
          setEnabled(true)
        },
      },
    )
    return () => {
      tl.kill()
    }
  }, [clippingPlane])

  return (
    <group>
      <clippingPlaneContext.Provider value={clippingPlane[1]}>
        <Selection>
          <EffectComposer autoClear={false}>
            <Outline visibleEdgeColor={0x26f3dd} />
          </EffectComposer>
          <Select enabled={enabled}>
            <Box data={data} name="data-box" userInfo={userInfo} />
          </Select>
        </Selection>
      </clippingPlaneContext.Provider>

      <clippingPlaneContext.Provider value={clippingPlane[0]}>
        <Box data={data} wireframe opacity={opacity} userInfo={userInfo} />
      </clippingPlaneContext.Provider>
    </group>
  )
}
const TOP_WIDTH = 53 + 2 // 53周 + 2(padding)
const HEIGHT = 3 // 底座高度
const TOP_DEPTH = 7 + 2 // 每周7天 + 2(padding)
const WIDTH_RATIO = 1.06
const DEPTH_RATIO = 1.4

interface BoxProps {
  data: AthleteData
  wireframe?: boolean
  opacity?: number
  name?: string
  userInfo: User
}
const Box: Component<BoxProps> = ({
  data,
  wireframe,
  opacity,
  name,
  userInfo,
}) => {
  const clippingPlane = useContext(clippingPlaneContext)
  const clippingPlanes = clippingPlane ? [clippingPlane] : undefined
  const dataGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = data.calendarData.map(item => {
      const x = getWeekNumber(item.date) - 1 - 26 // 向x轴负方向移动 53周（一年）的一半
      const y = item.value / 20
      const z = getDayOfWeek(item.date) - 3 // 向z轴负方向移动 7 （一周7天）的一半

      const geometry = new THREE.BoxGeometry(1, y, 1)

      geometry.translate(x, y / 2, z)
      return geometry
    })
    const CalendarGeometry = mergeBufferGeometries(geometries, false)!

    CalendarGeometry.computeVertexNormals()
    return CalendarGeometry
  }, [data])

  const pedestalGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(
      TOP_WIDTH, // 共计53周
      HEIGHT,
      TOP_DEPTH, // 每周7天
    )
    const positionAttribute = geometry.attributes.position
    const positions = positionAttribute.array
    // 调整顶点，使顶部宽度缩小 转换成梯形
    for (let i = 0; i < positions.length; i += 3) {
      if (positions[i + 1] < 0) {
        // y坐标在y轴负方向 顶部顶点
        positions[i] *= WIDTH_RATIO // x坐标
        positions[i + 2] *= DEPTH_RATIO // z坐标
      }
    }
    geometry.translate(0, -HEIGHT / 2 + 0.01, 0)
    geometry.computeVertexNormals() // 重新计算法线
    return geometry
  }, [])
  const stat = useMemo(() => {
    return `活动${data.totalRideCount}次 / 距离${Math.round(
      data.totalRideDistance,
    )}km / 时长${Math.round(data.totalTime / 3600)}h / 海拔${Math.round(
      data.totalElevationGain,
    )}m`
  }, [data])
  return (
    <group
      position-y={HEIGHT + 0.5}
      name={name}
      visible={opacity === undefined || opacity !== 0}
    >
      {/* 图表 */}
      <mesh geometry={dataGeometry}>
        <meshStandardMaterial
          opacity={opacity}
          roughness={0.3}
          metalness={0.8}
          color={wireframe ? 0xbf2178 : 0x444444}
          transparent
          wireframe={wireframe}
          clippingPlanes={clippingPlanes}
        />
      </mesh>
      {/* 底面梯形几何体 */}
      <mesh geometry={pedestalGeometry}>
        <meshStandardMaterial
          opacity={opacity}
          roughness={0.3}
          metalness={1}
          color={wireframe ? 0xbf2178 : 0xaaaaaa}
          transparent
          wireframe={wireframe}
          clippingPlanes={clippingPlanes}
        />
      </mesh>
      {/* 文字 */}
      <group position-y={-(HEIGHT / 2) - 0.65}>
        {/* Strava 图标 */}
        <TextMesh
          x={-TOP_WIDTH / 2 + 1}
          anchor="left"
          color={0xfc4c02}
          text="&#xed18;"
          font="/fonts/iconfont_Regular.json"
        />
        {/* 姓名 */}
        <TextMesh
          anchor="left"
          x={-TOP_WIDTH / 2 + 1 + 2}
          text={userInfo.name || 'Your Name'}
        />
        {/* 年份 */}
        <TextMesh x={TOP_WIDTH / 2 - 1} anchor="right" text={data.year} />
        {/* 俱乐部名称 */}
        <TextMesh x={0} text={siteConfig.name} />
        <TextMesh x={0} back text={stat} />
      </group>
    </group>
  )
}
const clippingPlaneContext = createContext<THREE.Plane | null>(null)

const TextMesh = ({
  x,
  back,
  text,
  font = '/fonts/Alimama FangYuanTi VF_Regular.json',
  color = 0x333333,
  anchor = 'center', // 新增的 anchor 属性
}: {
  x: number
  text: string | number
  back?: boolean
  font?: string
  color?: string | number
  anchor?: 'left' | 'center' | 'right' // 锚点类型
}) => {
  const TEXT_DEPTH = (TOP_DEPTH + TOP_DEPTH * DEPTH_RATIO) / 2 / 2 + 0.3
  const TEXT_ROTATION_X = Math.atan(
    (TOP_DEPTH * DEPTH_RATIO - TOP_DEPTH) / 2 / HEIGHT,
  )
  const isFront = back ? -1 : 1
  const clippingPlanes = useContext(clippingPlaneContext)

  // 引用 Text3D 用于操作边界框
  const textRef = useRef<any>()

  useEffect(() => {
    if (textRef.current) {
      const box = new THREE.Box3().setFromObject(textRef.current)
      const size = new THREE.Vector3()
      box.getSize(size) // 获取边界框尺寸

      // 根据锚点调整 x 方向位置
      switch (anchor) {
        case 'left':
          break
        case 'right':
          textRef.current.position.x -= size.x * isFront
          break
        case 'center':
          textRef.current.position.x -= (size.x * isFront) / 2
        default:
          // 默认居中，不需要额外处理
          break
      }
    }
  }, [anchor, isFront, text])

  return (
    <Text3D
      ref={textRef}
      font={font}
      size={1.2}
      position={[x, 0, TEXT_DEPTH * isFront]}
      rotation-x={isFront * -TEXT_ROTATION_X}
      rotation-y={back ? Math.PI : undefined}
    >
      {text}
      <meshStandardMaterial
        roughness={0.3}
        metalness={0.9}
        color={color}
        clippingPlanes={clippingPlanes ? [clippingPlanes] : undefined}
      />
    </Text3D>
  )
}
