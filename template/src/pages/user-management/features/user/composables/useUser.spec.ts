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

  it('should fetch user list successfully', async () => {
    const { users, total, fetchList } = useUserList();

    await fetchList();

    expect(users.value).toHaveLength(1);
    expect(users.value[0].name).toBe('张三');
    expect(total.value).toBe(1);
  });
});
