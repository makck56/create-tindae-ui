/**
 * template.ts 模板数据与渲染单测。
 *
 * 覆盖「概览型 / 表格型」分支：
 *   - prepareTemplateData 按 featureType 派生 typeSuffix（缺省默认 list，向后兼容）
 *   - 概览模板渲染产物含 KPI 统计卡片、不含 vxe-grid（与表格型区分）
 *   - page 模板按 typeSuffix 拼接 View 文件名（同一 page 模板对两类通用）
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  prepareTemplateData,
  renderTemplate,
} from "../../template/scripts/scaffold-core/template";

const baseConfig = {
  domainName: "order-management",
  featureName: "order-overview",
  chineseName: "订单管理",
  featureChineseName: "订单概览",
};

// ============ prepareTemplateData：类型派生 ============

test("prepareTemplateData: 缺省 → 表格型，typeSuffix=List（向后兼容）", () => {
  const data = prepareTemplateData(baseConfig);
  assert.equal(data.featureType, "list");
  assert.equal(data.typeSuffix, "List");
});

test("prepareTemplateData: featureType=overview → typeSuffix=Overview", () => {
  const data = prepareTemplateData({ ...baseConfig, featureType: "overview" });
  assert.equal(data.featureType, "overview");
  assert.equal(data.typeSuffix, "Overview");
});

// ============ 概览型模板渲染 ============

test("renderTemplate: 概览 view 含 KPI 卡片 + 近期列表，不含 vxe-grid", async () => {
  const data = prepareTemplateData({ ...baseConfig, featureType: "overview" });
  const out = await renderTemplate("feature/view-overview.vue.hbs", data);
  // KPI 统计卡片 + 配置常量
  assert.ok(out.includes("a-statistic"));
  assert.ok(out.includes("OrderOverviewSummaryCards"));
  // 近期数据列表
  assert.ok(out.includes("a-table"));
  // 回归：概览型不应出现表格型的 vxe-grid
  assert.ok(!out.includes("vxe-grid"));
});

test("renderTemplate: 表格型 view 含 vxe-grid（未被概览化改造破坏）", async () => {
  const data = prepareTemplateData(baseConfig);
  const out = await renderTemplate("feature/view-list.vue.hbs", data);
  assert.ok(out.includes("vxe-grid"));
});

// ============ page 模板按 typeSuffix 通用 ============

test("renderTemplate: page 模板按 typeSuffix 拼接 View 文件名 / 组件名", async () => {
  // 概览型 → Overview 后缀
  const overviewPage = await renderTemplate(
    "feature/page-list.vue.hbs",
    prepareTemplateData({ ...baseConfig, featureType: "overview" })
  );
  assert.ok(overviewPage.includes("OrderOverviewOverview.view.vue"));
  assert.ok(overviewPage.includes("OrderOverviewOverviewView"));

  // 表格型 → List 后缀（与历史产物一致）
  const listPage = await renderTemplate(
    "feature/page-list.vue.hbs",
    prepareTemplateData(baseConfig)
  );
  assert.ok(listPage.includes("OrderOverviewList.view.vue"));
  assert.ok(listPage.includes("OrderOverviewListView"));
});
