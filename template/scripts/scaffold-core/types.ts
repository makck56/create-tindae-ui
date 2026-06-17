/**
 * 脚手架共享类型定义
 */

/**
 * 对「已存在文件」做追加 / 插入修改后的统一结果。
 *
 * 调用方（scaffoldDomain）依据它做两件事：
 *   1. 幂等判断 —— changed=false 且 ok=true 表示目标已存在，无需重复处理；
 *   2. 事务回滚 —— 创建过程出错时，用 originalContent 把文件还原到修改前。
 */
export interface PatchResult {
  /** 操作是否成功完成（含「检测到已存在而跳过」也算成功） */
  ok: boolean;
  /** 是否实际改写了文件内容（跳过 / 失败时为 false） */
  changed: boolean;
  /** 人类可读的原因，用于日志输出 */
  reason?: string;
  /** 修改前的原始内容；changed=true 时必有，供事务回滚还原 */
  originalContent?: string;
  /** 被修改文件的绝对路径；changed=true 时必有，供事务回滚定位 */
  filePath?: string;
}
