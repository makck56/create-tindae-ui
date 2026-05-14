import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserList } from './useUser';

vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../api/user.api', () => ({
  getUserList: vi.fn().mockResolvedValue({
    data: {
      code: 200,
      data: {
        list: [
          {
            id: '1',
            name: '张三',
            email: 'zhangsan@test.com',
            role: 'admin',
            status: 'active',
            createdAt: '2024-01-01',
          },
        ],
        total: 1,
      },
    },
  }),
  deleteUser: vi.fn().mockResolvedValue({ data: { code: 200 } }),
}));

describe('useUserList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return gridOptions with correct columns', () => {
    const { gridOptions } = useUserList();

    expect(gridOptions.columns).toHaveLength(6);
    expect(gridOptions.columns[0]).toEqual({ field: 'name', title: '用户名' });
    expect(gridOptions.pagerConfig.pageSize).toBe(10);
  });

  it('should have proxyConfig.ajax.query function', () => {
    const { gridOptions } = useUserList();

    expect(typeof gridOptions.proxyConfig.ajax.query).toBe('function');
  });
});
