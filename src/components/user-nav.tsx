import { auth, signIn, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserAvatar } from './user-avatar'

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
    <UserAvatar userInfo={session.user}>
      <form
        className="w-full"
        action={async () => {
          'use server'
          await signOut()
        }}
      >
        <button type="submit">退出登录</button>
      </form>
    </UserAvatar>
  )
}
