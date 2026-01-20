import React, { useState, useEffect } from 'react';
import UserHeader from './components/UserHeader';
import ContentArea from './components/ContentArea';
import FooterButtons from './components/FooterButtons';
import LoginForm from './components/LoginForm';
import SharingPanel from './components/SharingPanel';
import { md5 } from './libs/md5-browser';
import { plainFormat, scrollToHL, getTitle } from './utils/pageUtils';
import type {
  Article,
  UserInfo,
  Topic,
  CurrentNote,
  Card,
  Book,
  ArticleItem,
  NotesProps,
  Note
} from './types';

function feynmanRequest(data: any, callback: (response: any) => void) {
  //发送创建请求
  console.log('feynmanRequest', data);
  chrome.runtime.sendMessage(data, function (response) {
    callback(response);
  });
}
  
const Notes: React.FC<NotesProps> = (props) => {
  const { feynType: propsFeynType, onTransPanel: propsTransPanel } = props;
  
  // 状态管理
  const [feynType, setFeynType] = useState<'close' | 'feynote' | 'weread' | 'linkrs'>(propsFeynType || 'feynote');
  const [isSharing, setIsSharing] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // 从本地存储读取 token 和用户信息
  const initialUserInfo = JSON.parse(localStorage.getItem('user') || '{}') as UserInfo;
  const initialToken = localStorage.getItem('token') || '';
  
  const [userInfo, setUserInfo] = useState<UserInfo>({
    account: initialUserInfo.account || '',
    psw: '',
    password: initialUserInfo.password || ''
  });
  const [token, setToken] = useState(initialToken);
  const [isLogin, setIsLogin] = useState(initialToken !== "");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pageId, setPageId] = useState('');
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [article, setArticle] = useState<Article>({
    id: '',
    target: {},
    title: '',
    titleEdit: 0,
    topicIds: [],
    banner: 'https://notes.bluetech.top/proxy?url=https://notes.bluetech.top/libs/covers/3.png',
    originUrl: '',
    public: 1,
    uniqueId: ''
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [currentNote, setCurrentNote] = useState<CurrentNote>({
    open: false,
    data: {
      id: '',
      spaceTitle: '',
      day: '',
      note: '',
      summary: ''
    },
    qrcode: ''
  });
  
  // 当外部feynType变化时，更新内部状态
  useEffect(() => {
    if (propsFeynType) {
      setFeynType(propsFeynType);
    }
  }, [propsFeynType]);

  const setBanner = (refresh: boolean) => {
    // Implementation from original feynman.js
  };

  const logout = () => {
    setUserInfo({ account: '', psw: '', password: '' });
    setToken('');
  };

  const changeTitle = () => {
    setArticle(prev => ({
      ...prev,
      titleEdit: prev.titleEdit + 1
    }));
  };

  // 从云端获取笔记
  const initPagenoteFormCloud = (callback: (data?: any) => void) => {
    let title = getTitle();
    let host = location.host;
    let uniqueId = md5(title + host);
    console.log("Article.info", host + "-" + uniqueId + "-" + title);

    feynmanRequest(
      {
        api: "Article.notes",
        type: "request",
        token: token,
        data: {
          uniqueId: uniqueId,
        },
      },
      function (res) {
        console.log("Article.notes uniqueId", uniqueId);
        console.log("Article.notes", res);
        let data = res.data || {};
        let notes = data.paragraphs || [];

        let extra = data.extra || "{}";
        extra = JSON.parse(extra);
        extra.steps = extra.steps || [];

        // 与本地合并
        let pageId = md5(location.href);
        let isSamePage = extra.pageId == pageId;

        // 从本地存储获取数据
        let dataCache = JSON.parse(localStorage.getItem(pageId) || "{}");
        let stepsCache = dataCache.steps || [];

        if (isSamePage && extra.steps.length > 0 && stepsCache.length > 0) {
          // 合并笔记
          let noteMap: { [key: string]: any } = {};
          extra.steps.forEach((item: any) => {
            let key = md5(item.text);
            noteMap[key] = item;
          });
          
          stepsCache.forEach((item: any) => {
            let key = md5(item.text);
            if (!noteMap[key]) {
              extra.steps.push(item);
            }
          });
          
          notes.forEach((item: any) => {
            let key = md5(item.note);
            if (noteMap[key]) {
              let isModified = new Date(item.updatedAt).getTime() > noteMap[key]["time"];
              if (isModified) {
                noteMap[key]["tip"] = item.summary;
              }
            }
          });
        }

        callback(data);
      },
    );
  };

  // 初始化笔记工具
  const initPagenote = (extra?: any) => {
    let pageId = md5(location.href, '', '');
    if(typeof extra === 'string') {
      extra = JSON.parse(extra);
    }
    extra = extra || {};
    extra.steps = extra.steps || [];

    // 从本地存储获取数据
    let data = JSON.parse(localStorage.getItem(pageId) || "{}");
    if (extra.steps.length > 0) {
      data = extra;
    }
    
    // 设置 pageId
    setPageId(pageId);
    
    // 更新 article 信息
    setArticle(prev => ({
      ...prev,
      title: getTitle(),
      originUrl: location.href
    }));

    // 更新笔记列表
    setNotes(data.steps || []);

    // 如果支持 PageNote SDK，则初始化
    if (window.PageNote && !window.pagenote) {
      window.pagenote = new window.PageNote("Feynman", {
        functionColors: [
          // 支持扩展的功能按钮区，
        ],
        categories: [],
        brushes: [
          // 画笔
          {
            bg: "#FF6900", // rgb 颜色值
            shortcut: "p", // 快捷键，可选
            label: "一级画笔", // 说明
            level: 1, // 暂不支持
          },
        ],
        showBarTimeout: 0, // 延迟功能时间 单位毫秒
        renderAnnotation: function (data: any, light: any) {
          // 自定义笔记渲染逻辑
          const element = document.createElement("div");
          const { tip, lightId, time } = data;
          const aside = document.createElement("div");
          aside.innerHTML = `<pagenote-block aria-controls="aside-info">
            ${new Date(time).toLocaleDateString()}
            </pagenote-block>`;
          element.appendChild(aside);

          element.ondblclick = function () {
            light.openEditor();
          };

          const asides: any[] = [];
          return [null, asides];
        },
        debug: false,
        enableMarkImg: true,
      });

      // 初始化 PageNote
      window.pagenote.init(data);

      // 添加监听器
      window.pagenote.addListener(function (status: any) {
        console.log("pagenote", status);
        let steps = window.pagenote.plainData.steps || [];
        let isSameCount = steps.length == notes.length;

        if (status === window.pagenote.CONSTANT.SYNCED) {
          // 更新笔记列表
          setNotes(steps);
          
          // 保存到本地存储
          localStorage.setItem(pageId, JSON.stringify(window.pagenote.plainData));
        }
      });
    }
  };

  // 刷新笔记列表
  const notesRefresh = (data: any) => {
    setNotes(data.steps || []);
  };

  // 保存笔记到服务器
  const noteSaveToServer = (callback: () => void) => {
    // 实现保存笔记到服务器的逻辑
    console.log("noteSaveToServer called");
    callback();
  };

  // 初始化时强制显示侧边栏和设置类型
  useEffect(() => {
    // 确保侧边栏始终显示（只设置一次）
    const body = document.getElementsByTagName('body')[0];
    if (body && !body.style.paddingRight) {
      body.style.paddingRight = '400px';
    }
    
    // 根据当前域名设置初始类型
    if (location.host === 'weread.qq.com') {
      setFeynType('weread');
    } else if (location.host === 'www.36linkr.com') {
      setFeynType('linkrs');
    } else {
      setFeynType('feynote');
    }
  }, []);

  // 页面加载时从云端恢复笔记
  useEffect(() => {
    // 只有登录用户才从云端恢复笔记
    if (token) {
      initPagenoteFormCloud((data) => {
        initPagenote(data?.extra);
      });
    } else {
      // 未登录用户从本地存储恢复笔记
      initPagenote();
    }
  }, [token]);

  const createPublicLinkPop = () => {
    if (!token) {
      setIsLogin(true);
      return;
    }
    setIsSharing(true);
  };

  // 页面切换函数 - 强制侧边栏模式，不允许关闭
  const transPanel = (type?: string) => {
    // 强制侧边栏模式，不允许关闭
    if (type === 'close') {
      return; // 忽略关闭操作
    }
    
    let pageName = 'feynote';
    if (location.host === 'weread.qq.com') {
      pageName = 'weread';
      // loadBooks();
    }
    if (location.host === 'www.36linkr.com') {
      pageName = 'linkrs';
      // loadArticles();
    }
    
    const newType = type || pageName as any;
    setFeynType(newType);
    
    // 如果有外部传入的transPanel函数，调用它
    if (propsTransPanel) {
      propsTransPanel(newType);
    }
    
    // 确保侧边栏始终显示（避免重复设置）
    const body = document.getElementsByTagName('body')[0];
    if (body && body.style.paddingRight !== '400px') {
      body.style.paddingRight = '400px';
    }
  };


  const handlePublish = (articleData: any) => {
    // Here would be the actual API call to save and publish the article
    console.log('Publishing article:', articleData);
    
    // Mock success response
    setIsSharing(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const userLoginSubmit = async () => {
    console.log('userLoginSubmit', userInfo)
    // Implementation from original feynman.js
    const { account, psw } = userInfo;
    
    if (!account || !psw) {
      alert('请输入用户名和密码');
      return;
    }
    
    // Username validation: 6-50 characters, letters, numbers, underscores, hyphens
    const accountPattern = /^[a-zA-Z0-9_-]{6,50}$/;
    if (!accountPattern.test(account)) {
      alert('用户名只允许使用字母、数字、下划线和减号，长度为 6~50');
      return;
    }
    
    // Password validation: 10-50 characters, letters, numbers, underscores, hyphens
    const pswPattern = /^[a-zA-Z0-9_-]{10,50}$/;
    if (!pswPattern.test(psw)) {
      alert('密码只允许使用字母、数字、下划线和减号，长度为 10~50');
      return;
    }
    
    // Hash the password using the implemented md5 function
    const hashedPassword = md5(psw, '', '');
    
    // Update userInfo with hashed password
    const loginUserInfo = {
      ...userInfo,
      password: hashedPassword
    };
    
    // Send login request
    feynmanRequest({
      type: "request",
      data: loginUserInfo,
      api: "User.login"
    }, function(res) {
      if (res.code === "0") {
        console.log('登录成功', res);
        // Login successful
        setToken(res?.data?.token);
        setUserInfo(loginUserInfo);
        setIsLogin(false);
        
        // Save user info to localStorage
        localStorage.setItem("user", JSON.stringify(loginUserInfo));
        localStorage.setItem("token", res?.data?.token || '');
      } else {
        // Login failed
        alert(res.msg || '登录失败，请检查用户名和密码');
      }
    });
  };
  
       
  return (
		<div className="feynotes" id="feynote-canvas">
			{feynType === 'feynote' && (
				<>
					{/* 顶部用户区组件 */}
					<UserHeader
						userName={userInfo.account}
						banner={article.banner}
						isLoggedIn={!!token}
						articleUniqueId={article.uniqueId}
						onBannerChange={() => setBanner(true)}
						onLogout={logout}
					/>
					
					{/* 内容区组件：图片 + 标题 + 链接 + 笔记列表 */}
					<ContentArea
						title={article.title}
						notes={notes}
						isEditingTitle={article.titleEdit >= 10}
						onTitleChange={(title) => setArticle(prev => ({ ...prev, title }))}
						onEditTitle={changeTitle}
						onCreateCard={(note) => console.log('createCard', note)}
						onScrollToNote={scrollToHL}
					/>

					{/* 底部按钮区组件 */}
          <FooterButtons
            article={article}
            notes={notes}
						isLoggedIn={!!token}
						showMoreTools={true}
						onDownloadArticle={() => {}}
						onShare={createPublicLinkPop}
						onRequireLogin={() => setIsLogin(true)}
					/>
				</>
			)}


      {/* Save Success Message */}
      {saved && (
        <div className="feynote-login">
          <div className="feynote-topics">
            <div className="feynote-label"></div>
            <label>保存成功！</label>
          </div>
        </div>
      )}

      {/* Sharing Panel */}
      <SharingPanel
        visible={isSharing}
        topics={topics}
        article={article}
        notes={notes}
        feynType={feynType}
        onArticleChange={setArticle}
        onPublish={handlePublish}
        onClose={() => setIsSharing(false)}
      />

      {/* 登录组件 */}
      <LoginForm
        visible={isLogin}
        onLogin={async (account, password) => {
          // 更新用户信息
          const updatedUserInfo = {
            ...userInfo,
            account,
            psw: password
          };
          setUserInfo(updatedUserInfo);
          
          // 执行登录
          const accountPattern = /^[a-zA-Z0-9_-]{6,50}$/;
          if (!accountPattern.test(account)) {
            alert('用户名只允许使用字母、数字、下划线和减号，长度为 6~50');
            return;
          }
          
          const pswPattern = /^[a-zA-Z0-9_-]{10,50}$/;
          if (!pswPattern.test(password)) {
            alert('密码只允许使用字母、数字、下划线和减号，长度为 10~50');
            return;
          }
          
          const hashedPassword = md5(password, '', '');
          const loginUserInfo = {
            ...updatedUserInfo,
            password: hashedPassword
          };
          
          feynmanRequest({
            type: "request",
            data: loginUserInfo,
            api: "User.login"
          }, function(res) {
            if (res.code === "0") {
              setToken(res?.data?.token);
              setUserInfo(loginUserInfo);
              setIsLogin(false);
              localStorage.setItem("user", JSON.stringify(loginUserInfo));
              localStorage.setItem("token", res?.data?.token || '');
            } else {
              alert(res.msg || '登录失败，请检查用户名和密码');
            }
          });
        }}
        onCancel={() => setIsLogin(false)}
      />
    </div>
  );
};

export default Notes;