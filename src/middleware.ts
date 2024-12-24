import { auth } from '@/auth'
const WHITE_LIST = ['/login', '/help']
export default auth(req => {
  if (!req.auth && !WHITE_LIST.includes(req.nextUrl.pathname)) {
    return Response.redirect(new URL('/login', req.nextUrl.origin))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
