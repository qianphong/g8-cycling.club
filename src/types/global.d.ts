import type { FC, PropsWithChildren } from 'react'

declare global {
  interface Window {
    _AMapSecurityConfig: {
      securityJsCode?: string
    }
  }
  export type NextErrorProps = {
    reset(): void
    error: Error
  }
  export type NextPageParams<P extends {}, Props = {}> = PropsWithChildren<
    {
      params: P
    } & Props
  >

  export type Component<P = {}> = FC<ComponentType & P>

  export type ComponentType<P = {}> = {
    className?: string
  } & PropsWithChildren &
    P

  namespace AMap {
    namespace DistrictLayer {
      class Country extends OverlayGroup {
        constructor(params: any) {}
      }
    }
  }
}
