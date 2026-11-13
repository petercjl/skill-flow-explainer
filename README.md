# Skill 流程与策略解读器
将一个 Skill 的源码，整理成左侧业务流程、右侧对应策略的离线 HTML 报告。结论附源码依据，支持搜索、分类筛选与证据展开。

把以下提示词发送给当前使用的 Agent：

安装：请安装 @petercjl/skill-flow-explainer。

使用：请用 Skill 流程解读器分析 product-review-analysis，生成 HTML 报告。

更新：请更新 @petercjl/skill-flow-explainer。

需要当前 Agent 能读取本地 Skill、执行 Node.js 22+ 并进行语义分析。被分析 Skill 始终只读，报告不等于业务执行测试。无模型 API 密钥或独立收费服务。

安装前阅读 [INSTALL.md](INSTALL.md)，更新前阅读 [UPDATE.md](UPDATE.md)。npm 提供引导 CLI；完整安装还包括当前 Agent 的独立 Skill 和运行时副本及宿主发现验证。通用适配不限制 Agent 名称，实际宿主验证记录与适用能力范围分开。
