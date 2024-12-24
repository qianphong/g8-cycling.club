'use client'
import { Provider } from 'jotai'
import { store } from '@/store'

export const JotaiProvider: Component = ({ children }) => {
  return <Provider store={store}>{children}</Provider>
}
