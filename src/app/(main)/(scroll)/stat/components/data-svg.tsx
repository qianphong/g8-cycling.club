import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { AthleteData } from '@/types'
import { getDayOfWeek, getWeekNumber } from '@/lib/date'
import { toFixed } from '@/lib/number'

export const DataSvg: Component<{ data: AthleteData }> = ({ data }) => {
  const wrapper = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const svg = render(wrapper.current!, data)
    return () => {
      svg.remove()
    }
  }, [data])

  return (
    <>
      <div ref={wrapper} className="w-full" />
    </>
  )
}

const titleHeight = 70
const padding = 20
// 日历图尺寸信息
const calendarCols = 53 // 共计53周
const calendarGap = 4
const calendarSize = 20 // 每一块大小，包括右边和下边间隙的，实际每个方格大小为15
const calendarHeight = calendarSize * 7 // height of a week (7 days + 6 padding)
const calendarWeekWidth = 15
// svg 的宽计算得出
const width = calendarSize * calendarCols + calendarWeekWidth // 共计53周
// 路线轨迹尺寸信息
const trackCols = 8
const trackGap = 20
const trackSize = (width - (trackCols - 1) * trackGap) / trackCols
const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六']
// 颜色
const color = [
  '#444444',
  ...d3.quantize(d3.interpolateRgb('#F2CB05', '#F20505'), 5),
]
const scale = d3
  .scaleThreshold()
  .domain([1, 51, 101, 151, 201]) // 定义分界点
  .range([0, 1, 2, 3, 4, 5]) // 定义每个区间的输出值

const getColor = (value: number) => {
  return color[scale(value)]
}

