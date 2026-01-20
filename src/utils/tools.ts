// 书籍分析功能：分析全部网页，找出《》书名号的书名，并转化为可点击的 z-lib 链接
export const analyzeBooks = (): void => {
  // 获取所有文本节点（排除已经在 a 标签内的）
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node) => {
        // 跳过 script 和 style 标签内的文本
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
          return NodeFilter.FILTER_REJECT;
        }
        
        // 跳过已经在 a 标签内的文本
        if (parent.tagName === 'A' || parent.closest('a')) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes: Text[] = [];
  let node: Node | null;
  
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }

  // 书名号模式匹配
  const bookPattern = /《([^《|》]+)》/g;
  let convertedCount = 0;

  // 从后往前处理，避免修改 DOM 后索引变化
  for (let i = textNodes.length - 1; i >= 0; i--) {
    const textNode = textNodes[i];
    const text = textNode.textContent || '';
    
    // 检查文本中是否包含书名号
    if (!bookPattern.test(text)) {
      continue;
    }
    
    // 重新匹配（因为 test 会改变 lastIndex）
    bookPattern.lastIndex = 0;
    const matches = Array.from(text.matchAll(bookPattern));
    
    if (matches.length > 0) {
      const parent = textNode.parentElement;
      if (!parent) continue;

      // 创建文档片段来替换文本节点
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      matches.forEach((match) => {
        const fullMatch = match[0]; // 《书名》
        const bookName = match[1]; // 书名
        const matchIndex = match.index !== undefined ? match.index! : text.indexOf(fullMatch, lastIndex);
        
        // 添加书名号之前的文本
        if (matchIndex > lastIndex) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
        }

        // 创建链接元素
        const link = document.createElement('a');
        const searchUrl = `https://zh.z-lib.gd/s/${encodeURIComponent(bookName)}`;
        link.href = searchUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = fullMatch;
        link.style.color = '#0066cc';
        link.style.textDecoration = 'underline';
        link.style.cursor = 'pointer';
        link.title = `在 z-lib 搜索: ${bookName}`;
        fragment.appendChild(link);

        lastIndex = matchIndex + fullMatch.length;
        convertedCount++;
      });

      // 添加剩余的文本
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      // 替换原文本节点
      parent.replaceChild(fragment, textNode);
    }
  }
};

// 链接还原功能：解析全部网页中 a 标签之外的文本，如果有 https url scheme，转化为可点击跳转的 a 链接
export const restoreLinks = (): void => {
  // 获取所有文本节点（排除已经在 a 标签内的）
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node) => {
        // 跳过 script 和 style 标签内的文本
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
          return NodeFilter.FILTER_REJECT;
        }
        
        // 跳过已经在 a 标签内的文本
        if (parent.tagName === 'A' || parent.closest('a')) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes: Text[] = [];
  let node: Node | null;
  
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }

  // URL 模式匹配 - 匹配 https:// 或 http:// 开头的 URL
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]()，。！？、；：""''（）【】《》]+/g;
  let convertedCount = 0;

  // 从后往前处理，避免修改 DOM 后索引变化
  for (let i = textNodes.length - 1; i >= 0; i--) {
    const textNode = textNodes[i];
    const text = textNode.textContent || '';
    
    // 检查文本中是否包含 URL
    if (!urlPattern.test(text)) {
      continue;
    }
    
    // 重新匹配（因为 test 会改变 lastIndex）
    urlPattern.lastIndex = 0;
    const matches = Array.from(text.matchAll(urlPattern));
    
    if (matches.length > 0) {
      const parent = textNode.parentElement;
      if (!parent) continue;

      // 创建文档片段来替换文本节点
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      matches.forEach((match) => {
        const url = match[0];
        const urlIndex = match.index !== undefined ? match.index! : text.indexOf(url, lastIndex);
        
        // 添加 URL 之前的文本
        if (urlIndex > lastIndex) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, urlIndex)));
        }

        // 创建链接元素
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = url;
        link.style.color = '#0066cc';
        link.style.textDecoration = 'underline';
        link.style.cursor = 'pointer';
        fragment.appendChild(link);

        lastIndex = urlIndex + url.length;
        convertedCount++;
      });

      // 添加剩余的文本
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      // 替换原文本节点
      parent.replaceChild(fragment, textNode);
    }
  }
};
