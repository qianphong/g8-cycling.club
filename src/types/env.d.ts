declare namespace NodeJS {
  interface ProcessEnv {
    readonly AUTH_STRAVA_ID?: string
    readonly AUTH_STRAVA_SECRET?: string
    readonly NEXT_PUBLIC_GETEWAY_URL?: string
    readonly NEXT_PUBLIC_AMAP_KEY?: string
    readonly NEXT_PUBLIC_AMAP_SECURITY_JS_CODE?: string
  }
}
