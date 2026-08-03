<script setup lang="ts">
import { BgColorsOutlined, BulbFilled, BulbOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { useTheme } from '@/core/theme';

/**
 * 主题切换器 —— 主题系统的「人机入口」。
 *
 * 提供两类操作：
 * 1. 品牌主色预设：点击调色板图标弹出预设色板，点选即换主色（覆盖 primary 色阶）；
 * 2. 亮 / 暗模式：太阳 / 月亮图标一键切换。
 *
 * 全部操作仅修改 theme store 状态，副作用（写 :root 变量）由 ThemeProvider 自动承接，
 * 组件自身不直接操作 DOM，职责单一。
 */
defineOptions({ name: 'ThemeSwitcher' });

const { presets, presetKey, isDark, toggleMode, setPreset } = useTheme();

/** 选择主色预设 */
function handlePreset(key: string): void {
  setPreset(key);
}
</script>

<template>
  <div class="flex items-center gap-1">
    <!-- 品牌主色预设：Popover 弹出色板 -->
    <a-popover trigger="click" placement="bottomRight">
      <template #content>
        <div class="flex items-center gap-2 py-1">
          <button
            v-for="p in presets"
            :key="p.key"
            type="button"
            class="theme-dot"
            :class="{ 'theme-dot--active': p.key === presetKey }"
            :style="{ backgroundColor: p.primary.DEFAULT }"
            :title="p.label"
            :aria-label="`切换主色为${p.label}`"
            @click="handlePreset(p.key)"
          >
            <CheckOutlined v-if="p.key === presetKey" class="theme-dot__check" />
          </button>
        </div>
      </template>
      <a-button type="text" title="主题色" aria-label="选择主题色">
        <template #icon><BgColorsOutlined /></template>
      </a-button>
    </a-popover>

    <!-- 亮 / 暗模式切换 -->
    <a-button
      type="text"
      :title="isDark ? '切换为亮色模式' : '切换为暗色模式'"
      :aria-label="isDark ? '切换为亮色模式' : '切换为暗色模式'"
      @click="toggleMode"
    >
      <template #icon>
        <!-- 亮色态显示「点亮灯泡」（点击变暗）；暗色态显示「熄灭灯泡」（点击变亮） -->
        <BulbFilled v-if="!isDark" />
        <BulbOutlined v-else />
      </template>
    </a-button>
  </div>
</template>

<style scoped>
/* 预设色块：圆形按钮，主题色直接取自预设值（内联），无需依赖全局变量 */
.theme-dot {
  position: relative;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 2px solid var(--border-base);
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.theme-dot:hover {
  transform: scale(1.12);
}

/* 选中态：主色描边 + 主色光晕，强化「当前生效」反馈 */
.theme-dot--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

/* 选中态的对勾图标：用反色（保证在任意主色上都可见） */
.theme-dot__check {
  color: var(--text-inverse);
  font-size: 11px;
}
</style>
