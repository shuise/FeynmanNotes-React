// 页面工具函数
import { Note } from '../types';

/**
 * 格式化文本：将双换行转换为单换行，单换行转换为 <br />
 */
export const plainFormat = (text: string): string => {
  text = text.split('\n\n').join('\n');
  text = text.split('\n').join('<br />');
  return text;
};

// 重新导出 Note 类型以保持向后兼容
export type { Note };

/**
 * 滚动到指定笔记的高亮位置
 */
export const scrollToHL = (note: Note): void => {
  window.scrollTo({
    top: note.y - 100,
    left: note.x,
    behavior: 'smooth'
  });
};

/**
 * 获取页面标题
 * 根据不同网站使用不同的选择器获取标题
 */
export const getTitle = (): string => {
  if (location.host.indexOf(".dedao.cn") > -1) {
    let obj = document.querySelector(".audio-title") || {};
    return (obj as HTMLElement).innerText || "";
  }
  if (location.host.indexOf(".feishu.cn") > -1) {
    let obj = document.querySelector(".op-symbol") || {};
    return (obj as HTMLElement).innerText || "";
  }
  if (location.host.indexOf("notion.so") > -1) {
    let obj = document.querySelector(".notion-topbar .notranslate") || {};
    return (obj as HTMLElement).innerText || "";
  }

  let h1 = document.querySelector("h1") || {};
  let h2 = document.querySelector("h2") || {};
  let h3 = document.querySelector("h3") || {};
  let title:string = (h1 as HTMLElement).innerText || (h2 as HTMLElement).innerText || (h3 as HTMLElement).innerText;
  title = document.title || title || document.body.innerText || '';

  // title 需要不变，才能提供唯一的连续识别依赖。
  title = title.substring(0, 200);
  title = title.split("#").join("");
  title = title.split('"').join("");
  title = title.split('"').join("");

  return title;
};
