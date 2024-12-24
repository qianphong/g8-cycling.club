export const siteConfig = {
  name: 'G8-Cycling.Club',
  description: '通过 Strava 登录 App 看你在中国哪些城市骑行过',
  mainNav: [
    {
      title: 'Skyline',
      href: '/',
    },
    {
      title: '年历',
      href: '/stat',
    },
    {
      title: '帮助',
      href: '/help',
    },
  ],
  links: {
    github: 'https://github.com/qianphong/g8-cycling.club',
  },
}

export type SiteConfig = typeof siteConfig
