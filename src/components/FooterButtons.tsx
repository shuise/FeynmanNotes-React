import React from 'react';
import type { FooterButtonsProps, Note } from '../types';

// 直接导入工具函数，避免模块解析问题
import * as tools from '../utils/tools';

const FooterButtons: React.FC<FooterButtonsProps> = ({
  article,
  notes,
  isLoggedIn,
  showMoreTools = true,
  onDownloadArticle,
  onShare,
  onRequireLogin,
  onClose
}) => {
  const handleShare = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    onShare();
  };


  const downloadArticle = () => {
    // Implementation from original feynman.js
    var documentClone = document.cloneNode(true);
    // @ts-ignore
    var articleData = new Readability(documentClone).parse();
    let html = articleData.content;
    // @ts-ignore
    let md = html2md(html);
    md += `

 来源：${location.href} 

`;

    let zkCard = new Date().getTime();
    let fileName = articleData.title || zkCard;
    fileName = fileName + ".md";
    let file = new File([md], fileName, { type: "text/plain" });
    let objectUrl = URL.createObjectURL(file);
    
    const downIframe = document.createElement("iframe");
    downIframe.id = downIframe.name = "f_downIframe";
    const tmpLink = document.createElement("a");
    tmpLink.href = objectUrl;
    tmpLink.target = "f_downIframe";
    tmpLink.download = fileName;
    document.body.appendChild(tmpLink);
    tmpLink.click();

    document.body.removeChild(tmpLink);
    URL.revokeObjectURL(objectUrl);
  };

  const createMD = () => {
    // Implementation from original feynman.js
    let tpls = {
      article: `# {title} 

 原文：{originUrl} 
`,
      banner: `
 ![]({banner} "") 

`,
      topics: "[[{topic}]]",
      notes: `

 {text} 
 > {tip}`
    };

    let md = tpls.article
      .replace(/{title}/g, article.title)
      .replace(/{originUrl}/g, article.originUrl);

    // Note: topics 功能暂时注释，因为需要从外部传入
    // let topics: string[] = [];
    // let tagMap: { [key: string]: string } = {};
    // if (topics.length > 1) {
    //   md += "\n";
    //   topics.forEach((item: string) => {
    //     if (!tagMap[item]) {
    //       tagMap[item] = item;
    //       md += `[[${item}]] `;
    //     }
    //   });
    // }

    if (article.banner) {
      md += tpls.banner.replace(/{banner}/g, article.banner);
    }

    notes.forEach((item: Note) => {
      md += `

 ${item.text}`;
      if (item.tip) {
        md += `
 > ${item.tip || ""}`;
      }
    });

    md += "\n\n\n";
    return md;
  };

  const downloadNotes = () => {
    // Implementation from original feynman.js
    let md = createMD();

    if (notes.length === 0) {
      console.log('无笔记数据');
      return;
    }

    let zkCard = new Date().getTime();
    let fileName = article.title || zkCard;
    fileName = fileName + "-笔记.md";
    let file = new File([md], fileName, { type: "text/plain" });
    let objectUrl = URL.createObjectURL(file);
    
    const downIframe = document.createElement("iframe");
    downIframe.id = downIframe.name = "f_downIframe";
    const tmpLink = document.createElement("a");
    tmpLink.href = objectUrl;
    tmpLink.target = "f_downIframe";
    tmpLink.download = fileName;
    document.body.appendChild(tmpLink);
    tmpLink.click();

    document.body.removeChild(tmpLink);
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="feynote-foot">
      <span className="feynote-btn" onClick={downloadArticle}>
        笔记
      </span>
      <span className="feynote-btn" onClick={downloadNotes}>
        原文
      </span>
      <span
        className={`feynote-btn ${!isLoggedIn ? 'disabled' : ''}`}
        onClick={handleShare}
      >
        分享
      </span>
      {showMoreTools && (
        <span className="feynote-btn" onClick={tools.analyzeBooks}>
          书籍分析
        </span>
      )}
      {showMoreTools && (
        <span className="feynote-btn" onClick={tools.restoreLinks}>
          链接还原
        </span>
      )}
      {isLoggedIn && (
        <a href="http://notes.bluetech.top/public/index.html" target="_blank">
          管理
        </a>
      )}
      {onClose && (
        <span className="feynote-btn" onClick={onClose}>
          收起
        </span>
      )}
    </div>
  );
};

export default FooterButtons;
