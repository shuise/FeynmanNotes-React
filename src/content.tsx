import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Notes from './notes';
import './feynman.css';
import './feynman-book.css';
import type { PlasmoGetRootContainer } from 'plasmo';

// 禁用 Shadow DOM，直接使用页面 DOM
export const getRootContainer: PlasmoGetRootContainer = () => {
  // 检查是否已经存在根元素
  const existingRoot = document.getElementById('feynman-note-root');
  if (existingRoot) {
    return existingRoot;
  }
  
  // 创建根元素并添加到 body
  const rootElement = document.createElement('div');
  rootElement.id = 'feynman-note-root';
  document.body.appendChild(rootElement);
  return rootElement;
};

// 注入按钮组件 - 强制侧边栏模式
const FeynmanNoteButton: React.FC = () => {
  // 状态管理 - 强制为侧边栏模式，始终显示
  const [feynType, setFeynType] = useState<string>('feynote');
  const [notes, setNotes] = useState<any[]>([]);

  // 渲染笔记组件 - 强制侧边栏模式，不显示折叠按钮
  return (
    <Notes 
      feynType={feynType as 'feynote' | 'weread' | 'linkrs'} 
      onTransPanel={(type) => {
        // 侧边栏模式不允许关闭，只允许切换类型
        if (type && type !== 'close') {
          setFeynType(type);
        }
      }} 
    />
  );
};

// 全局变量，防止重复注入
let root: ReturnType<typeof createRoot> | null = null;
let rootElement: HTMLElement | null = null;

// 检查元素是否已经有 React root
const hasReactRoot = (element: HTMLElement): boolean => {
  // React 18+ 会在元素上添加 _reactRootContainer 属性
  return !!(element as any)._reactRootContainer;
};

// 渲染组件到页面
const renderFeynmanNoteButton = () => {
  // 获取根容器（由 getRootContainer 提供）
  const currentRootElement = document.getElementById('feynman-note-root');
  if (!currentRootElement) {
    console.warn('Feynman note root element not found');
    return;
  }

  // 如果容器元素改变了，重置 root
  if (rootElement !== currentRootElement) {
    root = null;
    rootElement = currentRootElement;
  }

  // 如果 root 已存在，直接更新渲染
  if (root) {
    root.render(
      <React.StrictMode>
        <FeynmanNoteButton />
      </React.StrictMode>
    );
    return;
  }

  // 检查元素是否已经有 React root（可能由之前的调用创建）
  if (hasReactRoot(currentRootElement)) {
    console.warn('Root element already has a React root. This should not happen.');
    // 如果已经有 root，尝试清理并重新创建
    try {
      // 清空容器内容
      currentRootElement.innerHTML = '';
    } catch (e) {
      console.error('Failed to clear root element:', e);
    }
  }

  // 创建新的 root
  root = createRoot(currentRootElement);
  
  root.render(
    <React.StrictMode>
      <FeynmanNoteButton />
    </React.StrictMode>
  );
};

// 初始化
const init = () => {
  // 等待 getRootContainer 创建根元素
  const checkAndInit = () => {
    const rootElement = document.getElementById('feynman-note-root');
    if (rootElement) {
      renderFeynmanNoteButton();
    } else {
      // 如果根元素还没创建，延迟重试
      setTimeout(checkAndInit, 50);
    }
  };
  
  checkAndInit();
};

// 页面加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

export default FeynmanNoteButton;
