import React, { useState } from 'react';
import type { LoginFormProps } from '../types';

const LoginForm: React.FC<LoginFormProps> = ({ visible, onLogin, onCancel }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!account || !password) {
      alert('请输入账号和密码');
      return;
    }
    onLogin(account, password);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (!visible) return null;

  return (
    <div className="feynote-login">
      <div className="feynote-tags">
        <input
          type="text"
          placeholder="账号"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="feynote-tags">
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="feynote-tags">
        <span className="feynote-button" onClick={handleLogin}>
          登录
        </span>
        <a href="https://notes.bluetech.top/public/index.html" target="_blank">
          注册
        </a>
        <span onClick={onCancel}>取消</span>
      </div>
    </div>
  );
};

export default LoginForm;
