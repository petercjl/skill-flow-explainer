# 报告 JSON v1
根字段：schemaVersion=1，title，skill，summary，scope，input，output（字符串），sourceHash（来自 source.json），nodes，branches，files，limitations。
nodes 非空，按业务顺序排列：id（字母数字或连字符）、title、purpose、input、output、dependsOn（节点ID数组），items 数组。item：kind（策略/工具/规则/验收），title，text，basis（explicit/code/inferred/runtime），evidence 数组。
evidence：file（源根相对路径）、start/end（1起始行号）、quote（该范围内连续原文）。每项至少一条来源。引用片段与源码快照严格匹配；需要跨段引用则分成多条。
branches 为字符串数组，表达触发、动作和返回点；没有则空。
files：每个库存文件各一项 {path,role,coverage}，coverage 为 full/partial/unread/skipped；partial/unread/skipped 的 role 说明范围或原因。full 表示 Agent 已读取全部，并非采集器已保存。
limitations 为字符串数组，给出未覆盖、未核实和来源冲突。缺失策略写入 limitations，不编造占位证据。
render 生成 HTML 和同名 .receipt.json（实际时间、源码/分析/HTML哈希与自动校验状态）。记录不是目标业务运行证明。所有输出拒绝覆盖；需要修订则另建版本。
