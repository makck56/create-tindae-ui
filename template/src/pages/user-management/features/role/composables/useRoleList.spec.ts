import { beforeEach, describe, expect, it, vi } from 'vitest';
import message from 'ant-design-vue/es/message';
import { useRoleList } from './useRoleList';
import { deleteRole, getRoleList } from '../api/role.api';
import { COPY } from '@/shared/constants/copy';

vi.mock('ant-design-vue/es/message', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../api/role.api', () => ({
  getRoleList: vi.fn().mockResolvedValue({
    data: {
      list: [
        { id: 'r-1', name: '管理员', status: 'active', createdAt: '2026-07-24' },
      ],
      total: 1,
    },
  }),
  deleteRole: vi.fn().mockResolvedValue({ data: { code: 200 } }),
}));

describe('useRoleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('暴露稳定的 grid 配置，供 proxy 查询使用', async () => {
    const { gridOptions } = useRoleList();

    expect(gridOptions.columns).toHaveLength(4);
    expect(gridOptions.formConfig).toEqual({ enabled: false });
    expect(gridOptions.toolbarConfig).toEqual({ enabled: false });
    expect(gridOptions.pagerConfig.pageSize).toBe(10);
    expect(gridOptions.proxyConfig.response).toEqual({
      result: 'list',
      total: 'total',
    });

    const result = await gridOptions.proxyConfig.ajax.query({
      page: { currentPage: 2, pageSize: 20 },
    });

    expect(getRoleList).toHaveBeenCalledWith({ page: 2, pageSize: 20 });
    expect(result).toEqual({
      list: [
        { id: 'r-1', name: '管理员', status: 'active', createdAt: '2026-07-24' },
      ],
      total: 1,
    });
  });

  it('删除成功后提示成功消息', async () => {
    const { handleDelete } = useRoleList();

    await handleDelete('r-1');

    expect(deleteRole).toHaveBeenCalledWith('r-1');
    expect(message.success).toHaveBeenCalledWith(COPY.COMMON.SUCCESS);
    expect(message.error).not.toHaveBeenCalled();
  });

  it('删除失败后提示失败消息', async () => {
    vi.mocked(deleteRole).mockRejectedValueOnce(new Error('delete failed'));
    const { handleDelete } = useRoleList();

    await handleDelete('r-2');

    expect(message.error).toHaveBeenCalledWith(COPY.COMMON.FAILED);
  });
});
