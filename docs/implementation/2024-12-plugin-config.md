# 插件配置调整实现细节

## 1. 插件名称修改

### 修改位置
- `package.json`

### 具体修改内容
```json
{
  "name": "feynman-notes",  // 原: "meta-y"
  "displayName": "费曼笔记",  // 原: "MetaY.ai"
  "description": "费曼笔记 - 笔记并不是思考的过程，笔记就是思考本身"  // 原: "MetaY.ai mining extension"
}
```

## 2. 强制侧边栏模式

### 修改位置
- `src/content.tsx` - 移除折叠按钮，始终显示侧边栏
- `src/notes.tsx` - 移除"收起"按钮，禁止关闭操作

### 具体修改内容

#### `src/content.tsx`
- 初始状态从 `'close'` 改为 `'feynote'`，强制显示侧边栏
- 移除了折叠按钮（`feynote-panel-fold`）
- 移除了切换逻辑，侧边栏始终显示

#### `src/notes.tsx`
- 移除了"收起"按钮
- `transPanel` 函数中禁止 `'close'` 操作：
  ```typescript
  if (type === 'close') {
    return; // 忽略关闭操作
  }
  ```
- 添加初始化 `useEffect`，确保页面加载时侧边栏始终显示：
  ```typescript
  useEffect(() => {
    // 确保侧边栏始终显示
    document.getElementsByTagName('body')[0].style.paddingRight = '400px';
    
    // 根据当前域名设置初始类型
    if (location.host === 'weread.qq.com') {
      setFeynType('weread');
    } else if (location.host === 'www.36linkr.com') {
      setFeynType('linkrs');
    } else {
      setFeynType('feynote');
    }
  }, []);
  ```
- 强制设置 `body` 的 `paddingRight` 为 `400px`

### 侧边栏强制显示逻辑
1. `content.tsx` 中初始状态设置为 `'feynote'`，不再支持 `'close'`
2. `notes.tsx` 中：
   - `transPanel` 函数忽略 `'close'` 操作
   - 初始化时自动设置 `body.paddingRight = '400px'`
   - 根据域名自动设置侧边栏类型：
     - `weread.qq.com` → `'weread'`
     - `www.36linkr.com` → `'linkrs'`
     - 其他 → `'feynote'`

## 3. 强制对所有 http/https 协议开启

### 修改位置
- `package.json` - `plasmo.content_scripts[0].matches`

### 当前配置
```json
{
  "plasmo": {
    "content_scripts": [
      {
        "matches": [
          "https://*/*",
          "http://*/*"
        ],
        "run_at": "document_end"
      }
    ]
  }
}
```

### 说明
- 使用 `"https://*/*"` 和 `"http://*/*"` 匹配所有 HTTP/HTTPS 网站
- Content scripts 在 `document_end` 时运行
- 所有 HTTP/HTTPS 网站都会自动加载插件，无需用户手动启用

## 注意事项

1. **侧边栏模式为强制模式**：用户无法关闭侧边栏
2. **侧边栏宽度固定**：为 400px，通过 `body.paddingRight` 为页面内容留出空间
3. **自动加载**：所有 HTTP/HTTPS 网站都会自动加载插件
