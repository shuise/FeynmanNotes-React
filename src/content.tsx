import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Notes from './notes';
import '../feynman.css';
import '../feynman-book.css';

// 注入按钮组件
const FeynmanNoteButton: React.FC = () => {
  // 状态管理
  const [feynType, setFeynType] = useState<string>('close');
  const [notes, setNotes] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // 页面切换函数
  const transPanel = () => {
    setFeynType(feynType === 'close' ? 'feynote' : 'close');
  };

  // 渲染注入按钮和笔记组件
  return (
    <>
      <div className="feynote-panel-fold" style={{ display: isVisible ? 'block' : 'none' }} onClick={() => { 
        setFeynType('feynote');
      }}>
        {notes.length > 0 && <span className="feynote-count">{notes.length}</span>}
        <span className="feynote-button" onClick={transPanel}>Feynman 笔记</span>
      </div>
      {feynType !== 'close' && (
        <Notes 
          feynType={feynType as 'feynote' | 'weread' | 'linkrs'} 
          onTransPanel={(type) => setFeynType(type || 'close')} 
        />
      )}
    </>
  );
};

// 渲染组件到页面
const renderFeynmanNoteButton = () => {
  // 创建根元素
  const rootElement = document.createElement('div');
  rootElement.id = 'feynman-note-root';
  document.body.appendChild(rootElement);

  // 渲染 React 组件
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <FeynmanNoteButton />
    </React.StrictMode>
  );
};

// 初始化
const init = () => {
  renderFeynmanNoteButton();
};

// 页面加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default FeynmanNoteButton;
