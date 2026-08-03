import type { Role } from '@/pages/user-management/features/role/models/Role';

// 新增角色的自增 id 起点（避开种子数据的 1~N）
let nextId = 20;

/** 角色种子数据（演示用，真实数据由后端返回） */
const SEED: Array<{ name: string; status: Role['status'] }> = [
  { name: '超级管理员', status: 'active' },
  { name: '系统管理员', status: 'active' },
  { name: '运营', status: 'active' },
  { name: '财务', status: 'active' },
  { name: '内容审核', status: 'active' },
  { name: '客服', status: 'inactive' },
  { name: '数据分析', status: 'active' },
  { name: '产品', status: 'active' },
  { name: '测试', status: 'inactive' },
  { name: '法务', status: 'active' },
  { name: '采购', status: 'active' },
  { name: '只读访客', status: 'inactive' },
];

/** 由种子生成初始角色列表（创建时间逐条往前一天，便于排序观察） */
function seedRoles(): Role[] {
  const now = Date.now();
  return SEED.map((s, i) => ({
    id: String(i + 1),
    name: s.name,
    status: s.status,
    createdAt: new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));
}

export let roles = seedRoles();

/** 重置为种子数据（测试 / 演示复位用） */
export function resetRoles(): void {
  nextId = 20;
  roles = seedRoles();
}

/** 新增角色（置顶，便于创建后立即可见） */
export function addRole(data: Omit<Role, 'id' | 'createdAt'>): Role {
  const role: Role = {
    ...data,
    id: String(++nextId),
    createdAt: new Date().toISOString().split('T')[0],
  };
  roles.unshift(role);
  return role;
}

/** 更新角色（不可变：返回新对象），不存在返回 undefined */
export function updateRole(id: string, data: Partial<Role>): Role | undefined {
  const idx = roles.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  roles[idx] = { ...roles[idx], ...data };
  return roles[idx];
}

/** 删除角色，不存在返回 false */
export function deleteRole(id: string): boolean {
  const idx = roles.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  roles.splice(idx, 1);
  return true;
}
