export const dynamic = 'force-static'
export const revalidate = false

export const GET = async (
  _: Request,
  { params }: { params: { adcode: string } },
) => {
  const res = await fetch(
    `https://geo.datav.aliyun.com/areas_v3/bound/${params.adcode}_full.json`,
  )
  const data = await res.json()
  return Response.json(data, {
    headers: new Headers({
      'Cache-Control': 'public, max-age=3153600, immutable',
    }),
  })
}
