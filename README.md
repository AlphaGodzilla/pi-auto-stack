# pi-auto-stack

pi 扩展(骨架阶段)。**功能待定** —— 当前只提供可被 pi 正常加载的标准扩展目录结构，不注册任何事件、工具或命令，加载零副作用。

## 目录结构

```
pi-auto-stack/
├── package.json          # pi 字段声明扩展入口: pi.extensions = ["./extensions"]
├── README.md
├── extensions/
│   └── index.ts          # 入口: export default (pi: ExtensionAPI) => { ... }
└── scripts/
    └── verify.mjs        # 骨架自检: 不启动 pi 也能验证入口可加载
```

需要拆分内部模块时新建 `src/`，由 `extensions/index.ts` 导入并组合注册（pi 只认 package.json `pi.extensions` 指向的入口）。

## 加载方式

本扩展**未**写入 `~/.pi/agent/settings.json`，按需选择：

```bash
# 1. 临时加载(单次会话): 指向包根, pi 会读 package.json 的 pi.extensions
pi -e ~/.pi/agent/pi-auto-stack
#    也可直接指向入口目录
pi -e ~/.pi/agent/pi-auto-stack/extensions

# 2. 永久加载: 手动把 "pi-auto-stack" 加进 ~/.pi/agent/settings.json 的 packages 数组
#    改完后 pi list 可确认

# 3. 不加入配置, 仅查看已安装扩展
pi list
```

> `~/.pi/agent/extensions/` 下的文件会被自动发现；本目录不在该路径下，所以必须走上面 1 或 2。

## 自检

```bash
cd ~/.pi/agent/pi-auto-stack
node scripts/verify.mjs
```

用 pi 自带的 jiti 加载器直接加载 `extensions/index.ts`，验证「能 import + default 导出是函数 + 调用不抛错」，无需启动 pi 会话。

## 扩展点速查

| 目标 | API | 说明 |
| --- | --- | --- |
| 订阅事件 | `pi.on(event, handler)` | 生命周期(`session_start`/`session_shutdown`)、`tool_call`、`agent_end`、输入事件等 |
| 自定义工具 | `pi.registerTool(definition)` | 参数用 `typebox` 的 `Type` 定义 |
| 命令 | `pi.registerCommand(name, opts)` | 注册 `/name` 命令 |
| 快捷键 / CLI 参数 | `pi.registerShortcut` / `pi.registerFlag` | |
| 模型供应商 | `pi.registerProvider(name, cfg)` | 也可用 async 工厂做启动期动态发现 |
| 自定义事件通道 | `pi.events.on(channel, fn)` | 与 `pi.on` 不同，只收一个参数，返回 unsubscribe |

文档与示例（路径现场推导，不要硬编码）：

```bash
npm root -g   # → <npm root>/@earendil-works/pi-coding-agent/
#   docs/extensions.md      扩展 API 全文(事件清单、ctx.ui、工具定义、TUI 渲染)
#   examples/extensions/    可运行示例(auto-commit-on-exit.ts、permission-gate.ts 等)
```

## 约定

- 工厂函数不要在加载时就启动后台进程/定时器/文件监听；延迟到 `session_start` 或首次用到时，并在 `session_shutdown` 里幂等清理。
- 扩展以完整系统权限运行，只从可信来源引入依赖。
- 需要 npm 依赖时写入 `dependencies`（不是 `devDependencies`，发布安装会 `--omit=dev`），再 `npm install`。
