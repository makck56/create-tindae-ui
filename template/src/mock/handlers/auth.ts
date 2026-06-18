import { http, HttpResponse } from 'msw'

const MOCK_USER = {
  id: '1',
  username: 'admin',
  avatar: '',
}

const MOCK_MENUS = [
  { code: 'UserManagement', name: '用户管理' },
  { code: 'RoleManagement', name: '角色管理' },
  // @scaffold:mock-menu ← 新 mock 菜单在此行上方插入（由 scaffold:domain 自动维护，请勿删除）
]

// ── Token 有效期（演示用）───────────────────────────────────
// access 默认 2 分钟（足够肉眼观察续期），可用 .env 的 VITE_MOCK_ACCESS_TTL_SEC 覆盖；
// refresh 默认 30 分钟。真实值由后端决定。
const ACCESS_TTL_MS = (Number(import.meta.env.VITE_MOCK_ACCESS_TTL_SEC) || 120) * 1000
const REFRESH_TTL_MS = 30 * 60 * 1000

/** 持久化 token 状态：access / refresh token → 过期时间戳。用 sessionStorage 保证刷新页面不丢登录态。 */
interface TokenStore {
  access: Record<string, number>
  refresh: Record<string, number>
}

const TOKENS_KEY = 'mock-tokens'

function loadTokens(): TokenStore {
  try {
    return JSON.parse(sessionStorage.getItem(TOKENS_KEY) ?? '') as TokenStore
  } catch {
    return { access: {}, refresh: {} }
  }
}

function saveTokens(store: TokenStore): void {
  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(store))
}

function randomTag(): string {
  return Math.random().toString(36).slice(2, 8)
}

/** 签发一对新 token 并持久化，返回给前端。 */
function issueTokens(): { accessToken: string; refreshToken: string; expiresIn: number } {
  const now = Date.now()
  const accessToken = `mock-access-${now}-${randomTag()}`
  const refreshToken = `mock-refresh-${now}-${randomTag()}`
  const store = loadTokens()
  store.access[accessToken] = now + ACCESS_TTL_MS
  store.refresh[refreshToken] = now + REFRESH_TTL_MS
  saveTokens(store)
  return { accessToken, refreshToken, expiresIn: Math.floor(ACCESS_TTL_MS / 1000) }
}

/** 用 refresh token 换新 access token（不换 refresh，非 rolling）。refresh 失效则返回 null。 */
function rotateAccess(refreshToken: string): { accessToken: string; expiresIn: number } | null {
  const store = loadTokens()
  const refreshExp = store.refresh[refreshToken]
  if (!refreshExp || refreshExp <= Date.now()) return null
  const now = Date.now()
  const accessToken = `mock-access-${now}-${randomTag()}`
  store.access[accessToken] = now + ACCESS_TTL_MS
  saveTokens(store)
  return { accessToken, expiresIn: Math.floor(ACCESS_TTL_MS / 1000) }
}

function extractBearer(header: string | null): string | null {
  if (!header || !header.startsWith('Bearer ')) return null
  return header.slice(7)
}

function isAccessValid(token: string | null): boolean {
  if (!token) return false
  const exp = loadTokens().access[token]
  return !!exp && exp > Date.now()
}

export const authHandlers = [
  http.post('/api/auth/login', async () => {
    // 验证码已在前端 auth.api 模拟校验，能进到这里的视为通过
    return HttpResponse.json({ code: 0, message: 'ok', data: issueTokens() })
  }),

  http.get('/api/user/info', ({ request }) => {
    const token = extractBearer(request.headers.get('Authorization'))
    if (!isAccessValid(token)) {
      // access token 缺失 / 过期：前端续期协调器会拦截此 401 自动刷新重试
      return HttpResponse.json({ code: 401, message: '登录已过期，请重新登录' }, { status: 401 })
    }
    return HttpResponse.json({
      code: 0,
      data: { user: MOCK_USER, menus: MOCK_MENUS },
    })
  }),

  http.post('/api/auth/refresh', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { refreshToken?: string }
    const fresh = body.refreshToken ? rotateAccess(body.refreshToken) : null
    if (!fresh) {
      // refresh token 也失效：协调器收到 401 后触发 onUnauthorized（真正登出）
      return HttpResponse.json({ code: 401, message: 'refresh token 已失效，请重新登录' }, { status: 401 })
    }
    return HttpResponse.json({ code: 0, data: fresh })
  }),

  http.post('/api/auth/logout', ({ request }) => {
    const token = extractBearer(request.headers.get('Authorization'))
    if (token) {
      const store = loadTokens()
      delete store.access[token]
      saveTokens(store)
    }
    return HttpResponse.json({ code: 0 })
  }),
]
