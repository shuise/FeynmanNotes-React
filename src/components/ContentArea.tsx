import React from 'react';
import { plainFormat } from '../utils/pageUtils';
import type { ContentAreaProps } from '../types';

const ContentArea: React.FC<ContentAreaProps> = ({
  title,
  notes,
  isEditingTitle,
  onTitleChange,
  onEditTitle,
  onCreateCard,
  onScrollToNote
}) => {
  return (
    <>
      <div className="feynote-header">
        {isEditingTitle ? (
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => onTitleChange(title)}
          />
        ) : (
          <h2 onClick={onEditTitle}>{title || 'Feynman 笔记'}</h2>
        )}
      </div>
      <div className="feynote-main">
        {notes.map((note, index) => (
          <div key={index} className="feynote-item" data-images={note.images}>
            <div className="feynote-item-content">
              <a className="feynote-item-card" onClick={() => onCreateCard(note)}>
                ✂
              </a>
              <span
                onClick={() => onScrollToNote(note)}
                dangerouslySetInnerHTML={{ __html: plainFormat(note.text) }}
              />
            </div>
            {note.tip && (
              <div
                className="feynote-item-remark"
                onClick={() => onScrollToNote(note)}
                dangerouslySetInnerHTML={{ __html: plainFormat(note.tip) }}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ContentArea;
