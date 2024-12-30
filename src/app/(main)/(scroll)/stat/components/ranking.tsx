import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { City } from '@/types'

interface RankingProps {
  data: City[]
}

const Ranking: React.FC<RankingProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = 320
    const barHeight = 20
    const margin = { top: 0, right: 20, bottom: 20, left: 50 }
    const height =
      Math.ceil((data.length + 0.2) * barHeight) + margin.top + margin.bottom

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; font: 12px sans-serif;')

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .range([margin.left, width - margin.right])

    const y = d3
      .scaleBand()
      .domain(data.map(d => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.2)
    const colors = d3.scaleOrdinal(d3.schemeSet1)

    svg
      .append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', x(0))
      .attr('y', d => y(d.name)!)
      .attr('width', d => x(d.count) - x(0))
      .attr('height', y.bandwidth())
      .attr('fill', (d, i) => colors(i.toString()))

    svg
      .append('g')
      .attr('text-anchor', 'end')
      .selectAll()
      .data(data)
      .join('text')
      .attr('x', d => x(d.count))
      .attr('y', d => (y(d.name) ?? 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('dx', -4)
      .text(d => d.count)
      .call(text =>
        text
          .filter(d => x(d.count) - x(0) < 20) // short bars
          .attr('dx', +4)
          .attr('fill', 'white')
          .attr('text-anchor', 'start'),
      )

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .call(g => g.selectAll('.tick text').style('font-size', '12px'))
  }, [data])

  return <svg ref={svgRef}></svg>
}

export default Ranking
