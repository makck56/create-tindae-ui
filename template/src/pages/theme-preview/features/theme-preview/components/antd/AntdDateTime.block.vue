<script setup lang="ts">
import { ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';

/**
 * Ant Design Vue「日期 / 时间」展示块。
 *
 * 覆盖 DatePicker / RangePicker / TimePicker / Calendar。
 * 这四个组件底层均依赖 dayjs：中文月份 / 星期文案由 plugins/antd.ts 注入的
 * dayjs locale 提供；选中日 / 今日 / 聚焦态的主色呈现由 bridges/antd.ts 覆盖。
 */
defineOptions({ name: 'AntdDateTimeBlock' });

// 受控值：DatePicker / TimePicker 的值类型为 dayjs.Dayjs
const dateVal = ref<Dayjs>(dayjs('2026-07-07'));
const rangeVal = ref<[Dayjs, Dayjs]>([dayjs('2026-07-01'), dayjs('2026-07-07')]);
// 时间初值带显式 format 解析，避免 'YYYY-MM-DD HH:mm' 这种非 ISO 串被判定为无效日期
const timeVal = ref<Dayjs>(dayjs('2026-07-07 14:30', 'YYYY-MM-DD HH:mm'));
</script>

<template>
  <!-- 日期 DatePicker / 范围 RangePicker -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">
    日期 DatePicker / 范围 RangePicker（选中日 / 今日跟随主色）
  </h4>
  <a-space wrap class="mb-2" :size="16">
    <a-date-picker v-model:value="dateVal" format="YYYY-MM-DD" />
    <a-range-picker v-model:value="rangeVal" />
  </a-space>

  <!-- 时间 TimePicker -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">时间 TimePicker</h4>
  <a-time-picker v-model:value="timeVal" format="HH:mm" />

  <!-- 日历 Calendar -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">
    日历 Calendar（今日 / 选中跟随主色）
  </h4>
  <a-calendar />
</template>
