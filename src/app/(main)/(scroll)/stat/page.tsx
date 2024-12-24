'use client'
import { useAtomValue } from 'jotai'
import { dataAtom } from '@/store'
import { MapView } from './components/map-view'
import { DataSvg } from './components/data-svg'
import { Empty } from '@/components/empty'

export default function Page() {
  const data = useAtomValue(dataAtom)
  if (!data) return <Empty />
  return (
    <div>
      <MapView data={data} />
      <DataSvg data={data} />
    </div>
  )
}
