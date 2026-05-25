import { constantRoutes } from '@/router'

describe('router constant routes', () => {
  it('registers the profile page under /profile', () => {
    const profileRoute = constantRoutes.find(route => route.path === '/profile')

    expect(profileRoute).toBeTruthy()
    expect(profileRoute.children[0].path).toBe('')
    expect(profileRoute.children[0].name).toBe('Profile')
    expect(profileRoute.children[0].meta.title).toBe('个人中心')
  })

  it('registers the navbar message center as a hidden route', () => {
    const messageRoute = constantRoutes.find(route => route.path === '/shop/msgList')

    expect(messageRoute).toBeTruthy()
    expect(messageRoute.hidden).toBe(true)
    expect(messageRoute.children[0].path).toBe('')
    expect(messageRoute.children[0].meta.title).toBe('消息通知')
  })
})
