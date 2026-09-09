/**
 * auto-stack 扩展入口(骨架)
 *
 * 当前阶段: 只保证扩展能被 pi 正常加载, 尚未实现任何功能。
 * 加载约定: pi 用 jiti 加载本文件, 取 default 导出的工厂函数并调用,
 * 传入 ExtensionAPI; 工厂可以是同步函数, 也可以是 async 函数
 * (async 时 pi 会在启动完成前 await, 适合拉取远程配置等一次性初始化)。
 *
 * 常用扩展点(需要时在此注册, 完整清单见 pi 文档 docs/extensions.md):
 *   pi.on(event, handler)           订阅生命周期/工具/输入事件
 *   pi.registerTool(definition)     注册自定义工具
 *   pi.registerCommand(name, opts)  注册 /命令
 *   pi.registerShortcut(key, opts)  注册快捷键
 *   pi.registerFlag(name, opts)     注册 CLI 参数
 *   pi.registerProvider(name, cfg)  注册模型供应商
 *   pi.events.on(channel, fn)       订阅自定义事件通道(与 pi.on 不同, 只收一个参数)
 *
 * 文档与示例定位(不要硬编码路径, 现场推导):
 *   npm root -g  →  <npm root>/@earendil-works/pi-coding-agent/
 *                    ├── docs/extensions.md   扩展 API 全文
 *                    └── examples/extensions/ 可运行示例
 *
 * 需要拆分内部模块时, 在 ../src/ 下新建文件, 由本文件 import 组合注册。
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function autoStack(pi: ExtensionAPI) {
	// TODO: 在此实现 auto-stack 的功能。
	// 骨架阶段不注册任何事件/工具/命令, 以保证加载零副作用。
	void pi;
}
