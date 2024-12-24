import { auth } from '@/auth'
import { Skyline } from './components/Skyline'

export default async function Page() {
  const session = await auth()
  if (!session?.user) return null

  return <Skyline userInfo={session.user} />
}
