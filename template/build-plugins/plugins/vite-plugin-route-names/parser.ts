/**
 * Vue 文件解析器
 * 使用 @vue/compiler-sfc 解析 Vue SFC 文件
 */

import { parse, type SFCDescriptor } from '@vue/compiler-sfc';
import type { ParsedScriptSetup } from './types.js';

/**
 * 解析 Vue 文件，提取 script setup 信息
 * @param content Vue 文件内容
 * @returns 解析结果
 */
export function parseVueFile(content: string): ParsedScriptSetup | null {
  try {
    const { descriptor } = parse(content, { filename: 'component.vue' });

    if (!descriptor.scriptSetup) {
      return null;
    }

    const scriptContent = descriptor.scriptSetup.content;

    // 查找 defineOptions
    const defineOptionsMatch = findDefineOptions(scriptContent);

    // 查找最后一个 import 语句的位置
    const importEndPos = findLastImportEndPosition(scriptContent);

    return {
      hasDefineOptions: !!defineOptionsMatch,
      componentName: defineOptionsMatch?.name || null,
      scriptContent,
      importEndPosition: importEndPos,
      defineOptionsRange: defineOptionsMatch?.range,
    };
  } catch {
    // 解析失败，返回 null
    return null;
  }
}

/**
 * 在 script 内容中查找 defineOptions
 */
function findDefineOptions(scriptContent: string): {
  name: string | null;
  range: { start: number; end: number };
} | null {
  // 使用正则表达式查找 defineOptions 调用
  // 这个正则支持多行和嵌套花括号
  const defineOptionsRegex = /defineOptions\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
  const match = defineOptionsRegex.exec(scriptContent);

  if (!match) {
    return null;
  }

  const optionsContent = match[1];
  const nameMatch = optionsContent.match(/name\s*:\s*['"`]([^'"`]+)['"`]/);

  return {
    name: nameMatch?.[1] ?? null,
    range: {
      start: match.index,
      end: match.index + match[0].length,
    },
  };
}

/**
 * 查找最后一个 import 语句的结束位置
 */
function findLastImportEndPosition(scriptContent: string): number {
  const lines = scriptContent.split('\n');
  let lastIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) {
      // 计算这一行的结束位置（在原始内容中的位置）
      lastIndex = scriptContent.indexOf(lines[i], lastIndex) + lines[i].length;
    }
  }

  return lastIndex;
}

/**
 * 重建 Vue 文件内容（用于修复场景）
 */
export function rebuildVueFile(
  descriptor: SFCDescriptor,
  newScriptContent: string
): string {
  let result = '';

  // template
  if (descriptor.template) {
    const templateContent = descriptor.template.content;
    result += `<template>${templateContent}</template>\n\n`;
  }

  // script setup
  if (descriptor.scriptSetup) {
    const lang = descriptor.scriptSetup.lang || 'ts';
    result += `<script setup lang="${lang}">\n`;
    result += newScriptContent;
    result += '\n</script>\n';
  }

  // script (普通)
  if (descriptor.script) {
    const lang = descriptor.script.lang || 'ts';
    const scriptContent = descriptor.script.content;
    result += `\n<script lang="${lang}">\n${scriptContent}</script>\n`;
  }

  // styles
  if (descriptor.styles && descriptor.styles.length > 0) {
    descriptor.styles.forEach((style) => {
      const lang = style.lang || 'css';
      const scoped = style.scoped ? ' scoped' : '';
      const styleContent = style.content;
      result += `\n<style lang="${lang}"${scoped}>\n${styleContent}</style>\n`;
    });
  }

  // custom blocks
  if (descriptor.customBlocks && descriptor.customBlocks.length > 0) {
    descriptor.customBlocks.forEach((block) => {
      result += `\n<${block.type}${block.attrs ? ' ' + block.attrs : ''}>\n${block.content}\n</${block.type}>\n`;
    });
  }

  return result;
}
