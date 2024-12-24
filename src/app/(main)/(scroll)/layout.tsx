import { ReactNode } from 'react'
import SiteFooter from '@/components/site-footer'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ScrollLayoutProps {
  children: ReactNode
}

export default function ScrollLayout({ children }: ScrollLayoutProps) {
  return (
    <ScrollArea className="h-screen pt-16">
      <div id="content" className="container">
        {children}
        <SiteFooter />
      </div>
    </ScrollArea>
  )
}
