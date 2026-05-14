import JSEncrypt from 'jsencrypt';
import { COPY } from '@/shared/constants/copy';

// Mock 阶段使用硬编码公钥，生产环境应从后端获取
const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWJ
RZc9F5Lm+Q7dBfGZ8L8d9K3n9J1W6m2m5d5O4eWd1sZbRnH5S3k9uNmYc1k7hP
uW4F5h3N2F6bK+0vXn9R2dS8c5P3yE0T1rJ6hY7vA8zG9fW4K5c3nB2xM7eL6
Q1dS8hP5yE3rJ9vN6mK4cW2xF7bA8zG0eR4dS1hP6yE3rJ9vN6mK4cW2xF7bA
wIDAQAB
-----END PUBLIC KEY-----`;

export function useRsaEncrypt() {
  function encryptPassword(password: string): string {
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
