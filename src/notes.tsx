import React, { useState, useEffect } from 'react';


interface Article {
  id: string;
  target: any;
  title: string;
  titleEdit: number;
  topicIds: string[];
  banner: string;
  originUrl: string;
  public: number;
  uniqueId: string;
}

interface UserInfo {
  account: string;
  psw: string;
  password: string;
}

interface Note {
  images: string[];
  text: string;
  tip: string;
  x: number;
  y: number;
  time: number;
  data?: {
    day: string;
    note: string;
    tip?: string;
  };
}

interface Topic {
  id: string;
  name: string;
}

interface CurrentNote {
  open: boolean;
  data: {
    id: string;
    spaceTitle: string;
    day: string;
    note: string;
    summary: string;
    tip?: string;
  };
  qrcode: string;
}

interface Card {
  name: string;
  image: string;
  styleType: string;
  status: string;
  prog: string;
}

interface Book {
  book: {
    title: string;
    author: string;
  };
  noteCount: number;
  bookId: string;
}

interface ArticleItem {
  originUrl: string;
  title: string;
  extra: string;
}

interface NotesProps {
  feynType?: 'close' | 'feynote' | 'weread' | 'linkrs';
  onTransPanel?: (type?: string) => void;
}

function feynmanRequest(data: any, callback: (response: any) => void) {
  //发送创建请求
  chrome.runtime.sendMessage(data, function (response) {
    callback(response);
  });
}

var md5 = require("blueimp-md5");
  