const render = (node: HTMLDivElement, data: AthleteData) => {
  // 路线图行数
  const trackRows = Math.ceil(data.trackFeatures.length / trackCols)
  // 路线图高度
  const trackHeight = trackRows * trackSize + (trackRows - 1) * trackGap // 根据行数动态计算高度
  // 标题的高度 + gap + 日历图高度 + gap + 路线图高度
  const height =
    titleHeight + padding + calendarHeight + padding + trackHeight + padding

  const container = d3.select(node)
  const svg = container
    .append('svg')
    .attr('width', '100%')
    .attr('viewBox', [0, 0, width, height])

  const year = svg.selectAll('g').data([data]).join('g')

  renderText(year)
  renderCalendar(year)
  renderTrack(year)
  renderLegend(year)
  return svg
}
const renderText = (
  svg: d3.Selection<d3.BaseType, AthleteData, SVGSVGElement, unknown>,
) => {
  // 添加年份文字
  const group = svg.append('g')
  group
    .append('text')
    .attr('x', 0)
    .attr('y', 55)
    .attr('font-size', 42)
    .style('fill', 'hsl(var(--foreground))')
    .html(item => {
      return `${item.year}`
    })

  // group
  //   .append('line')
  //   .attr('x1', 0) // 起点 x 坐标
  //   .attr('y1', 64) // 起点 y 坐标
  //   .attr('x2', width) // 终点 x 坐标
  //   .attr('y2', 64) // 终点 y 坐标
  //   .style('stroke', '#444444') // 线条颜色
  //   .attr('stroke-width', 1) // 线条宽度
  renderStatText(group).attr('transform', `translate(${width - 250},${35})`)
}
const renderCalendar = (
  svg: d3.Selection<d3.BaseType, AthleteData, SVGSVGElement, unknown>,
) => {
  // 日历图
  const group = svg
    .append('g')
    .attr('transform', `translate(0,${titleHeight + padding})`)
  group
    .selectAll()
    .data(d => d.calendarData)
    .join('rect')
    .attr('width', calendarSize - calendarGap)
    .attr('height', calendarSize - calendarGap)
    .attr(
      'x',
      d => (getWeekNumber(d.date) - 1) * calendarSize + calendarWeekWidth,
    )
    .attr('y', d => getDayOfWeek(d.date) * calendarSize)
    .style('fill', d => getColor(d.value))
    .filter(d => d.value !== 0)
    .append('title')
    .text(d => `${d.date}\n${d.value}km`)
  //月
  group
    .append('g')
    .selectAll()
    .data(data => {
      return Array.from({ length: 12 }, (_, i) => {
        return getWeekNumber(new Date(data.year, i, 1))
      })
    })
    .join('text')
    .attr('x', x => (x - 1) * calendarSize + calendarWeekWidth)
    .attr('y', -6)
    .style('fill', 'hsl(var(--foreground))')
    .style('font-size', 10)
    .text((_, i) => `${i + 1}月`)
  // 周
  group
    .append('g')
    .attr('text-anchor', 'end')
    .selectAll()
    .data(daysOfWeek)
    .join('text')
    .attr('x', calendarWeekWidth - 4)
    .attr('y', (_, i) => i * calendarSize)
    .attr('dy', 11)
    .style('fill', 'hsl(var(--foreground))')
    .style('font-size', 10)
    .text(i => i)
}
const renderTrack = (
  svg: d3.Selection<d3.BaseType, AthleteData, SVGSVGElement, unknown>,
) => {
  const group = svg
    .append('g')
    .attr(
      'transform',
      `translate(0,${titleHeight + calendarHeight + padding * 2})`,
    )
    .selectAll()
    .data(d => d.trackFeatures)
    .join('g')
    .attr('transform', (_, i) => {
      const col = i % trackCols
      const row = Math.floor(i / trackCols)
      const x = col * (trackSize + trackGap)
      const y = row * (trackSize + trackGap)
      return `translate(${x},${y})`
    })
  // 添加路线轨迹
  group
    .append('path')
    .attr('stroke', f => getColor(f.properties.distance))
    .attr('stroke-width', 1.5)
    .attr('fill', 'transparent')
    .attr('d', f => {
      const p = d3.geoMercator().fitSize([trackSize, trackSize], f)
      return d3.geoPath(p)(f)
    })
  // 添加覆盖的Rect元素，点击事件，划过效果
  group
    .append('rect')
    .attr('height', trackSize)
    .attr('width', trackSize)
    .attr('data-id', f => f.properties.id)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('click', (e: MouseEvent) => {
      const target = e.currentTarget as SVGRectElement
      if (!target.dataset.id) return
      window.open(
        `https://www.strava.com/activities/${target.dataset.id}`,
        '_blank',
      )
    })
    .append('title')
    .text(
      f =>
        `${f.properties.date}\n${f.properties.name}\n${f.properties.distance}km`,
    )
}
const renderStatText = (svg: d3.Selection<any, AthleteData, any, unknown>) => {
  const group = svg.append('g').attr('font-size', 14)
  group
    .selectAll()
    .data(data => {
      return [
        {
          x: 0,
          y: 0,
          text: `活动：<tspan class="text-value">${toFixed(
            data.totalRideCount,
          )}</tspan>`,
        },
        {
          x: 120,
          y: 0,
          text: `距离：<tspan class="text-value">${toFixed(
            data.totalRideDistance,
          )}</tspan> km`,
        },
        {
          x: 0,
          y: 20,
          text: `时长：<tspan class="text-value">${Math.floor(
            data.totalTime / 3600,
          )}</tspan>h <tspan class="text-value">${Math.floor(
            (data.totalTime % 3600) / 60,
          )}</tspan>m`,
        },
        {
          x: 120,
          y: 20,
          text: `爬升：<tspan class="text-value">${toFixed(
            data.totalElevationGain,
          )}</tspan> m`,
        },
      ]
    })
    .join('text')
    .style('fill', 'hsl(var(--foreground))')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .html(d => d.text)
  return group
}

const renderLegend = (svg: d3.Selection<any, any, any, unknown>) => {
  const thresholds = scale.domain() // scaleQuantize
  const legendWidth = 180
  const height = 10
  const x = d3
    .scaleLinear()
    .domain([0, scale.range().length - 1])
    .rangeRound([0, legendWidth])
  const group = svg
    .append('g')
    .attr('transform', `translate(${120},${titleHeight - 20})`)
  group
    .append('g')
    .selectAll('rect')
    .data(scale.range().slice(1))
    .join('rect')
    .attr('x', i => x(i - 1))
    .attr('y', 0)
    .attr('width', i => x(i) - x(i - 1))
    .attr('height', height)
    .attr('fill', d => color[d])

  group
    .append('g')
    .attr('transform', `translate(${legendWidth / thresholds.length / 2},${6})`)
    .call(
      d3
        .axisTop(x)
        .tickSize(6)
        .tickFormat(v => `${thresholds[Number(v)] - 1}+`)
        .tickValues(d3.range(thresholds.length)),
    )
    .call(g => {
      g.select('.domain').remove()
      g.selectAll('.tick line').remove()
    })
  return group.node()
}
