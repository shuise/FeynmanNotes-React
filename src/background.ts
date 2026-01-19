//API list
const domain: string = "https://notes.bluetech.top/api";

interface APIsType {
  User: {
    login: string;
  };
  Topic: {
    list: string;
  };
  Article: {
    add: string;
    detail: string;
    notes: string;
    publish: string;
    list: string;
  };
  weRead: {
    books: string;
    notes: string;
    summarys: string;
  };
  translator: {
    deepl: string;
    baidu: string;
  };
}

const APIs: APIsType = {
  User: {
    login: "post@/user/login",
  },
  Topic: {
    list: "get@/tag",
  },
  Article: {
    add: "post@/article",
    detail: "get@/article/{id}",
    notes: "get@/article/item",
    publish: "post@/article/{id}/published",
    list: "get@/article/query",
  },
  weRead: {
    books: "get@https://i.weread.qq.com/user/notebooks",
    notes: "get@https://i.weread.qq.com/book/bookmarklist?bookId={bookId}",
    summarys: "get@https://weread.qq.com/web/review/list?bookId={bookId}&listType=11&maxIdx=0&count=0&listMode=2&synckey=0&userVid=387886832&mine=1",
  },
  translator: {
    deepl: "post@https://www2.deepl.com/jsonrpc?client=chrome-extension,0.18.2",
    baidu: "get@https://fanyi-api.baidu.com/api/trans/vip/translate",
  },
};

interface FeynmanRequestParams {
  api: string;
  data?: any;
  token?: string;
  type?: string;
  name?: string;
  value?: any;
}

interface FeynmanResponse {
  code?: string | number;
  msg?: string;
  [key: string]: any;
}

interface ResultCheckCallback {
  (err: any, res: FeynmanResponse): void;
}

const feynmanRequestServer = function (params: FeynmanRequestParams, callback: ResultCheckCallback): void {
  let key = params.api || "";
  if (!key) {
    return;
  }

  let keys = key.split(".");
  let url = APIs[keys[0] as keyof typeof APIs][keys[1] as keyof typeof APIs[keyof typeof APIs]] as string;
  let urls = url.split("@");
  let method = urls[0].toUpperCase();
  let api = urls[1];
  // console.log(api, urls[1].indexOf('http'));
  if (urls[1].indexOf("http") != 0) {
    api = domain + urls[1];
  }
  let data = params.data || {};

  if (data.constructor.name == "Object") {
    api = subs(api, data);
  }

  let r = new Date().getTime();
  if (method == "GET") {
    if (api.indexOf("?") == -1) {
      api += "?t=" + r;
    } else {
      api += "&t=" + r;
    }
    for (var prop in data) {
      api = api + "&" + prop + "=" + data[prop];
    }
  }

  let requestParams: RequestInit = {
    headers: new Headers({
      "Content-Type": "application/json",
      token: params.token || "",
    }),
    method: method,
    credentials: "include",
  };

  if (method != "GET") {
    data.r = r;
    requestParams.body = JSON.stringify(data);
  }

  // console.log(api, requestParams);

  fetch(api, requestParams)
    .then(function (response: Response) {
      //打印返回的json数据
      // console.log(api, response);
      response.json().then(function (result: FeynmanResponse) {
        resultCheck(result, callback);
      });
    })
    .catch(function (e: any) {
      resultCheck(
        {
          code: "fail",
          msg: e,
        },
        callback,
      );
    });

  function resultCheck(result: FeynmanResponse, callback: ResultCheckCallback): void {
    // console.log('11111111111',result, callback);
    if (result.code == "0") {
      callback(null, result);
    } else if (result.code == -1006) {
      console.log("账号过期，请重新登录");
      // localStorage.clear();
      location.href = "./index.html?t=" + Math.random();
    } else {
      callback(null, result);
    }
  }

  function subs(temp: string, data: any, regexp?: RegExp): string {
    if (!(Object.prototype.toString.call(data) === "[object Array]")) data = [data];
    var ret: string[] = [];
    for (var i = 0, j = data.length; i < j; i++) {
      ret.push(replaceAction(data[i]));
    }
    return ret.join("");
    function replaceAction(object: any): string {
      return temp.replace(regexp || /\\?\{([^}]+)\}/g, function (match: string, name: string): string {
        if (match.charAt(0) == "\\") return match.slice(1);
        return object[name] != undefined ? object[name] : "";
      });
    }
  }
};

//接受创建请求
chrome.runtime.onMessage.addListener(function (request: FeynmanRequestParams, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  console.log('onMessage', request, sender);
  if (request.type == "request") {
    feynmanRequestServer(request, function (err: any, res: FeynmanResponse) {
      res = res || {};
      // console.log('back', res, request, sender);
      sendResponse(res);
    });
    return true; // 保持消息通道开放，等待异步响应
  }
  if (request.type == "setCookie") {
    let expirationDate = new Date().getTime() / 1000 + 30 * 24 * 60 * 60;
    let value = JSON.stringify(request.value);
    let key = request.name;
    chrome.cookies.set(
      {
        url: domain,
        name: key,
        value: value,
        path: "/",
        expirationDate: expirationDate,
      },
      function (cookie: chrome.cookies.Cookie | null) {
        // console.log('set', cookie, request)
        sendResponse(request);
      },
    );
    return true; // 保持消息通道开放，等待异步响应
  }
  if (request.type == "getCookie") {
    let key = request.name;
    chrome.cookies.get(
      {
        url: domain,
        name: key,
      },
      function (cookie: chrome.cookies.Cookie | null) {
        // console.log('get', cookie, request);
        sendResponse(cookie || {});
      },
    );
    return true; // 保持消息通道开放，等待异步响应
  }
  return true;
});

chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
  // Check if chrome.contextMenus is available before calling create
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      title: "checkbox",
      type: "checkbox",
      id: "checkbox",
    });
  }
});