const Notes: React.FC<NotesProps> = (props) => {
  const { feynType: propsFeynType, onTransPanel: propsTransPanel } = props;
  
  // 状态管理
  const [feynType, setFeynType] = useState<'close' | 'feynote' | 'weread' | 'linkrs'>(propsFeynType || 'feynote');
  const [isSharing, setIsSharing] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    account: '',
    psw: '',
    password: ''
  });
  const [token, setToken] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pageId, setPageId] = useState('');
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [article, setArticle] = useState<Article>({
    id: '',
    target: {},
    title: '',
    titleEdit: 0,
    topicIds: [],
    banner: '',
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
  const [card, setCard] = useState<Card>({
    name: '',
    image: '',
    styleType: '',
    status: '',
    prog: '生成中…'
  });
  const [localImage, setLocalImage] = useState('');

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

  const plainFormat = (text: string) => {
    text = text.split('\n\n').join('\n');
    text = text.split('\n').join('<br />');
    return text;
  };

  const scrollToHL = (note: Note) => {
    window.scrollTo({
      top: note.y - 100,
      left: note.x,
      behavior: 'smooth'
    });
  };

  const createCard = (note: Note) => {
    // Implementation from original feynman.js
  };

  const downloadNotes = () => {
    // Implementation from original feynman.js
  };

  const downloadArticle = () => {
    // Implementation from original feynman.js
  };

  const searchBooks = () => {
    // Implementation from original feynman.js
  };

  const createPublicLinkPop = () => {
    if (!token) {
      setIsLogin(true);
      return;
    }
    setIsSharing(true);
  };

  // 页面切换函数
  const transPanel = (type?: string) => {
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
    
    const w = type === 'close' ? 0 : 400;
    document.getElementsByTagName('body')[0].style.paddingRight = `${w}px`;
  };

  const getOneNote = (item: ArticleItem) => {
    const extra = JSON.parse(item.extra || '"{}"');
    const steps = extra.steps || [];
    let note = {} as Note;
    steps.forEach((_note: Note) => {
      if (_note.tip) {
        note = _note;
      }
    });
    if (!note.tip) {
      note = steps[0];
    }
    return note || { text: '', tip: '', images: [], x: 0, y: 0, time: 0 };
  };

  const setCardStyle = (styleType: string) => {
    setCard(prev => ({
      ...prev,
      status: '',
      styleType
    }));
  };

  const createPublicLink = () => {
    // Implementation from original feynman.js
    if (!token) {
      setIsLogin(true);
      return;
    }
    
    if (notes.length === 0) {
      console.log('无笔记数据');
      return;
    }
    
    // Prepare data for API call
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
    
    // Here would be the actual API call to save and publish the article
    console.log('Creating public link:', articleData);
    
    // Mock success response
    setIsSharing(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const userLoginSubmit = async () => {
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
    const hashedPassword = await md5(psw);
    
    // Update userInfo with hashed password
    const loginUserInfo = {
      ...userInfo,
      password: hashedPassword
    };
    
    // Send login request
    feynmanRequest({
      type: "request",
      data: loginUserInfo,
      url: "UserLogin"
    }, function(res) {
      if (res.code === "0") {
        // Login successful
        setToken(res.token);
        setUserInfo(loginUserInfo);
        setIsLogin(false);
        
        // Save user info to localStorage
        localStorage.setItem("user", JSON.stringify(loginUserInfo));
        localStorage.setItem("token", res.token);
      } else {
        // Login failed
        alert(res.msg || '登录失败，请检查用户名和密码');
      }
    });
  };
  
  const shareWeReadBook = () => {
    // Implementation from original feynman.js
    if (!token) {
      setIsLogin(true);
      return;
    }
    
    const book = article.target;
    if (!book || !book.bookId) {
      return;
    }
    
    // Mock implementation based on original code
    const articleData = {
      ...article,
      title: book.book.title,
      banner: book.book.cover,
      originUrl: `https://weread.qq.com/web/search/books?author=${encodeURIComponent(book.book.author)}`,
      uniqueId: `${location.host}${book.bookId}`
    };
    
    // Here would be the actual API call to share the book
    console.log('Sharing WeRead book:', articleData);
    
    // Mock success response
    setIsSharing(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };
       
  return (
		<div className="feynotes" id="feynote-canvas">
			{feynType === 'feynote' && (
				<>
					<div className="feynote-banner" onClick={() => setBanner(true)}>
						{article.banner && <img src={article.banner} alt="" />}
						<div className="feynote-banner-text">
							{userInfo.account && (
								<a className="feynote-author"
									target="_blank"
									href={`https://notes.bluetech.top/published/shuise/${article.uniqueId}.html`}>
									{userInfo.account}
								</a>
							)}
							{token && <span className="feynote-logout" onClick={logout}>退出</span>}
						</div>
					</div>
					<div className="feynote-header">
						{article.titleEdit >= 10 ? (
							<input 
								value={article.title} 
								onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
							/>
						) : (
							<h2 onClick={changeTitle}>{article.title || 'Feynman 笔记'}</h2>
						)}
					</div>
            <div className="feynote-main">
              {notes.map((note, index) => (
                <div key={index} className="feynote-item" data-images={note.images}>
                  <div className="feynote-item-content">
                    <a className="feynote-item-card" onClick={() => createCard(note)}>
                      ✂
                    </a>
                    <span onClick={() => scrollToHL(note)} dangerouslySetInnerHTML={{ __html: plainFormat(note.text) }} />
                  </div>
                  {note.tip && (
                    <div
                      className="feynote-item-remark"
                      onClick={() => scrollToHL(note)}
                      dangerouslySetInnerHTML={{ __html: plainFormat(note.tip) }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="feynote-foot">
              <span className="feynote-btn" onClick={downloadNotes}>笔记</span>
              <span className="feynote-btn" onClick={downloadArticle}>原文</span>
              <span className="feynote-btn" onClick={searchBooks}>相关书籍</span>
              <span className="feynote-btn" onClick={createPublicLinkPop}>分享</span>
              {token && (
                <a href="http://notes.bluetech.top/public/index.html" target="_blank">管理</a>
              )}
              <span className="feynote-btn" onClick={() => transPanel('close')} style={{ marginLeft: '1rem' }}>
                收起
              </span>
            </div>
				</>
			)}

			{feynType === 'weread' && (
				<>
					<div className="feynote-header">
						<h2>
							{userInfo.account && (
								<a
									target="_blank"
									href={`https://notes.bluetech.top/public/home.html?user=${userInfo.account}`}
								>
									{userInfo.account}
								</a>
							)}
							完读书籍
						</h2>
					</div>
					<div className="feynote-foot">
						{token && (
							<a href="http://notes.bluetech.top/public/index.html" target="_blank">管理</a>
						)}
						{token && (
							<span className="feynote-btn" onClick={logout}>
								退出
							</span>
						)}
						<span className="feynote-btn" onClick={() => transPanel('close')}>
							关闭
						</span>
					</div>
				</>
			)}

			{feynType === 'linkrs' && (
				<>
					<div className="feynote-header">
						<h2>可用文章</h2>
					</div>
					<div className="feynote-main">
						{articles.map((item, index) => {
							const note = getOneNote(item);
							return (
								<div key={index} className="feynote-item">
									<div className="feynote-item-content" style={{ textIndent: 0 }}>
										<a href={item.originUrl} target="_blank">
											{item.title}
										</a>
									</div>
									<div className="feynote-item-content" style={{ textIndent: 0 }}>
										{note.text}
									</div>
									{note.tip && (
										<div className="feynote-item-remark">
											{note.tip}
										</div>
									)}
								</div>
							);
						})}
					</div>
					<div className="feynote-foot">
						{token && (
							<a href="http://notes.bluetech.top/public/index.html" target="_blank">管理</a>
						)}
						<span className="feynote-btn" onClick={() => transPanel('close')}>
							关闭
						</span>
					</div>
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
      {isSharing && (
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
                  onChange={(e) => {
                    setArticle(prev => {
                      const topicIds = e.target.checked
                        ? [...prev.topicIds, item.id]
                        : prev.topicIds.filter(id => id !== item.id);
                      return { ...prev, topicIds };
                    });
                  }}
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
                onChange={(e) => setArticle(prev => ({ ...prev, public: parseInt(e.target.value) }))}
              />
              <span>公开</span>
            </label>
            <label>
              <input
                type="radio"
                name="article-public"
                value={0}
                checked={article.public === 0}
                onChange={(e) => setArticle(prev => ({ ...prev, public: parseInt(e.target.value) }))}
              />
              <span>仅自己可见</span>
            </label>
          </div>
          <div className="feynote-tags">
            {feynType === 'feynote' ? (
              <span className="feynote-button" onClick={createPublicLink}>
                发布分享
              </span>
            ) : (
              <span className="feynote-button" onClick={shareWeReadBook}>
                发布分享
              </span>
            )}
            <span onClick={() => setIsSharing(false)}>取消</span>
          </div>
        </div>
      )}

      {/* Login Panel */}
      {isLogin && (
        <div className="feynote-login">
          <div className="feynote-tags">
            <input
              type="text"
              placeholder="账号"
              value={userInfo.account}
              onChange={(e) => setUserInfo(prev => ({ ...prev, account: e.target.value }))}
            />
          </div>
          <div className="feynote-tags">
            <input
              type="password"
              placeholder="密码"
              value={userInfo.psw}
              onChange={(e) => setUserInfo(prev => ({ ...prev, psw: e.target.value }))}
              onBlur={userLoginSubmit}
            />
          </div>
          <div className="feynote-tags">
            <span className="feynote-button" onClick={userLoginSubmit}>
              登录
            </span>
            <a href="https://notes.bluetech.top/public/index.html" target="_blank">注册</a>
            <span onClick={() => setIsLogin(false)}>取消</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;