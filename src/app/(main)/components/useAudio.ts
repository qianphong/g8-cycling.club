import { useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

export const useAudio = ({ url = '/audio/sound.mp3' }: { url?: string }) => {
  const [audioUrl, setAudioUrl] = useState(url)
  const audioBuffer = useLoader(THREE.AudioLoader, audioUrl)
  const { audio, analyser } = useMemo(() => {
    const FFT_SIZE = 128
    const listener = new THREE.AudioListener()
    const audio = new THREE.Audio(listener)
    audio.loop = true
    const analyser = new THREE.AudioAnalyser(audio, FFT_SIZE)
    return { audio, analyser }
  }, [])
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    audio.setBuffer(audioBuffer)
    return () => {
      audio.stop()
      audio.disconnect()
    }
  }, [audio, audioBuffer])

  const togglePlay = (value?: boolean) => {
    if (!audio.isPlaying || value === true) {
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  return {
    analyser,
    isPlaying,
    setAudioUrl,
    togglePlay,
  }
}
