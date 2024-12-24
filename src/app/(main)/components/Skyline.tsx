'use client'
import { useRef } from 'react'
import { Scene } from 'three'
import { OBJExporter } from 'three-stdlib'
import { User } from 'next-auth'
import { Canvas, RootState } from '@react-three/fiber'
import { DownloadIcon, Volume2Icon, VolumeXIcon } from 'lucide-react'
import { useAtomValue } from 'jotai'

import { dataAtom } from '@/store'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/empty'
import TextGradient from '@/components/syntaxui/text-gradient'
import { SceneEnv } from './SceneEnv'
import { Calendar } from './Calendar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAudio } from './useAudio'

export const Skyline: Component<{ userInfo: User }> = ({ userInfo }) => {
  const data = useAtomValue(dataAtom)
  const sceneRef = useRef<Scene>()
  const { isPlaying, togglePlay } = useAudio({})

  if (!data) return <Empty />

  const onCreated = ({ scene }: RootState) => {
    sceneRef.current = scene
    togglePlay(true)
  }

  const handleDownload = () => {
    if (!sceneRef.current) return

    const object = sceneRef.current.getObjectByName('data-box')

    if (!object) return
    const exporter = new OBJExporter()
    const data = exporter.parse(object)

    // 判断你是否是arraybuffer
    const blob = new Blob([data], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '运动年历.obj'
    link.click()
    URL.revokeObjectURL(link.href)
    link.remove()
  }

  return (
    <div className="h-screen">
      <div className="z-10 absolute top-16 left-0 right-0 flex justify-center items-center">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage src={userInfo.image!} alt={userInfo.name!} />
          <AvatarFallback>{userInfo.name}</AvatarFallback>
        </Avatar>
        <TextGradient className="text-center text-3xl">
          {userInfo.name}‘s {data.year} Skyline
        </TextGradient>
      </div>
      <div className="absolute z-10 bottom-5 right-5 space-x-5">
        <Button
          size="icon"
          variant="outline"
          title="下载模型"
          onClick={handleDownload}
        >
          <DownloadIcon />
        </Button>
        <Button size="icon" variant="outline" onClick={() => togglePlay()}>
          {isPlaying ? <Volume2Icon /> : <VolumeXIcon />}
        </Button>
      </div>
      <Canvas
        gl={{
          localClippingEnabled: true,
          antialias: true,
        }}
        onCreated={onCreated}
        camera={{
          fov: 60,
          near: 0.1,
          far: 2000,
          position: [0, 15, 45],
        }}
      >
        <SceneEnv>
          <Calendar key={'a' + data.year} data={data} userInfo={userInfo} />
        </SceneEnv>
      </Canvas>
    </div>
  )
}
