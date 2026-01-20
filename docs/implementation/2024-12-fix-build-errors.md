# 修复构建错误

## 问题描述

### 1. Sass @import 弃用警告
```
DEPRECATION WARNING [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.
```

### 2. node:module 解析错误
```
ERROR | Could not resolve module "node:module"
```

## 解决方案

### 问题 1: Sass 弃用警告

**原因**: Tailwind CSS v4 不再支持 SCSS/Sass 预处理器。v4 使用纯 CSS 和内置的 CSS 处理引擎。

**解决方法**:
1. 将 `src/index.scss` 改为 `src/index.css`
2. 使用纯 CSS 的 `@import` 语法：
   ```css
   @import "tailwindcss";
   ```
3. 更新所有引用该文件的导入语句

**修改文件**:
- `src/index.scss` → `src/index.css`（删除 .scss，创建 .css）
- `src/popup.tsx`: `import "./index.scss"` → `import "./index.css"`
- `docs/tools.md`: 更新说明文档

### 问题 2: node:module 解析错误

**原因**: jiti@2.6.1 与 pnpm 的嵌套 node_modules 结构存在兼容性问题，无法正确解析 `node:module` 协议。

**解决方法**:
1. **使用 pnpm overrides 降级到稳定版本**（推荐）:
   在 `package.json` 中设置：
   ```json
   {
     "pnpm": {
       "overrides": {
         "jiti": "1.16.0"
       }
     }
   }
   ```
   然后完全清理并重新安装：
   ```bash
   rm -rf node_modules pnpm-lock.yaml .plasmo
   pnpm store prune
   pnpm install
   ```

2. **确保 Node.js 版本 >= 18.0.0**:
   ```bash
   node --version  # 检查版本
   # 如果版本过低，使用 nvm 升级
   nvm install 20
   nvm use 20
   ```

3. **如果问题持续，尝试使用 npm**:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   npm install
   npm run dev
   ```

> 📖 详细的解决方案请参考：[完整解决方案文档](./2024-12-fix-node-module-error.md)

## Tailwind CSS v4 重要变化

### 不再支持预处理器
- Tailwind CSS v4 不再支持 SCSS、Sass、Less 等预处理器
- 框架本身现在充当预处理器，处理：
  - CSS 打包和导入
  - CSS 嵌套（通过 Lightning CSS）
  - 变量管理
  - 供应商前缀

### 新的导入方式
**v3 (旧方式)**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**v4 (新方式)**:
```css
@import "tailwindcss";
```

### 配置方式变化
主题定制现在直接在 CSS 文件中使用 `@theme` 指令：
```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --font-sans: Inter, sans-serif;
}
```

## 修改记录

- ✅ 将 `src/index.scss` 改为 `src/index.css`
- ✅ 更新 `src/popup.tsx` 中的导入
- ✅ 更新 `docs/tools.md` 中的说明
