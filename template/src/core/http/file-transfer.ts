import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse, DownloadOptions, HttpRequestConfig, UploadOptions } from './types';
import { HttpError } from './error';

/** 从 ProgressEvent 计算 0-100 的百分比；total 未知时返回 0。 */
function computePercent(e: ProgressEvent): number {
  if (!e.total) return 0;
  return Math.min(100, Math.round((e.loaded / e.total) * 100));
}

/**
 * 从响应头 content-disposition 提取文件名。
 * 依次尝试：`filename*= UTF-8''xxx`（RFC 5987，中文友好）→ `filename="xxx"` → `filename=xxx`。
 */
export function extractFilename(disposition: string | undefined, fallback: string): string {
  if (!disposition) return fallback;
  // RFC 5987：filename*= UTF-8''编码后的名字（支持中文）
  const star = /filename\*\s*=\s*[^']*''([^;]+)/i.exec(disposition);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      return star[1];
    }
  }
  // 普通带引号
  const quoted = /filename\s*=\s*"([^"]+)"/i.exec(disposition);
  if (quoted?.[1]) return quoted[1];
  // 不带引号
  const plain = /filename\s*=\s*([^;]+)/i.exec(disposition);
  if (plain?.[1]) return plain[1].trim();
  return fallback;
}

/** 触发浏览器保存 blob 为文件：创建临时 a 链接点击下载，随后释放 ObjectURL 避免内存泄漏。 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 检测 blob 是否实际是「被 blob 包装的 JSON 错误响应」。
 *
 * 背景：下载接口用 responseType: 'blob'，即便服务端返回 JSON 错误（如 { code, message }），
 * axios 也会把它当成 Blob 而不抛错。故需主动读取 blob 内容判断：
 * - 是 JSON 且含 code → 返回业务错误信息；
 * - 否则（真正的文件流）→ 返回 null。
 */
async function parseBlobAsError(blob: Blob): Promise<{ code: number; message?: string } | null> {
  // 只有 content-type 为 json 时才可能是错误响应
  if (blob.type && !blob.type.includes('application/json')) return null;
  try {
    const parsed = JSON.parse(await blob.text());
    if (parsed && typeof parsed.code === 'number') {
      return { code: parsed.code, message: parsed.message };
    }
  } catch {
    // 解析失败说明是真正的二进制文件
  }
  return null;
}

/**
 * 文件下载。
 *
 * 流程：以 responseType: 'blob' 请求 → 检测 blob 是否为错误响应 → 提取文件名
 *      →（默认）触发浏览器保存 → 返回 { blob, filename }。
 *
 * - HTTP 层错误（401/404/500 等）仍由响应拦截器统一处理；
 * - HTTP 200 但 body 是业务错误（{ code, message }）的情况由本函数解析后抛 HttpError。
 *
 * @returns { blob, filename }，blob 可用于本地预览 / 二次处理
 */
export async function downloadFile(
  instance: AxiosInstance,
  url: string,
  options: DownloadOptions = {},
): Promise<{ blob: Blob; filename: string }> {
  const { params, filename, onProgress, autoSave = true, skipAuth, skipErrorHandler } = options;

  // rawResponse: 跳过业务信封解包，拿到完整 AxiosResponse<Blob>
  const response = (await instance.get(url, {
    responseType: 'blob',
    params,
    onDownloadProgress: onProgress
      ? (e: ProgressEvent) => onProgress(computePercent(e))
      : undefined,
    rawResponse: true,
    skipAuth,
    skipErrorHandler,
  } as HttpRequestConfig)) as unknown as AxiosResponse<Blob>;

  // 1. 服务端可能用 blob 包装了 JSON 错误（HTTP 200 但 body 是 { code, message }）
  const bizError = await parseBlobAsError(response.data);
  if (bizError && bizError.code !== 0) {
    throw new HttpError({
      message: bizError.message || '下载失败',
      status: response.status,
      response: bizError,
    });
  }

  // 2. 提取文件名：优先显式传入，其次响应头 content-disposition，最后兜底。
  //    headers 索引值类型是联合（string | string[] | number ...），用 typeof 收敛为 string。
  const dispositionHeader = response.headers['content-disposition'];
  const disposition = typeof dispositionHeader === 'string' ? dispositionHeader : undefined;
  const finalName = filename ?? extractFilename(disposition, `download-${Date.now()}`);

  // 3. 默认触发浏览器保存
  if (autoSave) saveBlob(response.data, finalName);

  return { blob: response.data, filename: finalName };
}

/**
 * 文件上传。
 *
 * 用 FormData 上传：axios 检测到 FormData 会自动设置 multipart/form-data + boundary，
 * **切勿手动设 Content-Type**（否则丢失 boundary 导致解析失败）。
 * 响应仍是业务信封，走正常解包返回 ApiResponse<T>。
 */
export function uploadFile<T = unknown>(
  instance: AxiosInstance,
  url: string,
  data: FormData | Record<string, unknown>,
  options: UploadOptions = {},
): Promise<ApiResponse<T>> {
  const { onProgress, skipAuth, skipErrorHandler, cancelPrevious, headers } = options;

  return instance.post<ApiResponse<T>>(url, data, {
    headers,
    onUploadProgress: onProgress ? (e: ProgressEvent) => onProgress(computePercent(e)) : undefined,
    skipAuth,
    skipErrorHandler,
    cancelPrevious,
  } as HttpRequestConfig) as unknown as Promise<ApiResponse<T>>;
}
