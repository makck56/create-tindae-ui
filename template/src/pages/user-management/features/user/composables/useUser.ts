import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { getUserList, getUserDetail, deleteUser } from '../api/user.api';
import type { User, UserListParams, UserStatus, UserRole } from '../models/User';
import { COPY } from '@/shared/constants/copy';

export function useUserList() {
  const loading = ref(false);
  const users = ref<User[]>([]);
  const total = ref(0);
  const pagination = reactive({ page: 1, pageSize: 10 });

  const filters = reactive({
    name: undefined as string | undefined,
    status: undefined as UserStatus | undefined,
    role: undefined as UserRole | undefined,
  });

  async function fetchList() {
    loading.value = true;
    try {
      const params: UserListParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const { data: res } = await getUserList(params);
      users.value = res.data.list;
      total.value = res.data.total;
    } catch {
      message.error(COPY.COMMON.FAILED);
    } finally {
      loading.value = false;
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id);
      message.success(COPY.COMMON.SUCCESS);
      fetchList();
    } catch {
      message.error(COPY.COMMON.FAILED);
    }
  }

  function resetFilters() {
    filters.name = undefined;
    filters.status = undefined;
    filters.role = undefined;
    pagination.page = 1;
    fetchList();
  }

  return { loading, users, total, pagination, filters, fetchList, handleDelete, resetFilters };
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
