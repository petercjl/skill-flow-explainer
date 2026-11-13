# 安装交接（供当前 Agent 执行）
用户只需说：请安装 @petercjl/skill-flow-explainer。

1. 识别当前 Agent 的文件、语义分析和命令执行能力。发现 Node.js 22+（可用宿主管理的运行时或 PATH），确认实际入口。
2. 安装 npm 包后读取其 capabilities 和 skill source 结构化结果。npm 安装成功只表示引导 CLI 已可用。
3. 从当前宿主配置或已公布目录解析准确 Skill 目标目录，使用 skill install 的 --target（完整 Skill 目录）和 --agent（当前 Agent 名称）。缺失目录需确认；不替其他 Agent 安装。
4. 安装器复制完整资源与运行时，拒绝覆盖无归属目录和本地修改。通过 skill status 检查 installed、managed、current 及 sha256 verification，再使用返回的 runtimeEntry 验证版本和 doctor。
5. 由宿主刷新/加载 Skill，检查原生发现。CLI 只能声明 hostDiscovery pending，不能替宿主宣称已发现。

执行面以结构化 help/capabilities 为准；所有命令支持 --json。即使禁用了 npm scripts，也使用上述显式交接。失败保留原目录和备份，先读取结构化错误，不通过强制覆盖来消除冲突。
