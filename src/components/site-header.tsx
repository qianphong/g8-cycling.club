// Taken from https://github.com/shadcn-ui/next-template/blob/main/components/site-header.tsx
import Link from 'next/link'

import { siteConfig } from '@/config/site'
// import { buttonVariants } from '@/components/ui/button'
import { Icons } from '@/components/icons'
// import { ThemeToggle } from '@/components/theme-toggle'
import { UserNav } from '@/components/user-nav'
import { cn } from '@/lib/utils'

export const SiteHeader: Component = ({ children }) => {
  return (
    <header className="w-full fixed top-0 z-[200]">
      <div className="container flex h-16 items-center sm:justify-between ">
        <div className="flex-1 flex gap-4 md:gap-6 lg:gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="hidden font-bold lg:inline-block">
              {siteConfig.name}
            </span>
          </Link>
          {siteConfig.mainNav.length ? (
            <nav className="flex gap-4 md:gap-6">
              {siteConfig.mainNav.map(
                (item, index) =>
                  item.href && (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        'flex items-center text-gray-300 font-bold text-sm hover:text-primary',
                      )}
                    >
                      {item.title}
                    </Link>
                  ),
              )}
            </nav>
          ) : null}
        </div>
        <nav className="flex items-center gap-4">
          {children}
          <UserNav />
        </nav>
      </div>
    </header>
  )
}
