import JSEncrypt from 'jsencrypt';
import { COPY } from '@/shared/constants/copy';

// Mock 阶段直接返回原文，生产环境应从后端获取公钥
const RSA_PUBLIC_KEY = '';

export function useRsaEncrypt() {
  function encryptPassword(password: string): string {
    if (!RSA_PUBLIC_KEY) {
      return password;
    }
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(RSA_PUBLIC_KEY);
    const encrypted = encrypt.encrypt(password);
    if (!encrypted) {
      throw new Error(COPY.LOGIN.ENCRYPT_FAILED);
    }
    return encrypted;
  }

  return { encryptPassword };
}
