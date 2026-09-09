/**
 * 骨架自检: 不启动 pi 会话, 用 pi 自带的 jiti 加载器直接加载扩展入口,
 * 验证 "能 import + default 导出是函数 + 调用不抛错"。
 *
 * 用法: node scripts/verify.mjs
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "extensions", "index.ts");

/** pi 配置目录: PI_CODING_AGENT_DIR 优先, 默认 ~/.pi/agent */
const agentDir = process.env.PI_CODING_AGENT_DIR ?? join(process.env.HOME ?? "", ".pi", "agent");
const jitiPath = join(agentDir, "npm", "node_modules", "jiti", "lib", "jiti.mjs");

/** pi 包安装目录(用于 alias 解析 @earendil-works/pi-coding-agent) */
function piPackageDir() {
	try {
		return join(execSync("npm root -g", { encoding: "utf8" }).trim(), "@earendil-works", "pi-coding-agent");
	} catch {
		return null;
	}
}

const piDir = piPackageDir();
if (!piDir || !existsSync(piDir)) {
	console.error("✗ 未找到 pi 包安装目录, 请确认 pi 已全局安装(npm root -g)");
	process.exit(1);
}
if (!existsSync(jitiPath)) {
	console.error(`✗ 未找到 pi 自带的 jiti: ${jitiPath}`);
	process.exit(1);
}

const { createJiti } = await import(jitiPath);
const jiti = createJiti(import.meta.url, {
	moduleCache: false,
	alias: { "@earendil-works/pi-coding-agent": join(piDir, "dist", "index.js") },
});

const mod = await jiti.import(entry);
const factory = mod?.default ?? mod;
if (typeof factory !== "function") {
	console.error("✗ 扩展入口的 default 导出不是函数, pi 会忽略该扩展");
	process.exit(1);
}

// 最小 ExtensionAPI stub: 骨架阶段不注册任何东西, 仅确保工厂可调用
const calls = [];
const stub = new Proxy(
	{},
	{
		get: (_t, prop) => (...args) => {
			calls.push(`${String(prop)}(${args.length} args)`);
		},
	},
);

await factory(stub);
console.log("✓ auto-stack 扩展入口加载成功");
console.log(`  入口: ${entry}`);
console.log(`  工厂调用时注册的扩展点: ${calls.length === 0 ? "无(骨架)" : calls.join(", ")}`);
