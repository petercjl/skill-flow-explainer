# 更新交接（供当前 Agent 执行）
用户只需说：请更新 @petercjl/skill-flow-explainer。

当前 Agent 先解析自己的准确 Skill 目录，检查 status 的归属和修改，再查询 update check。选择准确版本后，由当前安装副本的 CLI 执行 update install，提供 --target、--agent、--version 与 --yes。该操作获取新版包并激活所选目录内的完整运行时；全局 npm 引导 CLI 不会被隐式替换。之后必须使用返回的 activeRuntime，而不是旧引导入口。

安装与更新共用校验和备份；同版本也会修复缺失文件，完全一致时不写入。用户修改会阻止更新，宿主 agents 元数据会保留。更新不改变其他宿主安装。更新后核对新 runtimeEntry、manifest、receipt 的版本和哈希，再由宿主刷新 Skill。

普通任务在 prepare 时最多等待2.5秒检查更新，24小时缓存；仅通知。SKILL_FLOW_UPDATE_CHECK=0 可关闭，SKILL_FLOW_CACHE_DIR 可指定缓存目录。自动安装未启用。

如果获取或同步中断，先调用 update status 查看所选目标旁的操作记录。已获取候选位于记录中的 candidate；通过 update recover（同一 --target、--agent 与 --yes）校验候选身份并重试同步，不再次下载。保留原始备份。完成后核对版本并保存恢复证据，未完成操作不能报告成功。获取失败且无完整候选时，保留错误记录并先排查网络/注册表，不能盲目重试。

首次发布无历史 updater 兼容矩阵；后续发布应测试旧版入口到新版的交接。平台 CI 验证包机制，宿主发现另行验证。
