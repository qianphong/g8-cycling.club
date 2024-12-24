import NextAuth from 'next-auth'
import strava from 'next-auth/providers/strava'
import { refreshToken } from '@/lib/strava'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    strava({
      authorization: {
        params: {
          scope: 'activity:read_all',
          approval_prompt: 'force',
          response_type: 'code',
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: `${profile.lastname}${profile.firstname}`,
          email: null,
          image: profile.profile,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        // 首次登录
        return {
          ...token,
          id: profile?.id!,
          access_token: account.access_token!,
          expires_at: account.expires_at!,
          refresh_token: account.refresh_token!,
        }
      } else if (Date.now() < token.expires_at * 1000) {
        // 后续登录，如果“access_token”仍然有效，则返回JWT
        return token
      } else {
        // 后续登录，如果“access_token”已过期，请尝试刷新它
        if (!token.refresh_token) throw new Error('Missing refresh token')

        try {
          const response = await refreshToken(token.refresh_token)

          return {
            // 保留以前的令牌属性
            ...token,
            access_token: response.access_token,
            expires_at: response.expires_at,
            refresh_token: response.refresh_token, // 回到旧的刷新令牌，但请注意 许多提供者可能只允许使用一次刷新令牌。
          }
        } catch (error) {
          console.error('Error refreshing access token', error)
          // error属性可用于客户端处理刷新令牌错误
          return { ...token, error: 'RefreshAccessTokenError' as const }
        }
      }
    },
    async session({ session, token }) {
      session.access_token = token.access_token
      return session
    },
  },
})
