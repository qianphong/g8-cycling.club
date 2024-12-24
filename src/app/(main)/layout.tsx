import { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { YearSelector } from '@/components/year-selector'
import { auth } from '@/auth'
// import ShareButton from '@/components/share-button'

interface MainLayoutProps {
  children: ReactNode
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await auth()
  return (
    <div className="relative">
      <SiteHeader>
        {/* <ShareButton /> */}
        {session?.user && <YearSelector />}
      </SiteHeader>
      {children}
    </div>
  )
}
