import type { InternalAxiosRequestConfig } from 'axios';

/**
 * 生成请求唯一标识 key：method + url + 序列化后的 params / data。
 * 相同 key 即视为「同一请求的重复触发」，是 cancelPrevious 判定重复的依据。
 *
 * 不序列化 headers / 自定义字段，避免无关差异导致 key 抖动。
 */
export function buildRequestKey(config: InternalAxiosRequestConfig): string {
  const method = (config.method ?? 'get').toUpperCase();
  const url = config.url ?? '';
  return `${method}|${url}|${stableStringify(config.params)}|${stableStringify(config.data)}`;
}

/**
 * 稳定序列化：对象按 key 排序后 JSON 化，保证「同内容、不同书写顺序」产出相同字符串。
 * 非对象（string / undefined 等）直接返回字符串形式。
 */
function stableStringify(value: unknown): string {
  if (value == null || typeof value !== 'object') return String(value ?? '');
  try {
    return JSON.stringify(sortKeys(value));
  } catch {
    return String(value);
  }
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((value as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * 进行中请求管理器：维护 key → AbortController 映射。
 *
 * 核心能力：当相同 key 的新请求发起时，自动 abort 旧请求（只保留最新），
 * 从根源消除 Race Condition——旧响应不再有机会到达调用方、覆盖新响应。
 */
export class PendingRequestManager {
  private readonly pending = new Map<string, AbortController>();

  /**
   * 登记一个进行中请求：
   * 1. 若已有相同 key 的旧请求，立即 abort 它；
   * 2. 为当前请求创建 AbortController，挂到 config.signal 上使 axios 可被取消；
   * 3. 返回该 controller，供响应结束时按「身份」清理（避免误删覆盖它的新请求）。
   */
  add(key: string, config: InternalAxiosRequestConfig): AbortController {
    const prev = this.pending.get(key);
    if (prev) {
      prev.abort();
    }
    const controller = new AbortController();
    config.signal = controller.signal;
    this.pending.set(key, controller);
    return controller;
  }

  /**
   * 请求结束（成功 / 失败 / 被取消）后清理登记。
   * 关键：仅当 Map 中该 key 对应的 controller 仍是「自己」时才删除——
   * 因为被取消的旧请求结束清理时，Map[key] 可能已被新请求覆盖，此时不能误删新请求。
   */
  remove(key: string, controller: AbortController): void {
    if (this.pending.get(key) === controller) {
      this.pending.delete(key);
    }
  }

  /** 取消所有进行中请求（如路由切换时批量清理）。 */
  cancelAll(): void {
    this.pending.forEach((controller) => controller.abort());
    this.pending.clear();
  }
}
