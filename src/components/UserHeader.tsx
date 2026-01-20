import React from 'react';
import type { UserHeaderProps } from '../types';

const UserHeader: React.FC<UserHeaderProps> = ({
  userName,
  banner,
  isLoggedIn,
  articleUniqueId,
  onBannerChange,
  onLogout
}) => {
  const getUserLink = () => {
    if (articleUniqueId) {
      return `https://notes.bluetech.top/published/${userName}/${articleUniqueId}.html`;
    }
    return `https://notes.bluetech.top/public/home.html?user=${userName}`;
  };

  return (
    <div className="feynote-banner" onClick={onBannerChange}>
      {banner && <img src={banner} alt="" />}
      <div className="feynote-banner-text">
        {userName && (
          <a className="feynote-author" target="_blank" href={getUserLink()}>
            {userName}
          </a>
        )}
        {isLoggedIn && (
          <span className="feynote-logout" onClick={onLogout}>
            退出
          </span>
        )}
      </div>
    </div>
  );
};

export default UserHeader;
