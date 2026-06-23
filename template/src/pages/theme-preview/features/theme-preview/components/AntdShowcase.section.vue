<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

/**
 * Ant Design Vue 组件展示：覆盖主色高频呈现的组件。
 * 切换主色预设时，按钮 / 选择 / 分页 / Tabs / 聚焦态等应跟随变化。全程 Tailwind 工具类。
 */
defineOptions({ name: 'AntdShowcaseSection' });

// 各组件受控状态（用于交互演示）
const checked = ref(true);
const radioVal = ref<string>('a');
const switchOn = ref(true);
const page = ref(3);
const tab = ref('1');
const inputVal = ref('');
const selectVal = ref<string | undefined>(undefined);
const rate = ref(4);
const slider = ref(30);
const progress = ref(66);
const stepCurrent = ref(1);

const selectOptions = [
  { value: 'opt1', label: '选项一' },
  { value: 'opt2', label: '选项二' },
];

function handleClick(): void {
  message.success('操作成功（观察 message 也跟随主题色）');
}
</script>

<template>
  <a-card title="② Ant Design Vue 组件">
    <!-- 按钮 -->
    <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">按钮 Button</h4>
    <a-space wrap class="mb-2">
      <a-button type="primary" @click="handleClick">Primary</a-button>
      <a-button>Default</a-button>
      <a-button type="dashed">Dashed</a-button>
      <a-button type="link">Link</a-button>
      <a-button type="text">Text</a-button>
      <a-button type="primary" danger>Danger</a-button>
      <a-button type="primary" disabled>Disabled</a-button>
      <a-button type="primary" loading>Loading</a-button>
    </a-space>

    <!-- 选择控件 -->
    <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">选择控件</h4>
    <a-space wrap class="mb-2">
      <a-checkbox v-model:checked="checked">Checkbox</a-checkbox>
      <a-radio-group v-model:value="radioVal">
        <a-radio value="a">A</a-radio>
        <a-radio value="b">B</a-radio>
      </a-radio-group>
      <a-radio-group v-model:value="radioVal" button-style="solid">
        <a-radio-button value="a">甲</a-radio-button>
        <a-radio-button value="b">乙</a-radio-button>
      </a-radio-group>
      <a-switch v-model:checked="switchOn" />
    </a-space>

    <!-- 输入（聚焦看主色描边） -->
    <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">输入（点击聚焦观察主色描边）</h4>
    <a-space wrap class="mb-2">
      <a-input v-model:value="inputVal" placeholder="点我聚焦" style="width: 200px" />
      <a-select
        v-model:value="selectVal"
        :options="selectOptions"
        placeholder="请选择"
        style="width: 160px"
        allow-clear
      />
    </a-space>

    <!-- 分页 -->
    <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">分页 Pagination</h4>
    <a-pagination v-model:current="page" :total="50" class="mb-2" />

    <!-- 标签页 -->
    <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">标签页 Tabs</h4>
    <a-tabs v-model:activeKey="tab" class="mb-2">
      <a-tab-pane key="1" tab="标签一">标签一内容</a-tab-pane>
      <a-tab-pane key="2" tab="标签二">标签二内容</a-tab-pane>
    </a-tabs>

    <!-- 标签 / Alert -->
    <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">标签 Tag / 警告提示 Alert</h4>
    <a-space wrap class="mb-2">
      <a-tag color="processing">主色</a-tag>
      <a-tag color="success">成功</a-tag>
      <a-tag color="warning">警告</a-tag>
      <a-tag color="error">危险</a-tag>
    </a-space>
    <a-alert class="mb-2" type="info" show-icon message="信息提示文案" />
    <a-alert class="mb-2" type="success" show-icon message="成功提示文案" />
    <a-alert class="mb-2" type="warning" show-icon message="警告提示文案" />
    <a-alert class="mb-2" type="error" show-icon message="错误提示文案" />

    <!-- 进度 / 步骤 / 评分 / 滑动 -->
    <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">进度 / 步骤 / 评分 / 滑动</h4>
    <a-progress :percent="progress" class="mb-2" />
    <a-steps :current="stepCurrent - 1" size="small" class="mb-2">
      <a-step title="第一步" />
      <a-step title="第二步" />
      <a-step title="第三步" />
    </a-steps>
    <a-space wrap>
      <a-rate v-model:value="rate" />
      <a-slider v-model:value="slider" style="width: 200px" />
      <a-button size="small" @click="stepCurrent = (stepCurrent % 3) + 1">下一步</a-button>
    </a-space>
  </a-card>
</template>
