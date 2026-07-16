import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import message from 'ant-design-vue/es/message';
import { useAuthStore } from '@/modules/auth';
import { COPY } from '@/shared/constants/copy';
import { useRsaEncrypt } from './useRsaEncrypt';

interface LoginFormState {
  username: string;
  password: string;
  captchaCode: string;
}

export function useLoginForm(redirect: string, onCaptchaRefresh: () => void) {
  const router = useRouter();
  const authStore = useAuthStore();
  const { encryptPassword } = useRsaEncrypt();

  const formState = reactive<LoginFormState>({
    username: '',
    password: '',
    captchaCode: '',
  });

  const loading = computed(() => authStore.loading);

  async function handleLogin() {
    try {
      const encryptedPassword = encryptPassword(formState.password);
      await authStore.login({
        username: formState.username,
        password: encryptedPassword,
        captchaCode: formState.captchaCode,
      });
      router.push(redirect || '/');
    } catch (e: any) {
      console.error('[Login]', e);
      message.error(authStore.error || COPY.LOGIN.LOGIN_FAILED);
      formState.captchaCode = '';
      onCaptchaRefresh();
    }
  }

  return { formState, loading, handleLogin };
}
