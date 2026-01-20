import React from 'react';
import type { SharingPanelProps } from '../types';

const SharingPanel: React.FC<SharingPanelProps> = ({
  visible,
  topics,
  article,
  notes,
  feynType,
  onArticleChange,
  onPublish,
  onClose
}) => {
  if (!visible) {
    return null;
  }

  const handleTopicChange = (topicId: string, checked: boolean) => {
    const topicIds = checked
      ? [...article.topicIds, topicId]
      : article.topicIds.filter(id => id !== topicId);
    
    onArticleChange({
      ...article,
      topicIds
    });
  };

  const handlePublicChange = (publicValue: number) => {
    onArticleChange({
      ...article,
      public: publicValue
    });
  };

  const handlePublish = () => {
    if (feynType === 'feynote') {
      // Prepare data for feynote
      if (notes.length === 0) {
        console.log('无笔记数据');
        return;
      }
      
      const paragraphs = notes.map(item => ({
        note: item.text,
        summary: item.tip || '',
        markTime: item.time,
        sort: item.y
      }));
      
      const articleData = {
        ...article,
        paragraphs,
        uniqueId: `${location.host}${article.title}`,
        tagIds: article.topicIds,
        title: article.title.substring(0, 200)
      };
      
      onPublish(articleData);
    } else {
      // Prepare data for weread
      const book = article.target;
      if (!book || !book.bookId) {
        return;
      }
      
      const articleData = {
        ...article,
        title: book.book.title,
        banner: book.book.cover,
        originUrl: `https://weread.qq.com/web/search/books?author=${encodeURIComponent(book.book.author)}`,
        uniqueId: `${location.host}${book.bookId}`
      };
      
      onPublish(articleData);
    }
  };

  return (
    <div className="feynote-login">
      <div className="feynote-topics">
        <div className="feynote-label">话题：</div>
        {topics.map((item, index) => (
          <label key={index} data-label={item.id}>
            <input
              type="checkbox"
              name="article-topics"
              value={item.id}
              checked={article.topicIds.includes(item.id)}
              onChange={(e) => handleTopicChange(item.id, e.target.checked)}
            />
            <span>{item.name}</span>
          </label>
        ))}
        <div style={{ height: '10px' }}></div>
        <div className="feynote-label">范围：</div>
        <label>
          <input
            type="radio"
            name="article-public"
            value={1}
            checked={article.public === 1}
            onChange={(e) => handlePublicChange(parseInt(e.target.value))}
          />
          <span>公开</span>
        </label>
        <label>
          <input
            type="radio"
            name="article-public"
            value={0}
            checked={article.public === 0}
            onChange={(e) => handlePublicChange(parseInt(e.target.value))}
          />
          <span>仅自己可见</span>
        </label>
      </div>
      <div className="feynote-tags">
        <span className="feynote-button" onClick={handlePublish}>
          发布分享
        </span>
        <span onClick={onClose}>取消</span>
      </div>
    </div>
  );
};

export default SharingPanel;
