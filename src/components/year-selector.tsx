'use client'
import { ChangeEvent, useState } from 'react'
import TextGradient from '@/components/syntaxui/text-gradient'
import { motion } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { getData, loadingAtom, yearAtom } from '@/store'
import { Button } from '@/components/ui/button'
import { ArrowDownUpIcon, XIcon } from 'lucide-react'
import Image from 'next/image'

export const YearSelector: Component<{}> = ({}) => {
  const year = useAtomValue(yearAtom)
  const [select, setSelected] = useState(new Date().getFullYear().toString())
  const [show, setShow] = useState(true)
  const isLoading = useAtomValue(loadingAtom)

  const handleConfirm = () => {
    const year = Number(select)
    if (isNaN(year)) return
    setShow(false)
    getData(year)
  }
  const handleYearChange = (event: ChangeEvent<HTMLInputElement>) => {
    const year = Number(event.target.value)
    if (isNaN(year)) return
    if (year > new Date().getFullYear()) return
    setSelected(event.target.value)
  }
  const handleToggleShow = () => {
    setShow(show => !show)
  }
  return (
    <>
      <div className="relative cursor-pointer" onClick={handleToggleShow}>
        <div className="absolute inset-0 animate-textGradient bg-gradient-to-r from-[#F22E76] via-[#F241E6] to-[#F2A444] text-lg font-semibold text-transparent rounded-lg" />
        <div className="relative text-sm md:text-lg font-bold text-center flex w-20 md:w-28 h-8 md:h-10 items-center justify-center">
          {year || <span className="text-base">选择年份</span>}
          <ArrowDownUpIcon className="ml-2 h-3 w-3 md:h-6 md:w-6" />
        </div>
      </div>
      <motion.div
        animate={show ? 'open' : 'closed'}
        initial={false}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
        }}
        variants={{
          open: {
            top: '0',
            opacity: 1,
          },
          closed: {
            top: '-100%',
            opacity: 0,
          },
        }}
        className="fixed left-0 w-screen h-screen bg-background flex flex-col z-10 items-center justify-center"
      >
        <TextGradient className="text-center">
          <p className="text-5xl mb-5">这一年</p>
          <p className="text-4xl my-4">你骑行了多少天 ？</p>
          <p className="text-4xl my-4">每天骑行多少公里 ？</p>
          <p className="text-4xl my-4">去过哪些城市 ？</p>
        </TextGradient>
        <div className="mt-10 mb-2 font-bold text-white text-opacity-50 text-sm lg:text-lg text-center">
          根据 Strava 的数据，为你生成一份专属的骑行报告
          <br />
          现在让我们开始吧！
        </div>
        <div className="p-[6px] relative">
          <div className="absolute inset-0 animate-textGradient bg-gradient-to-r from-[#F22E76] via-[#F241E6] to-[#F2A444] text-lg font-semibold text-transparent  rounded-lg" />
          <div className="relative flex">
            <input
              type="text"
              value={select}
              className="!outline-none w-60 h-12 bg-black bg-opacity-40 rounded px-4 text-center text-2xl font-bold"
              placeholder="Year"
              onChange={handleYearChange}
            />

            <button
              className="w-28 p-[3px] text-lg font-bold"
              onClick={handleConfirm}
            >
              GO
            </button>
          </div>
        </div>
        <div className="absolute bottom-5">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={handleToggleShow}
          >
            <XIcon />
          </Button>
        </div>
      </motion.div>
      {isLoading && <Loading />}
    </>
  )
}

const Loading = () => {
  return (
    <motion.div
      animate={'open'}
      initial={'closed'}
      className=" fixed top-0 left-0 w-screen h-screen bg-background z-10 flex items-center justify-center"
      variants={{
        open: {
          opacity: 1,
          top: '0',
        },
        closed: {
          opacity: 0,
          top: '100%',
        },
      }}
    >
      <Image
        src="/loading.svg"
        width={600}
        height={450}
        priority
        className="m-auto"
        alt="loading"
      />
    </motion.div>
  )
}
