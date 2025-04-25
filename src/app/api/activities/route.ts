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
  const today = dayjs()
  const currentYear = today.year()
  const currentMonth = today.month() + 1

  const quarters: { startDate: string; endDate: string }[] = []

  if (year === currentYear) {
    for (let start = 0; start < currentMonth; start += 4) {
      const startMonth = String(start + 1).padStart(2, '0')
      const startDate = `${year}-${startMonth}-01`

      let endDate: string
      if (start + 4 >= currentMonth) {
        endDate = today.format('YYYY-MM-DD')
      } else {
        const endMonth = String(start + 4 + 1).padStart(2, '0')
        endDate = `${year}-${endMonth}-01`
      }

      quarters.push({ startDate, endDate })
    }
  } else {
    // 过去的年份，固定三段 4 个月
    for (let start = 0; start < 12; start += 4) {
      const startMonth = String(start + 1).padStart(2, '0')
      const endMonth = String(start + 4 + 1).padStart(2, '0')
      const startDate = `${year}-${startMonth}-01`
      const endDate = `${year}-${endMonth}-01`
      quarters.unshift({ startDate, endDate })
    }
  }
  console.log('quarters', quarters)
  return Promise.all(
    quarters.map(({ startDate, endDate }) =>
      listActivities(
        new URLSearchParams({
          per_page: '130',
          ...getUnixTimestamps(startDate, endDate),
        }),
      ),
    ),
  )
}
