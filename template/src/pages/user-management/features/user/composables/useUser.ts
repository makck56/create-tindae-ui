import { ref, reactive } from 'vue';
import message from 'ant-design-vue/es/message';
import { getUserList, getUserDetail, deleteUser } from '../api/user.api';
import type { User, UserStatus, UserRole } from '../models/User';
import { COPY } from '@/shared/constants/copy';

interface QueryableGrid {
  commitProxy(target: 'query'): Promise<unknown> | void;
}

export function useUserList() {
  const filters = ref({
    name: undefined as string | undefined,
    status: undefined as UserStatus | undefined,
    role: undefined as UserRole | undefined,
  });

  // 业务层只需要触发表格重新查询，不应依赖 VXE 内部实例完整类型。
  const gridRef = ref<QueryableGrid | null>(null);

  const gridOptions = reactive({
    columns: [
      { field: 'name', title: '用户名' },
      { field: 'email', title: '邮箱' },
      { field: 'role', title: '角色' },
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
    // 当前页面未使用 VXE 内置查询表单和工具栏；显式关闭可覆盖 vxe-table 4.20.x 的默认启用项，
    // 避免 grid 在按需渲染时查找空 renderer 并抛出 "Renderer 'undefined' is not imported"。
    formConfig: { enabled: false },
    toolbarConfig: { enabled: false },
    pagerConfig: { pageSize: 10 },
    proxyConfig: {
      // vxe-table 4.20.x 已将 proxyConfig.props 重命名为 proxyConfig.response，
      // 沿用 props 会触发 delProp 废弃警告，且新版无法据此解析列表与总数字段。
      response: {
        result: 'list',
        total: 'total',
      },
      ajax: {
        query: async ({ page }: { page: { currentPage: number; pageSize: number } }) => {
          // 封装后直接返回 ApiResponse<UserListResult>，res.data 即列表数据
          const res = await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...filters.value,
          });
          return res.data;
        },
      },
    },
  });

  function handleSearch() {
    gridRef.value?.commitProxy('query');
  }

  function resetFilters() {
    // 重置筛选条件为初始空值后再查询，与 QueryFilter 的清空语义保持一致。
    filters.value = {
      name: undefined,
      status: undefined,
      role: undefined,
    };
    handleSearch();
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id);
      message.success(COPY.COMMON.SUCCESS);
      handleSearch();
    } catch {
      message.error(COPY.COMMON.FAILED);
    }
  }

  return { gridRef, gridOptions, filters, handleSearch, resetFilters, handleDelete };
}

export function useUserDetail() {
  const loading = ref(false);
  const user = ref<User | null>(null);

  async function fetchDetail(id: string) {
    loading.value = true;
    try {
      const res = await getUserDetail(id);
      user.value = res.data;
    } catch {
      message.error(COPY.COMMON.FAILED);
    } finally {
      loading.value = false;
    }
  }

  return { loading, user, fetchDetail };
}
