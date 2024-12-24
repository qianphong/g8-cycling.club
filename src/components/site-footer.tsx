import Image from 'next/image'
import React from 'react'
import { siteConfig } from '@/config/site'
import { Icons } from '@/components/icons'

interface NavigationItem {
  name: string
  href: string
  icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
}

const social: NavigationItem[] = [
  {
    name: 'Strava',
    href: 'https://www.strava.com/clubs/g8g8',
    icon: Icons.strava,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/qianphong',
    icon: Icons.gitHub,
  },
  {
    name: 'Garmin',
    href: 'https://connectus.garmin.cn',
    icon: Icons.garmin,
  },
]

const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-4 lg:px-8">
        <Image
          className="mx-auto w-20 md:w-36"
          src="/strava.png"
          priority
          alt="strava"
          height="86"
          width="199"
        />
        <div className="mt-5 flex justify-center space-x-6">
          {social.map(item => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              className="text-gray-600 hover:text-gray-800 dark:text-[#999]"
            >
              <span className="sr-only">{item.name}</span>
              {item.icon && (
                <item.icon className="h-5 w-5" aria-hidden="true" />
              )}
            </a>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-[#999]">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}

export default SiteFooter
