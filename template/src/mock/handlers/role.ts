import { http, HttpResponse } from 'msw';
import { roles, addRole, updateRole, deleteRole } from '../data/role';
import type { Role } from '@/pages/user-management/features/role/models/Role';

/** 本地分页（与 user handler 一致） */
function paginate(list: Role[], page: number, pageSize: number): Role[] {
  const start = (page - 1) * pageSize;
  return list.slice(start, start + pageSize);
}

/**
 * 角色管理 mock handler，对齐 role.api.ts 契约：
 * - GET    /user-management/role/list   列表（支持 page/pageSize/keyword）
 * - POST   /user-management/role        新增
 * - PUT    /user-management/role/:id    更新
 * - DELETE /user-management/role/:id    删除
 * （role.api 未提供详情接口，故不实现 GET /:id）
 */
export const roleHandlers = [
  http.get('/api/user-management/role/list', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const keyword = url.searchParams.get('keyword')?.toLowerCase();

    let filtered = [...roles];
    if (keyword) {
      filtered = filtered.filter((r) => r.name.toLowerCase().includes(keyword));
    }

    // 表头排序：filtered 已是副本，原地排序安全。
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder');
    if (sortBy && (sortOrder === 'asc' || sortOrder === 'desc')) {
      filtered.sort((a, b) => {
        const av = a[sortBy as keyof Role];
        const bv = b[sortBy as keyof Role];
        if (av == null || bv == null) return 0;
        if (av < bv) return sortOrder === 'asc' ? -1 : 1;
        if (av > bv) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = filtered.length;
    const list = paginate(filtered, page, pageSize);

    return HttpResponse.json({ code: 0, data: { list, total } });
  }),

  http.post('/api/user-management/role', async ({ request }) => {
    const body = (await request.json()) as Omit<Role, 'id' | 'createdAt'>;
    const role = addRole(body);
    return HttpResponse.json({ code: 0, data: role });
  }),

  http.put('/api/user-management/role/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Role>;
    const role = updateRole(params.id as string, body);
    if (!role) {
      return HttpResponse.json({ code: 404, message: '角色不存在' }, { status: 404 });
    }
    return HttpResponse.json({ code: 0, data: role });
  }),

  http.delete('/api/user-management/role/:id', ({ params }) => {
    const ok = deleteRole(params.id as string);
    if (!ok) {
      return HttpResponse.json({ code: 404, message: '角色不存在' }, { status: 404 });
    }
    return HttpResponse.json({ code: 0 });
  }),
];
