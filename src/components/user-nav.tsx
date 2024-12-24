import { auth, signIn, signOut } from '@/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

export async function UserNav() {
  const session = await auth()

  if (!session?.user) {
    return (
      <form>
        <Button
          size="sm"
          formAction={async () => {
            'use server'
            await signIn('strava', {
              redirectTo: '/',
            })
          }}
        >
          Strava 登录
        </Button>
      </form>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage
            src={session.user.image!}
            alt={session.user.name || 'userName'}
          />
          <AvatarFallback>{session.user.name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-26" align="end" forceMount>
        <DropdownMenuLabel className="text-xl">
          {session.user.name}
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
        <DropdownMenuItem asChild>
          <form
            className="w-full"
            action={async () => {
              'use server'
              await signOut()
            }}
          >
            <button type="submit">退出登录</button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
