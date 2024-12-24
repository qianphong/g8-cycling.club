import dayjs from 'dayjs'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { NextRequest, NextResponse } from 'next/server'
import { formatDate, getUnixTimestamps } from '@/lib/date'
import { listActivities } from '@/lib/strava'

export const GET = async (request: NextRequest) => {
  const year = Number(request.nextUrl.searchParams.get('year'))

  if (isNaN(year)) {
    return NextResponse.json(
      {
        error: '年份参数错误',
      },
      {
        status: 400,
      },
    )
  }
  if (process.env.NODE_ENV === 'development') {
    // 获取文件路径
    try {
      const filePath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'data.json',
      )
      const source = await fs.readFile(filePath, { encoding: 'utf-8' })
      const data: Record<string, { lastUpdated: string; data: any[] }> =
        JSON.parse(source)

      const currentData = data[year.toString()]
      const now = formatDate(dayjs())
      if (!currentData || currentData.lastUpdated !== now) {
        const activities = (await fetchData(year)).flat()
        // 更新 JSON 文件中的数据
        data[year.toString()] = {
          lastUpdated: now,
          data: activities,
        }
        // 写入文件
        await fs.writeFile(filePath, JSON.stringify(data, null, 2))
      }
      return NextResponse.json({
        success: true,
        message: '获取数据成功',
        data: data[year.toString()].data,
      })
    } catch (err) {
      return NextResponse.json(
        {
          error: '解析错误',
        },
        {
          status: 400,
        },
      )
    }
  }
  try {
    const activities = await fetchData(year)
    // 数据放在客户端处理，处理后数据太大不适合传输
    // const data = generateData(year, activities.flat())
    return NextResponse.json({
      success: true,
      message: '获取数据成功',
      data: activities.flat(),
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: '获取数据失败',
        data: null,
      },
      {
        status: 400,
      },
    )
  }
}

function fetchData(year: number) {
  const quarters = [
    { start: 8, end: 12 },
    { start: 4, end: 8 },
    { start: 0, end: 4 },
  ]
  return Promise.all(
    quarters.map((quarter: { start: number; end: number }) => {
      return listActivities(
        new URLSearchParams({
          per_page: '130',
          ...getUnixTimestamps(
            `${year}-${quarter.start + 1}-01`,
            `${year}-${quarter.end + 1}-01`,
          ),
        }),
      )
    }),
  )
}
