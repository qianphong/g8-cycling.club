import {
  Environment,
  Grid,
  OrbitControls,
  Sparkles,
  useTexture,
} from '@react-three/drei'
import * as THREE from 'three'

export const SceneEnv: Component = ({ children }) => {
  const texture = useTexture('/texture/skybox.png')
  // const texture = useLoader(
  //   RGBELoader,
  //   '/texture/evening_road_01_puresky_4k.hdr',
  // )
  texture.mapping = THREE.EquirectangularReflectionMapping
  // 创建一个着色器材质

  // const { scene } = useThree()
  // scene.environment = texture
  // scene.background = texture
  // scene.backgroundIntensity = 0.6
  // scene.backgroundBlurriness = 0.01
  // texture.dispose()
  return (
    <>
      {/* <axesHelper args={[300]} /> */}
      {/* <gridHelper args={[200, 10]}>
        <lineBasicMaterial opacity={0.2} depthWrite transparent />
      </gridHelper> */}
      {/* light */}
      <ambientLight color={0xffffff} />
      <directionalLight
        position={[30, 100, -20]}
        color={0xffffff}
        intensity={10}
      />
      <directionalLight
        position={[-30, 100, 20]}
        color={0xffffff}
        intensity={40}
      />
      <Grid cellColor={0xffffff} cellSize={100} sectionSize={5} infiniteGrid />
      <OrbitControls
        autoRotate
        autoRotateSpeed={1}
        maxDistance={200}
        minDistance={20}
        maxPolarAngle={(Math.PI * 3) / 4}
        minPolarAngle={0}
      />
      {/* <Sky
        sunPosition={[0, -12, -250]}
        turbidity={11}
        rayleigh={6}
        mieDirectionalG={0.8}
      />*/}
      {/* <mesh rotation-x={-Math.PI / 2} castShadow position={[0, -220, 0]}>
        <circleGeometry args={[2000]} />
        <meshStandardMaterial color={0x111111} roughness={0} metalness={0.3} />
      </mesh> */}
      {/* <Stars radius={250} factor={6} fade /> */}
      <Sparkles
        color={0xd1479c}
        size={50}
        scale={[100, 100, 100]}
        opacity={0.2}
      />
      {/* <Stage
        center={{ disable: true }}
        adjustCamera={false}
        environment={{
          map: texture,
          background: true,
          environmentIntensity: 0.3,
          backgroundIntensity: 0.3,
          backgroundBlurriness: 0.05,
        }}
        shadows={{ color: '0xff0000' }}
      > */}
      {children}
      {/* </Stage> */}
      <Environment
        map={texture}
        background
        environmentIntensity={0.3}
        backgroundIntensity={0.3}
        backgroundBlurriness={0.05}
      />
      {/* <Environment
        background
        path="https://drei.pmnd.rs/cube/"
        files={['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']}
      /> */}
    </>
  )
}
