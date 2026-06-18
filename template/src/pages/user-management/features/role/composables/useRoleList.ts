import { reactive } from 'vue';
import { message } from 'ant-design-vue';
import { getRoleList, deleteRole } from '../api/role.api';
import { COPY } from '@/shared/constants/copy';

export function useRoleList() {
  const gridOptions = reactive({
    columns: [
      { field: 'name', title: '名称' },
      {
        field: 'status',
        title: '状态',
        slots: { default: 'status_default' },
      },
      { field: 'createdAt', title: '创建时间' },
      {
        title: '操作',
        width: 200,
        slots: { default: 'actions_default' },
      },
    ],
    pagerConfig: { pageSize: 10 },
    proxyConfig: {
      props: {
        result: 'list',
        total: 'total',
      },
      ajax: {
        query: async ({ page }: { page: { currentPage: number; pageSize: number } }) => {
          // 封装后直接返回 ApiResponse<RoleListResult>，res.data 即列表数据
          const res = await getRoleList({
            page: page.currentPage,
            pageSize: page.pageSize,
          });
          return res.data;
        },
      },
    },
  });

  async function handleDelete(id: string) {
    try {
      await deleteRole(id);
      message.success(COPY.COMMON.SUCCESS);
    } catch {
      message.error(COPY.COMMON.FAILED);
    }
  }

  return { gridOptions, handleDelete };
}
