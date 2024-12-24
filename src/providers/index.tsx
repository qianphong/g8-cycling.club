import { JotaiProvider } from './jotai-provider'

export const Provider: Component = ({ children }) => {
  return (
    // <ThemeProvider>
    <JotaiProvider>{children}</JotaiProvider>
    // </ThemeProvider>
  )
}
