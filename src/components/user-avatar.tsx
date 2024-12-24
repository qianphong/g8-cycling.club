'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { isVerifiedAtom } from '@/store'
import { AthleteClubResponse } from '@/types/strava'
import { useAtom } from 'jotai'
import { User } from 'next-auth'
import { useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const UserAvatar: Component<{ userInfo: User }> = ({
  userInfo,
  children,
}) => {
  const [isVerified, setIsVerified] = useAtom(isVerifiedAtom)
  useEffect(() => {
    fetch('/api/athlete/clubs')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const clubs = (data.data as AthleteClubResponse[]).map(
            club => club.name,
          )
          setIsVerified(!clubs.includes('G8 Cycling Club'))
        }
      })
  }, [])
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage
                src={userInfo.image!}
                alt={userInfo.name || 'userName'}
              />
              <AvatarFallback>{userInfo.name}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-26" align="end" forceMount>
          <DropdownMenuLabel className="text-xl">
            <p className="text-lg font-bold">
              {userInfo.name}
              {isVerified && (
                <span className="text-xs text-muted-foreground">
                  （已验证俱乐部）
                </span>
              )}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* {siteConfig.mainNav.length ? (
        <DropdownMenuGroup>
          {siteConfig.mainNav.map(
            (item, index) =>
              item.href && (
                <DropdownMenuItem asChild key={index}>
                  <Link href={item.href}>{item.title}</Link>
                </DropdownMenuItem>
              ),
          )}
        </DropdownMenuGroup>
      ) : null}
      <DropdownMenuSeparator /> */}
          <DropdownMenuItem asChild>{children}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
