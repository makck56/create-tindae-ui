import { beforeEach, describe, expect, it, vi } from 'vitest';
import message from 'ant-design-vue/es/message';
import { useUserList } from './useUser';
import { deleteUser, getUserList } from '../api/user.api';
import { COPY } from '@/shared/constants/copy';

vi.mock('ant-design-vue/es/message', () => ({
  default: {
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

  it('暴露稳定的 vxe-grid 配置', () => {
    const { gridOptions } = useUserList();

    expect(gridOptions.columns).toHaveLength(6);
    expect(gridOptions.columns[0]).toEqual({ field: 'name', title: '用户名' });
    expect(gridOptions.formConfig).toEqual({ enabled: false });
    expect(gridOptions.toolbarConfig).toEqual({ enabled: false });
    expect(gridOptions.pagerConfig.pageSize).toBe(10);
    expect(typeof gridOptions.proxyConfig.ajax.query).toBe('function');
  });

  it('查询时会把分页和筛选参数透传给接口', async () => {
    const { gridOptions, filters } = useUserList();

    filters.value.name = '张三';
    filters.value.status = 'active';
    filters.value.role = 'admin';

    const result = await gridOptions.proxyConfig.ajax.query({
      page: { currentPage: 3, pageSize: 20 },
    });

    expect(getUserList).toHaveBeenCalledWith({
      page: 3,
      pageSize: 20,
      name: '张三',
      status: 'active',
      role: 'admin',
    });
    expect(result).toEqual({
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
    });
  });

  it('搜索和重置都会触发 commitProxy("query")，且重置会清空筛选条件', () => {
    const { gridRef, filters, handleSearch, resetFilters } = useUserList();
    const commitProxy = vi.fn();

    gridRef.value = { commitProxy };
    filters.value.name = '张三';
    filters.value.status = 'active' as UserStatus;
    filters.value.role = 'admin' as UserRole;

    handleSearch();
    resetFilters();

    expect(commitProxy).toHaveBeenNthCalledWith(1, 'query');
    expect(commitProxy).toHaveBeenNthCalledWith(2, 'query');
    // 重置应把筛选条件清空回初始空值
    expect(filters.value).toEqual({
      name: undefined,
      status: undefined,
      role: undefined,
    });
  });

  it('删除成功后会提示成功并刷新表格', async () => {
    const { gridRef, handleDelete } = useUserList();
    const commitProxy = vi.fn();

    gridRef.value = { commitProxy };
    await handleDelete('1');

    expect(deleteUser).toHaveBeenCalledWith('1');
    expect(message.success).toHaveBeenCalledWith(COPY.COMMON.SUCCESS);
    expect(commitProxy).toHaveBeenCalledWith('query');
  });

  it('删除失败后会提示失败', async () => {
    vi.mocked(deleteUser).mockRejectedValueOnce(new Error('delete failed'));
    const { handleDelete } = useUserList();

    await handleDelete('1');

    expect(message.error).toHaveBeenCalledWith(COPY.COMMON.FAILED);
  });
});
