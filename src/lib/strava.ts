import 'server-only'
import { auth } from '@/auth'
import { DetailedActivityResponse, RefreshTokenResponse } from '@/types/strava'

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3'

async function getAccessToken() {
  const session = await auth()
  return session?.access_token
}

export async function refreshToken(refresh_token: string) {
  const res = await fetch(
    STRAVA_BASE_URL +
      '/oauth/token?' +
      new URLSearchParams({
        client_id: process.env.AUTH_STRAVA_ID!,
        client_secret: process.env.AUTH_STRAVA_SECRET!,
        grant_type: 'refresh_token',
        refresh_token,
      }).toString(),
    {
      method: 'POST',
    },
  )
  const data = await res.json()
  return data as RefreshTokenResponse
}

export async function listActivities(
  params?: URLSearchParams,
): Promise<DetailedActivityResponse[]> {
  const access_token = await getAccessToken()
  const res = await fetch(
    STRAVA_BASE_URL + '/athlete/activities?' + params?.toString(),
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    },
  )
  const data = await res.json()
  if (res.ok) {
    return data
  }
  return Promise.reject(data)
}
