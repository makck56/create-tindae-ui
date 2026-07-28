/**
 * template.ts 模板数据与渲染单测。
 *
 * 覆盖「概览型 / 表格型」分支：
 *   - prepareTemplateData 按 featureType 派生 typeSuffix（缺省默认 list，向后兼容）
 *   - 概览模板渲染产物含 KPI 统计卡片，不含 vxe-grid
 *   - 列表视图模板继续输出 vxe-grid
 *   - 列表 composable 模板继续输出 gridOptions / proxyConfig / ajax.query
 *   - page 模板按 typeSuffix 拼接 View 文件名
 */
import assert from "node:assert/strict";
import { test } from "node:test";
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

test("prepareTemplateData: 缺省时仍走列表类型并产出 List 后缀", () => {
  const data = prepareTemplateData(baseConfig);
  assert.equal(data.featureType, "list");
  assert.equal(data.typeSuffix, "List");
});

test("prepareTemplateData: overview 会产出 Overview 后缀", () => {
  const data = prepareTemplateData({ ...baseConfig, featureType: "overview" });
  assert.equal(data.featureType, "overview");
  assert.equal(data.typeSuffix, "Overview");
});

test("renderTemplate: 概览 view 输出 KPI 卡片和表格概览，不包含 vxe-grid", async () => {
  const data = prepareTemplateData({ ...baseConfig, featureType: "overview" });
  const out = await renderTemplate("feature/view-overview.vue.hbs", data);

  assert.ok(out.includes("a-statistic"));
  assert.ok(out.includes("OrderOverviewSummaryCards"));
  assert.ok(out.includes("a-table"));
  assert.ok(!out.includes("vxe-grid"));
});

test("renderTemplate: 列表 view 继续输出 vxe-grid", async () => {
  const data = prepareTemplateData(baseConfig);
  const out = await renderTemplate("feature/view-list.vue.hbs", data);

  assert.ok(out.includes("vxe-grid"));
  assert.ok(out.includes("gridOptions"));
  assert.ok(out.includes("handleDelete"));
});

test("renderTemplate: 列表 composable 继续输出 proxy 查询骨架", async () => {
  const data = prepareTemplateData(baseConfig);
  const out = await renderTemplate("feature/composable-list.ts.hbs", data);

  assert.ok(out.includes("gridOptions"));
  assert.ok(out.includes("formConfig: { enabled: false }"));
  assert.ok(out.includes("toolbarConfig: { enabled: false }"));
  assert.ok(out.includes("proxyConfig"));
  assert.ok(out.includes("ajax:"));
  assert.ok(out.includes("query: async"));
});

test("renderTemplate: page 模板按 typeSuffix 拼接 View 文件名", async () => {
  const overviewPage = await renderTemplate(
    "feature/page-list.vue.hbs",
    prepareTemplateData({ ...baseConfig, featureType: "overview" }),
  );
  assert.ok(overviewPage.includes("OrderOverviewOverview.view.vue"));
  assert.ok(overviewPage.includes("OrderOverviewOverviewView"));

  const listPage = await renderTemplate(
    "feature/page-list.vue.hbs",
    prepareTemplateData(baseConfig),
  );
  assert.ok(listPage.includes("OrderOverviewList.view.vue"));
  assert.ok(listPage.includes("OrderOverviewListView"));
});
