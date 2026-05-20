import { http, HttpResponse } from 'msw'

const MOCK_USER = {
  id: '1',
  username: 'admin',
  avatar: '',
}

const MOCK_MENUS = [
  { code: 'UserManagement', name: '用户管理' },
]

function isLoggedIn(): boolean {
  return sessionStorage.getItem('mock-auth') === '1'
}

export const authHandlers = [
  http.post('/api/auth/login', async () => {
    sessionStorage.setItem('mock-auth', '1')
    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: { token: 'mock-token-' + Date.now() },
    })
  }),

  http.get('/api/user/info', () => {
    if (!isLoggedIn()) {
      return HttpResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }
    return HttpResponse.json({
      code: 0,
      data: {
        user: MOCK_USER,
        menus: MOCK_MENUS,
      },
    })
  }),

  http.post('/api/auth/logout', () => {
    sessionStorage.removeItem('mock-auth')
    return HttpResponse.json({ code: 0 })
  }),
]
