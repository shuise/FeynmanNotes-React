# 修复 node:module 解析错误 - 完整解决方案

## 问题分析

错误信息显示：
```
ERROR | Could not resolve module "node:module" from "/Volumes/LaCie/projects/FeynmanNotes/node_modules/.pnpm/jiti@2.6.1/node_modules/jiti/lib/jiti.cjs"
```

**根本原因**：
1. `pnpm-lock.yaml` 中仍然锁定 `jiti@2.6.1`，即使配置了 overrides
2. jiti@2.6.1 与 pnpm 的嵌套 node_modules 结构存在兼容性问题
3. overrides 配置需要删除 lockfile 后重新安装才能生效

## 解决方案（必须按顺序执行）

### 步骤 1: 完全清理项目

```bash
cd /Volumes/LaCie/projects/FeynmanNotes

# 删除所有依赖、锁文件和缓存
rm -rf node_modules
rm -rf pnpm-lock.yaml
rm -rf .plasmo
```

### 步骤 2: 清理 pnpm 存储（重要！）

```bash
# macOS
pnpm store prune
rm -rf ~/Library/pnpm/store/v3/files/

# 或者完全清理存储
pnpm store prune --force
```

### 步骤 3: 验证 package.json 配置

确保 `package.json` 中有以下配置：

```json
{
  "pnpm": {
    "overrides": {
      "jiti": "1.16.0"
    }
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 步骤 4: 重新安装依赖

```bash
# 强制重新安装，忽略缓存
pnpm install --force

# 或者使用 --no-frozen-lockfile（如果没有 lockfile）
pnpm install --no-frozen-lockfile
```

### 步骤 5: 验证 jiti 版本

```bash
# 检查实际安装的 jiti 版本
pnpm list jiti

# 或者查看 lockfile
grep "jiti@" pnpm-lock.yaml | head -5
```

应该看到 `jiti@1.16.0` 而不是 `jiti@2.6.1`

### 步骤 6: 运行开发服务器

```bash
pnpm dev
```

## 如果仍然失败

### 方案 A: 直接安装 jiti 1.16.0 作为依赖

```bash
# 先清理
rm -rf node_modules pnpm-lock.yaml .plasmo

# 直接安装特定版本的 jiti
pnpm add -D jiti@1.16.0

# 然后安装其他依赖
pnpm install
```

### 方案 B: 使用 npm 代替 pnpm

```bash
# 删除 pnpm 相关文件
rm -rf node_modules pnpm-lock.yaml .plasmo

# 使用 npm
npm install

# 运行
npm run dev
```

### 方案 C: 使用 resolutions（如果 pnpm 支持）

在 `package.json` 中添加：

```json
{
  "resolutions": {
    "jiti": "1.16.0"
  }
}
```

然后：
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 验证 Node.js 版本

你的 Node.js 版本是 v22.17.0，这是足够的。`node:module` 协议需要 Node.js 14.18.0+，所以版本不是问题。

## 为什么 jiti 1.16.0？

- jiti 1.16.0 是稳定版本，对 `node:module` 有更好的兼容性
- jiti 2.x 版本在 pnpm 环境下存在解析问题
- 1.16.0 版本在 Plasmo 项目中被广泛验证可以正常工作

## 常见问题

### Q: 为什么 overrides 不生效？
A: pnpm overrides 只在重新生成 lockfile 时生效。必须删除 `pnpm-lock.yaml` 并重新安装。

### Q: 删除 lockfile 安全吗？
A: 是的，lockfile 会在 `pnpm install` 时重新生成。但建议先备份。

### Q: 可以使用更新的 jiti 版本吗？
A: 可以尝试，但根据社区反馈，1.16.0 是最稳定的选择。

## 相关链接

- [Plasmo Issue #1188](https://github.com/PlasmoHQ/plasmo/issues/1188)
- [jiti Issue #109](https://github.com/unjs/jiti/issues/109)
