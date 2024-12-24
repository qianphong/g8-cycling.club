import { getAthleteClubs } from '@/lib/strava'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  try {
    const data = await getAthleteClubs()
    // 数据放在客户端处理，处理后数据太大不适合传输
    // const data = generateData(year, activities.flat())
    return NextResponse.json({
      success: true,
      message: '获取数据成功',
      data: data,
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
