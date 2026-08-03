import { ref, reactive } from 'vue';
import message from 'ant-design-vue/es/message';
import { getUserList, getUserDetail, deleteUser } from '../api/user.api';
import type { User, UserStatus, UserRole } from '../models/User';
import { COPY } from '@/shared/constants/copy';

interface UserGridInstance {
  // commitProxy 可选：仅查询刷新需要；跨页勾选（useCrossPageGrid）只用 clear/setCheckboxRow。
  // 设为可选，使本接口与 VxeGridCheckboxController 结构兼容，可直接传给 useCrossPageGrid。
  commitProxy?(target: 'query'): Promise<unknown> | void;
  clearCheckboxRow(): void;
  setCheckboxRow(rows: User[], checked: boolean): void;
}

export function useUserList() {
  const filters = ref({
    name: undefined as string | undefined,
    status: undefined as UserStatus | undefined,
    role: undefined as UserRole | undefined,
  });

  // 业务层只需触发表格重新查询与跨页勾选同步，不应依赖 VXE 内部实例完整类型。
  // 初始 undefined：与 useCrossPageGrid 期望的 Ref<... | undefined> 对齐。
  const gridRef = ref<UserGridInstance>();

  // 当前页数据与总数：proxyConfig 模式下数据由 grid 内部管理，
  // 这里在 query 回调中同步出来，供跨页勾选（useCrossPageGrid）判定选中态。
  const currentData = ref<User[]>([]);
  const currentTotal = ref(0);

  const gridOptions = reactive({
    columns: [
      { field: 'name', title: '用户名', sortable: true },
      { field: 'email', title: '邮箱', sortable: true },
      { field: 'role', title: '角色', sortable: true },
      {
        field: 'status',
        title: '状态',
        slots: { default: 'status_default' },
      },
      { field: 'createdAt', title: '创建时间', sortable: true },
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
    // 远程排序：列表数据来自 proxyConfig 的 ajax，排序方向交给后端，
    // 点击表头时 vxe 自动触发 query 并在参数中带上 sorts。
    sortConfig: { remote: true },
    // 行与勾选配置（对齐 theme-preview 中已验证的 VxeTableShowcase）：
    // isHover/isCurrent 让 hover 与点击当前行高亮；checkboxConfig.highlight 让勾选行
    // 加 row--checked 类并高亮（配合主题桥接的勾选行背景）。缺 highlight 时勾选无视觉反馈。
    rowConfig: { isHover: true, isCurrent: true },
    checkboxConfig: { highlight: true },
    proxyConfig: {
      // vxe-table 4.20.x 已将 proxyConfig.props 重命名为 proxyConfig.response，
      // 沿用 props 会触发 delProp 废弃警告，且新版无法据此解析列表与总数字段。
      response: {
        result: 'list',
        total: 'total',
      },
      ajax: {
        query: async ({
          page,
          sorts,
        }: {
          page: { currentPage: number; pageSize: number };
          sorts?: Array<{ field: string; order: 'asc' | 'desc' | null }>;
        }) => {
          // 取首个带方向的排序列（模板按单列排序），转成后端约定的 sortBy/sortOrder 透传。
          const activeSort = sorts?.find((s) => s.order === 'asc' || s.order === 'desc');
          // 封装后直接返回 ApiResponse<UserListResult>，res.data 即列表数据
          const res = await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...(activeSort ? { sortBy: activeSort.field, sortOrder: activeSort.order } : {}),
            ...filters.value,
          });
          // 同步当前页数据与总数，供跨页勾选使用（见 useCrossPageGrid）。
          currentData.value = res.data.list;
          currentTotal.value = res.data.total;
          return res.data;
        },
      },
    },
  });

  function handleSearch() {
    gridRef.value?.commitProxy?.('query');
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

  return {
    gridRef,
    gridOptions,
    filters,
    currentData,
    currentTotal,
    handleSearch,
    resetFilters,
    handleDelete,
  };
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
