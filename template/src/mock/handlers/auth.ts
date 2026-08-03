import { http, HttpResponse } from 'msw';
import { menuConfig } from '@/modules/app/config/menu.config';
import type { MenuItem } from '@/modules/app/config/menuTypes';

// ── 演示用多角色（用于肉眼验证路由守卫与按钮级 v-permission）──────────────
// 不同账号返回不同 menus / permissions（密码任意，mock 不校验，仅需正确验证码）：
//   - admin：全部菜单 + 全部权限（含删除按钮 code）；
//   - manager：仅「用户管理」、且无删除权限 → 验证路由 403（/role-management）+ 删除按钮 v-permission 隐藏；
//   - viewer：无任何权限 → 登录后直接 403（验证默认拒绝守卫）。
// 真实 RBAC 由后端按角色返回。
const ROLES: Record<string, { menus: MenuItem[]; permissions: string[] }> = {
  admin: {
    menus: menuConfig,
    permissions: [
      'UserManagement',
      'RoleManagement',
      'UserManagement:delete',
      'ThemePreview',
      'Readme',
    ],
  },
  manager: {
    menus: menuConfig.filter((m) => m.code === 'UserManagement'),
    permissions: ['UserManagement'],
  },
  viewer: {
    menus: [],
    permissions: [],
  },
};

function getRole(username: string): { menus: MenuItem[]; permissions: string[] } {
  // 未知账号回退 admin，保证向后兼容
  return ROLES[username] ?? ROLES.admin;
}

// ── Token 有效期（演示用）───────────────────────────────────
// access 默认 2 分钟（足够肉眼观察续期），可用 .env 的 VITE_MOCK_ACCESS_TTL_SEC 覆盖；
// refresh 默认 30 分钟。真实值由后端决定。
const ACCESS_TTL_MS = (Number(import.meta.env.VITE_MOCK_ACCESS_TTL_SEC) || 120) * 1000;
const REFRESH_TTL_MS = 30 * 60 * 1000;

/** 持久化 token 状态：access / refresh → 过期时间戳；access → 登录用户名（getUserInfo 反查角色用）。 */
interface TokenStore {
  access: Record<string, number>;
  refresh: Record<string, number>;
  userByAccess: Record<string, string>;
  /** refresh token → 登录用户名（refresh 换新 access 时据此把用户名带到新 token，避免刷新后角色丢失） */
  userByRefresh: Record<string, string>;
}

const TOKENS_KEY = 'mock-tokens';

function loadTokens(): TokenStore {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(TOKENS_KEY) ?? '') as Partial<TokenStore>;
    return {
      access: parsed.access ?? {},
      refresh: parsed.refresh ?? {},
      userByAccess: parsed.userByAccess ?? {},
      userByRefresh: parsed.userByRefresh ?? {},
    };
  } catch {
    return { access: {}, refresh: {}, userByAccess: {}, userByRefresh: {} };
  }
}

function saveTokens(store: TokenStore): void {
  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(store));
}

function randomTag(): string {
  return Math.random().toString(36).slice(2, 8);
}

/** 签发一对新 token 并持久化，同时记录登录用户名（供 getUserInfo 反查角色）。 */
function issueTokens(username: string): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  const now = Date.now();
  const accessToken = `mock-access-${now}-${randomTag()}`;
  const refreshToken = `mock-refresh-${now}-${randomTag()}`;
  const store = loadTokens();
  store.access[accessToken] = now + ACCESS_TTL_MS;
  store.refresh[refreshToken] = now + REFRESH_TTL_MS;
  store.userByAccess[accessToken] = username;
  store.userByRefresh[refreshToken] = username;
  saveTokens(store);
  return { accessToken, refreshToken, expiresIn: Math.floor(ACCESS_TTL_MS / 1000) };
}

/** 用 refresh token 换新 access token（不换 refresh，非 rolling）。refresh 失效则返回 null。 */
function rotateAccess(refreshToken: string): { accessToken: string; expiresIn: number } | null {
  const store = loadTokens();
  const refreshExp = store.refresh[refreshToken];
  if (!refreshExp || refreshExp <= Date.now()) return null;
  const now = Date.now();
  const accessToken = `mock-access-${now}-${randomTag()}`;
  store.access[accessToken] = now + ACCESS_TTL_MS;
  // 关键：把 refresh token 对应的用户名带到新 access token，
  // 否则刷新后的 getUserInfo 查不到用户名 → 回退 admin → 角色错乱（viewer/manager 变 admin）
  const username = store.userByRefresh[refreshToken];
  if (username) store.userByAccess[accessToken] = username;
  saveTokens(store);
  return { accessToken, expiresIn: Math.floor(ACCESS_TTL_MS / 1000) };
}

function extractBearer(header: string | null): string | null {
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

function isAccessValid(token: string | null): boolean {
  if (!token) return false;
  const exp = loadTokens().access[token];
  return !!exp && exp > Date.now();
}

/** 由 access token 反查登录用户名（取不到则回退 admin）。 */
function getUsernameByAccess(token: string | null): string {
  if (!token) return 'admin';
  return loadTokens().userByAccess[token] ?? 'admin';
}

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    // 验证码已在前端 auth.api 模拟校验，能进到这里的视为通过
    const body = (await request.json().catch(() => ({}))) as { username?: string };
    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: issueTokens(body.username ?? 'admin'),
    });
  }),

  http.get('/api/user/info', ({ request }) => {
    const token = extractBearer(request.headers.get('Authorization'));
    if (!isAccessValid(token)) {
      // access token 缺失 / 过期：前端续期协调器会拦截此 401 自动刷新重试
      return HttpResponse.json({ code: 401, message: '登录已过期，请重新登录' }, { status: 401 });
    }
    const username = getUsernameByAccess(token);
    const role = getRole(username);
    return HttpResponse.json({
      code: 0,
      data: {
        user: { id: '1', username, avatar: '' },
        menus: role.menus,
        permissions: role.permissions,
      },
    });
  }),

  http.post('/api/auth/refresh', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { refreshToken?: string };
    const fresh = body.refreshToken ? rotateAccess(body.refreshToken) : null;
    if (!fresh) {
      // refresh token 也失效：协调器收到 401 后触发 onUnauthorized（真正登出）
      return HttpResponse.json(
        { code: 401, message: 'refresh token 已失效，请重新登录' },
        { status: 401 },
      );
    }
    return HttpResponse.json({ code: 0, data: fresh });
  }),

  http.post('/api/auth/logout', ({ request }) => {
    const token = extractBearer(request.headers.get('Authorization'));
    if (token) {
      const store = loadTokens();
      delete store.access[token];
      saveTokens(store);
    }
    return HttpResponse.json({ code: 0 });
  }),
];
