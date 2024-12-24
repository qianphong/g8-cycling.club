import { signIn } from '@/auth'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <form className="w-96">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">现在开始</CardTitle>
            <CardDescription>使用 Strava 登录</CardDescription>
          </CardHeader>
          {/* <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-6"></div>
          </CardContent> */}
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              formAction={async () => {
                'use server'
                await signIn('strava', {
                  redirectTo: '/',
                })
              }}
            >
              <Icons.strava className="mr-2 h-4 w-4" />
              Strava
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
