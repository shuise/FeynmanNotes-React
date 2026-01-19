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


const md5 = (function () {
    'use strict';
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i],       7, -680876936);
            d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i],      20, -373897302);
            a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = md5_hh(d, a, b, c, x[i],      11, -358537222);
            c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i],       6, -198630844);
            d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }
    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }
    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            }
            return raw_md5(string);
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
    }
    return md5;
}());


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

  // 获取页面标题
  const getTitle = () => {
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
    let title = (h1 as HTMLElement).innerText || (h2 as HTMLElement).innerText || (h3 as HTMLElement).innerText;
    title = document.title || title || document.body.innerText;

    // title 需要不变，才能提供唯一的连续识别依赖。
    title = title.substr(0, 200);
    title = title.split("#").join("");
    title = title.split("“").join("");
    title = title.split("”").join("");

    return title;
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
  const initPagenote = (extra: any) => {
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

    let topics = [];
    let tagMap = {};
    if (topics.length > 1) {
      md += "\n";
      topics.forEach((item: string) => {
        if (!tagMap[item]) {
          tagMap[item] = item;
          md += `[[${item}]] `;
        }
      });
    }

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

  const searchBooks = () => {
    // Implementation from original feynman.js
    var content = document.body.innerText;
    var pat = new RegExp("《([^《|》]*)》", "g");

    var results = {};
    var res;
    do {
      res = pat.exec(content);
      if (res) {
        results[res[1]] = res[1];
      }
    } while (res);

    var names = [];
    for (var name in results) {
      window.open("https://search.douban.com/book/subject_search?search_text=" + name + "&cat=1001");
    }
  };

  const createCard = (note: Note) => {
    // Implementation from original feynman.js
    console.log('createCard', note);
    // This function would typically open a card creation interface
    // For now, we'll just log the note
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
            />
          </div>
          <div className="feynote-tags">
            <a className="feynote-button" onClick={userLoginSubmit}>
              登录-
            </a>
            <a href="https://notes.bluetech.top/public/index.html" target="_blank">注册</a>
            <span onClick={() => setIsLogin(false)}>取消</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;