import { ref, reactive } from 'vue';
import type { VxeGridInstance } from 'vxe-table';
import { message } from 'ant-design-vue';
import { getUserList, getUserDetail, deleteUser } from '../api/user.api';
import type { User, UserStatus, UserRole } from '../models/User';
import { COPY } from '@/shared/constants/copy';

export function useUserList() {
  const filters = ref({
    name: undefined as string | undefined,
    status: undefined as UserStatus | undefined,
    role: undefined as UserRole | undefined,
  });

  const gridRef = ref<VxeGridInstance | null>(null);

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
    pagerConfig: { pageSize: 10 },
    proxyConfig: {
      props: {
        result: 'list',
        total: 'total',
      },
      ajax: {
        query: async ({ page }: { page: { currentPage: number; pageSize: number } }) => {
          const { data: res } = await getUserList({
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
      const { data: res } = await getUserDetail(id);
      user.value = res.data;
    } catch {
      message.error(COPY.COMMON.FAILED);
    } finally {
      loading.value = false;
    }
  }

  return { loading, user, fetchDetail };
}
