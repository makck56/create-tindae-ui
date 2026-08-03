import { authHandlers } from './auth';
import { userHandlers } from './user';
import { roleHandlers } from './role';
import { fallbackHandlers } from './fallback';

// handler 顺序很重要：业务 mock 先匹配，兜底 handler 最后处理真正遗漏的 `/api/...`。
export const handlers = [...authHandlers, ...userHandlers, ...roleHandlers, ...fallbackHandlers];
