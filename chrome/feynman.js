(function () {
  let _host = location.host;
  if (location.href.indexOf("https://m.thepaper.cn/") === 0) {
    location.href = location.href.replace("https://m.thepaper.cn", "https://thepaper.cn");
  }
  if (location.href.indexOf("https://twitter.com/") === 0 && location.href.indexOf("/status/") > -1 && location.href.indexOf("?feynman") === -1) {
    location.href = location.href + "?feynman";
  }

  setTimeout(function () {
    readTips();
    // leftAlign();
  }, 100);
  document.body.addEventListener(
    "load",
    function () {
      readTips();
      parseAndConvertLinks();
    },
    false,
  );

  function parseAndConvertLinks() {
    const text = document.body.innerHTML;

    const urlPattern = /https:\/\/[^\s]+/g;
    let result = text.replace(urlPattern, (url) => `<a href="${url}" target="_blank">${url}</a>`);
    document.body.innerHTML = result;
  }

  function readTips() {
    if (location.host != "feedly.com") {
      return false;
    }
    let list = [];
    let keywords = ["笔记", "工具", "哲学", "创新", "经典", "内容", "邮箱", "机器学习", "市值", "思维"];
    let t = setInterval(function () {
      list = document.querySelectorAll(".list-entries .content");
      if (list.length > 0) {
        clearInterval(t);
        // console.log(list);
        list.forEach(function (item) {
          let txt = item.innerText;
          // console.log(txt);
          keywords.forEach(function (keyword) {
            // console.log(keyword, txt.indexOf(keyword) > -1);
            if (txt.indexOf(keyword) > -1 && item.className.indexOf("isHighlight") == -1) {
              item.style.border = "2px solid orange";
              item.querySelector("a.entry__title").innerText = item.querySelector("a.entry__title").innerText + " [" + keyword + "]";
              item.querySelector("div.summary").style.maxHeight = "600px";
              item.classList.add("isHighlight");
            }
          });
        });
      }
    }, 1000);
  }

  //内容左对齐
  function leftAlign() {
    var target = null;
    // if(_host.indexOf('flowus.cn') > -1){
    // 	let dom1 = document.querySelector('#root aside');
    // 	if(!dom1){
    // 		return;
    // 	}
    // 	if(dom1.style.transform == 'translateX(-304px)'){
    // 		document.querySelector('#root main').style.width = '900px';
    // 	}
    // }
    if (_host.indexOf("zhihu.com") > -1) {
      target = document.querySelector(".App-main");
      let target2 = document.querySelector(".Post-content");
      let target3 = document.querySelector(".PinDetail");
      if (target2) {
        target2.style.cssText += "min-width: auto";
      }
      if (target3) {
        target3.style.cssText += "width:760px;margin-left: 20px !important;";
      }
    }
    if (_host.indexOf("mp.weixin.qq.com") > -1) {
      target = document.querySelector(".rich_media_area_primary_inner");
    }
    if (_host.indexOf("photonstorm.github.io") > -1) {
      target = document.querySelector("#toc-content");
    }
    if (target) {
      target.style.cssText += "width:760px;margin-left: 20px !important;";
    }
    // document.body.style.cssText += 'max-width:900px;text-align:left;padding-left:10px;';
  }
})();

(function () {
  let appTpl = `<div class="feynotes-wrapper" id="feynotes-wrapper" style="display:none">
		<div class="feynote-panel-fold" v-if="feynType == 'close'">
			<span class="feynote-count" v-if="notes.length > 0">{{ notes.length }}</span>
			<span class="feynote-button" @click="transPanel()">Feynman 笔记</span>
		</div>
		<div class="feynotes" id="feynote-canvas" v-else>
			<template v-if="feynType == 'feynote'">
				<div class="feynote-banner" @click="setBanner(true)">
					<img :src="article.banner" alt="" v-if="article.banner">
					<div class="feynote-banner-text">
						<a class="feynote-author"
							target="_blank"
							v-if="userInfo.account"
							:href="'https://notes.bluetech.top/published/shuise/' + article.uniqueId + '.html'">
							{{ userInfo.account }}
						</a>
						<span class="feynote-logout" @click="logout" v-if="token != ''">退出</span>
					</div>
				</div>
				<div class="feynote-header">
					<input v-model="article.title" v-if="article.titleEdit >= 10"/>
					<h2 @click="changeTitle" v-else>{{ article.title || 'Feynman 笔记'}}</h2>
				</div>
				<div class="feynote-main">
					<div class="feynote-item" v-for="(note, index) in notes" :key="index" _images="note.images">
						<div class="feynote-item-content">
							<a class="feynote-item-card" @click="createCard(note)">✂</a>
							<span @click="scrollToHL(note)" v-html="plainFormat(note.text)"></span>
						</div>
						<div class="feynote-item-remark"
							v-if="note.tip"
							@click="scrollToHL(note)"
							v-html="plainFormat(note.tip)">
						</div>
					</div>
				</div>

				<div class="feynote-foot">
					<span class="feynote-btn" @click="downloadNotes">笔记</span>
					<span class="feynote-btn" @click="downloadArticle">原文</span>
					<span class="feynote-btn" @click="searchBooks">相关书籍</span>
					<span class="feynote-btn" @click="trans2zh" v-if="false">英译中</span>
					<span class="feynote-btn" @click="createPublicLinkPop">分享</span>
					<a href="http://notes.bluetech.top/public/index.html" target="_blank" v-if="token != ''">管理</a>
					<span class="feynote-btn" @click="transPanel('close')" style="margin-left:1rem">收起</span>
				</div>
			</template>
			<template v-if="feynType == 'weread'">
				<div class="feynote-header">
					<h2>
						<a target="_blank"
							v-if="userInfo.account"
							:href="'https://notes.bluetech.top/public/home.html?user=' + userInfo.account">
							{{ userInfo.account }}
						</a>
						完读书籍
					</h2>
				</div>
				<div class="feynote-main feynote-books">
					<div v-for="(item, index) in books" :key="index" class="feynote-book-item"
						:class="{'feynote-book-item-disable': (isSharing && article.target.bookId != item.bookId) }">
						<h3> {{ item.book.title }} </h3>
						<p>作者：【{{ item.book.author }}】</p>
						<p>
							书摘数量：{{ item.noteCount }}
							<span @click="downloadWeReadBook(item)">导出笔记</span>
							<span @click="shareWeReadBookPop(item)">分享</span>
						</p>
					</div>
				</div>
				<div class="feynote-foot">
					<a href="http://notes.bluetech.top/public/index.html" target="_blank" v-if="token != ''">管理</a>
					<span class="feynote-btn" @click="logout" v-if="token != ''">退出</span>
					<span class="feynote-btn" @click="transPanel('close')">关闭</span>
				</div>
			</template>
			<template v-if="feynType == 'linkrs'">
				<div class="feynote-header">
					<h2>
						可用文章
					</h2>
				</div>
				<div class="feynote-main">
					<div class="feynote-item" v-for="(item, index) in articles" :key="index">
						<div class="feynote-item-content" style="text-indent:0;">
							<a :href="item.originUrl" target="_blank">
								{{ item.title }}
							</a>
						</div>
						<div class="feynote-item-content" style="text-indent:0;">
							{{ getOneNote(item).text }}
						</div>
						<div class="feynote-item-remark" v-if="getOneNote(item).tip">
							{{ getOneNote(item).tip }}
						</div>
					</div>
				</div>
				<div class="feynote-foot">
					<a href="http://notes.bluetech.top/public/index.html" target="_blank" v-if="token != ''">管理</a>
					<span class="feynote-btn" @click="transPanel('close')">关闭</span>
				</div>
			</template>
			<div class="feynote-login" v-if="saved">
				<div class="feynote-topics">
					<div class="feynote-label"></div>
					<label>保存成功！</label>
				</div>
			</div>
			<div class="feynote-login" v-if="isSharing">
				<div class="feynote-topics">
					<div class="feynote-label">话题：</div>
					<label :label="item.id" :key="index" v-for="(item, index) in topics">
			            <input v-model="article.topicIds" name="article-topics" type="checkbox" v-bind:value="item.id">
			            <span>{{item.name}}</span>
			        </label>
			        <div style="height:10px"></div>
			        <div class="feynote-label">范围：</div>
			        <label>
				        <input v-model="article.public" name="article-public" type="radio" v-bind:value="1">
			            <span>公开</span>
			        </label>
			        <label>
				        <input v-model="article.public" name="article-public" type="radio" v-bind:value="0">
			            <span>仅自己可见</span>
			        </label>
				</div>
				<div class="feynote-tags">
					<span class="feynote-button" @click="createPublicLink" v-if="feynType == 'feynote'">发布分享</span>
					<span class="feynote-button" @click="shareWeReadBook" v-else>发布分享</span>
					<span @click="isSharing = false">取消</span>
				</div>
			</div>
			<div class="feynote-login" v-if="isLogin">
				<div class="feynote-tags"><input type="text" v-model="userInfo.account" placeholder="账号"></div>
				<div class="feynote-tags"><input type="password" v-model="userInfo.psw" placeholder="密码" @change="userLoginSubmit"></div>
				<div class="feynote-tags">
					<span class="feynote-button" @click="userLoginSubmit">登录</span>
					<a href="https://notes.bluetech.top/public/index.html" target="_blank">注册</a>
					<span @click="isLogin = false">取消</span>
				</div>
			</div>
		</div>

		<div class="feyn-card-img-mask" v-if="currentNote.open"></div>
		<div class="feyn-card-img" v-if="currentNote.open" style="width:490px;text-align:left;">
			<div style="height:40px;"></div>
			<div class="feynote-foot" style="background:#f5f5f5;top:0;bottom:auto;border-radius:10px 10px 0 0;">
				<span>
					风格：
					<span class="feynote-btn" @click="setCardStyle('1')">默认</span>
					<span class="feynote-btn" @click="setCardStyle('2')">去标题</span>
					<span class="feynote-btn" @click="setCardStyle('3')">去图</span>
				</span>
				<span class="feynote-btn" @click="downloadCard" style="font-weight:700;margin:0px 7rem 0 4rem;">生成卡片</span>
				<span class="feynote-btn" @click="endCreateCard">关闭</span>
			</div>
			<div class="feyn-note-card" id="feynCard" style="width:480px;">
				<div class="feyn-note-card-input" v-if="card.styleType != '3'">
					<img v-if="localImage" :src="localImage" alt="" style="width:480px;display: block;" />
					<img v-else :src="article.banner" alt="" style="width:480px;display: block;">
					<input class="feynote-upload-image" title="上传" type="file" @change="loadLocalImage" style="opacity: 0" />
					<span class="feynote-refresh-image" @click="refreshImage" title="刷新"></span>
				</div>
				<div style="padding:20px;background: #fff;line-height:1.3;width:450px; overflow:hidden;">
					<div v-if="card.styleType != '2'">
						<h2 style="font-size:20px;line-height:1;font-weight:400;padding:0 0 15px">{{ article.title }}</h2>
						<p class="feyn-note-card-time" style="color:#999;font-size:14px;line-height:1;padding-bottom:15px;">{{ currentNote.data.day }}</p>
					</div>
			        <div style="max-height:800px;min-height:50px;overflow:hidden;font-size:15px;font-weight:400;line-height:1.8;text-overflow:ellipsis;">
						<span v-html="plainFormat(currentNote.data.note)"></span>
					</div>
					<div class="feyn-note-summary" v-if="currentNote.data.tip" v-html="plainFormat(currentNote.data.tip)" style="max-height: 475px;overflow: hidden; font-weight:300;font-size:14px; line-height:1.5; text-overflow: ellipsis;margin-left: 20px;margin-top: 10px;padding: 10px;background: #f5f5f5;border-radius: 5px;position: relative;"></div>
					<div class="feyn-note-footer" style="width:460px;margin-top: 20px;line-height: 1;padding-left: 20px;">
						<img :src="currentNote.qrcode" alt="" style="display:inline-block;width:100px;height:100px;margin-right: 0.5rem;vertical-align: middle;">
						<strong>{{ userInfo.account }}@Feynman 笔记</strong>
					</div>
				</div>
			</div>
		</div>

		<div class="feyn-card-img-data" v-if="card.status">
			<div class="feyn-card-img-creating"
				style="padding-left:2rem"
				v-if="card.status == 'creating'">{{ card.prog }}</div>
			<img :src="card.image" v-if="card.status == 'end'" />
		</div>
	</div>`;

  setTimeout(function () {
    //浏览器打开图片、视频等不能嵌入。 content-type: image/png
    fetch(location.href)
      .then(function (response) {
        let headerObj = {};
        for (var pair of response.headers.entries()) {
          headerObj[pair[0]] = pair[1];
        }

        // let allowContentTypes = ['text/plain', 'text/html'];
        if (headerObj["content-type"].indexOf("text/html") > -1 || headerObj["content-type"].indexOf("text/plain") > -1) {
          runFeynmanNote();
        }
      })
      .catch(function (e) {
        CRS.log("debugger", e);
      });
  }, 2000);

  function runFeynmanNote() {
    //todo bugfix
    if (!window.Vue) {
      return;
    }

    //禁止注入，后期服务器端配置
    let noAllowDomains = [
      // 'pages.bluetech.top',
      // 'notes.bluetech.top'
    ];
    // let _host = location.host;
    // if(noAllowDomains.indexOf(_host) > -1){
    // 	return;
    // }

    //获取用户登录信息，获取笔记云端信息、话题信息等，慢不要紧，数据不能出错。
    feynmanRequest(
      {
        type: "getCookie",
        name: "userInfo",
      },
      function (cookie) {
        cookie = cookie || {};
        let userInfo = JSON.parse(cookie.value || "{}");
        let article = CRS.cache.get("article") || {};
        CRS.log("init form cache", { userInfo, article });

        start(userInfo, article);
      },
    );
  }

  function start(userInfo, article) {
    let app = document.createElement("div");
    app.innerHTML = appTpl;
    document.body.appendChild(app);
    document.querySelector("#feynotes-wrapper").style.display = "block";

    //微信读书
    let wereadMixin = {
      data: function () {
        return {
          article: {},
          books: [],
          notes: [],
        };
      },
      methods: {
        loadBooks: function (callback) {
          let _this = this;
          feynmanRequest(
            {
              api: "weRead.books",
              type: "request",
            },
            function (res) {
              CRS.log("weRead.books", res.books);
              _this.books = res.books;
            },
          );
        },
        loadBookNotes: function (book, callback) {
          let _this = this;
          let count = 0;
          let notes = null,
            summarys = null;
          feynmanRequest(
            {
              api: "weRead.notes",
              type: "request",
              data: book,
            },
            function (res) {
              CRS.log("weRead.notes", res);
              count += 1;
              notes = res;
              callbacks();
              // callback(res.books);
            },
          );

          feynmanRequest(
            {
              api: "weRead.summarys",
              type: "request",
              data: book,
            },
            function (res) {
              CRS.log("weRead.summarys", res);
              count += 1;
              summarys = res;
              callbacks();
              // callback(res.books);
            },
          );

          function callbacks() {
            if (count < 2) {
              return;
            }
            let reviews = {};
            _.each(summarys.reviews, function (item) {
              reviews[item.review.range] = item.review;
            });
            notes.reviews = reviews;
            callback(notes);
          }
        },
        downloadWeReadBook: function (book) {
          let _this = this;
          _this.loadBookNotes(book, function (res) {
            let article = res.book;
            let chapters = res.chapters;
            let notes = res.updated.reverse();
            let reviews = res.reviews;

            let tpls = {
              article: "# {title} \n\n",
              banner: '\n ![]({cover} "") \n\n',
            };

            let md = CRS.subs(tpls.article, article);

            if (article.cover) {
              md += CRS.subs(tpls.banner, article);
            }

            //章节映射
            let chapterMap = {};
            _.each(chapters, function (item) {
              chapterMap[item.chapterUid] = item;
            });

            _.each(notes, function (item) {
              let chapterUid = item.bookmarkId.split("_")[2] || "";
              md += "\n\n## " + chapterMap[chapterUid].title;
              md += "\n" + item.markText;
              if (reviews[item.range]) {
                md += "\n > " + reviews[item.range].content;
              }
            });

            md += "\n\n\n";
            // md += CRS.subs(tpls.notes, notes);

            // CRS.log('weread', md);

            let zkCard = CRS.dateFormat(new Date(), "yyyyMMddhhmm");
            let fileName = article.title || zkCard;
            fileName = fileName + "-书摘.md";
            let file = new File([md], fileName, { type: "text/plain" });
            let objectUrl = URL.createObjectURL(file);
            CRS.log("weread", objectUrl);
            _this.download(objectUrl, fileName);
          });
        },
        shareWeReadBookPop: function (book) {
          if (!this.token) {
            this.isLogin = true;
            return;
          }
          this.isSharing = true;
          this.article.target = book;
        },
        shareWeReadBook: _.throttle(function () {
          let _this = this;
          let book = _this.article.target;
          _this.loadBookNotes(book, function (res) {
            let article = res.book;
            let notes = res.updated;
            notes = notes.reverse();
            let reviews = res.reviews;

            let paragraphs = [];
            _.each(notes, function (item, index) {
              let summary = "";
              if (reviews[item.range]) {
                summary = reviews[item.range].content;
              }
              paragraphs.push({
                note: item.markText,
                summary: summary,
                markTime: item.createTime,
                sort: index,
              });
            });
            article.paragraphs = paragraphs;

            let host = "weread.qq.com";
            let uniqueId = md5(host + article.bookId);
            article.uniqueId = uniqueId;
            article.tagIds = _this.article.topicIds;

            let originUrl = "https://weread.qq.com/web/search/books?author=" + encodeURIComponent(article.author);
            article.originUrl = originUrl;
            article.banner = article.cover;

            article.extra = "";

            feynmanRequest(
              {
                api: "Article.add",
                type: "request",
                token: _this.token,
                data: article,
              },
              function (res) {
                CRS.log("Article.add", res);

                if (!_this.article.public) {
                  // window.open('https://notes.bluetech.top/public/index.html');
                  // alert('保存成功');
                  _this.isSharing = false;
                  _this.saved = true;
                  setTimeout(function () {
                    _this.saved = false;
                  }, 3000);
                  return;
                }

                feynmanRequest(
                  {
                    api: "Article.publish",
                    token: _this.token,
                    type: "request",
                    data: res.data,
                  },
                  function (res) {
                    CRS.log("Article.publish", res);
                    let params = {
                      account: _this.userInfo.account,
                      uniqueId: uniqueId,
                    };
                    let link = "https://notes.bluetech.top/published/{account}/{uniqueId}.html";
                    link = CRS.subs(link, params);
                    window.open(link);
                  },
                );
              },
            );
          });
        }, 5000),
      },
    };

    //工具类
    let utils = {
      data: function () {
        return {
          localImage: "",
        };
      },
      methods: {
        download: function (objectUrl, fileName) {
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
        },
        scrollToHL: function (note) {
          CRS.log("scrollToHL", note);
          let tipX = note.x;
          let tipY = note.y; //number
          if (tipY <= 0) {
            return;
          }
          CRS.log("scrollToHL-y-x", { tipY, tipX });
          window.scrollTo({
            top: tipY - 100,
            left: tipX,
            behavior: "smooth",
          });
        },
        plainFormat: function (str) {
          str = str.split("\n\n").join("\n");
          str = str.split("\n").join("<br />");
          // CRS.log(str);
          return str;
        },
        loadLocalImage: function (event) {
          console.log(event);
          let _this = this;
          let file = event.target.files[0];
          CRS.getLocalImageData(file, function (imageData) {
            _this.localImage = imageData;
          });
        },
        refreshImage: function () {
          let banners = this.getBanners();
          let next = Math.floor(Math.random() * 999) % banners.length;
          this.localImage = banners[next];
        },
        getBanners: function () {
          let imgs = document.querySelectorAll("img");
          let banners = [];
          for (var i = 0; i < imgs.length; i++) {
            if (imgs[i].src && imgs[i].src.indexOf("http") === 0 && imgs[i].clientHeight >= 120 && imgs[i].clientWidth >= 120) {
              banners.push(imgs[i].src);
            }
          }
          return banners;
        },
        setPasteImage: function () {
          let _this = this;

          document.addEventListener("paste", getClipboardData);
          document.addEventListener("copy", getClipboardData);

          function getClipboardData(e) {
            var clipboardData = e.clipboardData;
            var types = clipboardData.types;

            //复制图片地址贴入
            let str = clipboardData.getData("text/plain");

            if (isUrl(str)) {
              showResult({
                file: str,
              });
              return;
            }

            CRS.log("clipboardData", { clipboardData, types, str });

            var isFile = types.indexOf("Files") > -1;
            var isCaptrue = types.indexOf("text/plain") == -1;

            //粘贴截图
            if (isFile && isCaptrue) {
              var item = clipboardData.items[0];
              item = item.getAsFile();
              CRS.log("clipboardData", item);
              getBase64File(item, showResult);
            }

            //对复制图片的处理，非截图
            if (isFile && !isCaptrue) {
              var item = clipboardData.items[1];
              item = item.getAsFile();
              CRS.log("clipboardData file", item);
              getBase64File(item, showResult);
            }
          }

          function showResult(data) {
            if (!data.file) {
              return;
            }
            _this.article.banner = data.file;
            let bannerKey = _this.pageId + "-banner";
            CRS.cache.set(bannerKey, data.file);
          }

          function getBase64File(file, callback) {
            if (!file) {
              callback({});
              return;
            }
            var reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = function (event) {
              var base64Code = event.target.result;

              callback({
                file: base64Code,
                type: file.type,
              });
            };
          }

          function isUrl(str) {
            let flag = "";
            try {
              let url = new URL(str);
              if (url.host) {
                flag = "ok";
              }
            } catch (e) {
              flag = "no";
            }
            return flag == "ok";
          }
        },
      },
    };

    let FyenmanNote = new Vue({
      el: "#feynotes-wrapper",
      mixins: [utils, wereadMixin],
      data: function () {
        return {
          feynType: "close",
          isSharing: false,
          isLogin: false,
          saved: false,
          userInfo: {
            account: userInfo.account || "",
            psw: "",
            password: "",
          },
          token: userInfo.token || "",
          topics: [],
          pageId: "",
          banners: {
            index: -1,
            data: [],
          },
          articles: [],
          article: {
            id: article.id || "",
            target: {},
            title: article.title || "",
            titleEdit: 0,
            topicIds: article.topicIds || [],
            banner: article.banner || "",
            originUrl: "",
            public: article.public || 1,
          },
          notes: [],
          currentNote: {
            open: false,
            data: {
              id: "",
              spaceTitle: "",
              day: "",
              note: "",
              summary: "",
            },
            qrcode: "",
          },
          card: {
            name: "",
            image: "",
            styleType: "",
            status: "",
            prog: "生成中…",
          },
        };
      },
      created: function () {
        let _this = this;
        let url = location.href;
        this.pageId = md5(url);

        //需要判断登录状态
        this.loadTopics(userInfo, function (topics) {});
      },
      mounted: function () {
        let _this = this;
        if (_this.token) {
          _this.initPagenoteFormCloud(function (article) {
            _this.article.uniqueId = article.uniqueId;
            if (article.banner) {
              _this.article.banner = article.banner;
              _this.article.title = article.title;
              _this.article.originUrl = article.originUrl;
              return;
            }
            let count = 0;
            let t = setInterval(function () {
              if (_this.article.banner.indexOf("http") == 0 || count >= 100) {
                clearInterval(t);
              }
              count += 1;
              _this.setArticleInfo();
            }, 50);
          });
        } else {
          _this.initPagenote();
          _this.setArticleInfo();
        }
        _this.setPasteImage();
        // _this.setRemarker();
      },
      methods: {
        //打开面板
        setRemarker: function () {
          let secs = document.querySelectorAll("p");
          secs.forEach(function (item) {
            let node = document.createElement("div");
            node.style.cssText = "display:block;background:#f5f5f5;color:#333;border:1px solid #fff;padding:10px;margin:-10px 0 20px;font-size:14px;";
            node.innerText = "";
            // console.log(dom.innerText, str);
            // dom.appendChild(node);
            item.parentNode.insertBefore(node, item.nextElementSibling);

            node.ondblclick = function () {
              this.contentEditable = true;
            };
            node.onblur = function () {
              this.contentEditable = false;
            };
          });
        },
        transPanel: function (type) {
          let pageName = "feynote";
          if (location.host == "weread.qq.com") {
            pageName = "weread";
            this.loadBooks();
          }

          if (location.host == "www.36linkr.com") {
            pageName = "linkrs";
            this.loadArticles();
          }

          this.feynType = type || pageName;

          let w = this.feynType === "close" ? 0 : 400;
          console.log("", w, document.getElementsByTagName("body"));
          document.getElementsByTagName("body")[0].style.paddingRight = w + "px";
        },
        searchBooks: function () {
          var content = document.body.innerText;
          var pat = new RegExp("《([^《|》]*)》", "g");

          var results = {};
          do {
            var res = pat.exec(content);
            if (res) {
              results[res[1]] = res[1];
            }
          } while (res);

          var names = [];
          for (var name in results) {
            console.log(name, content);
            // let link = '<a href="https://www.amazon.cn/s?k=' + name + '" target="_blank">《' + name + '》</a>';
            // str = str.replace('《' + name + '》', link);
            // names.push(name);
            window.open("https://search.douban.com/book/subject_search?search_text=" + name + "&cat=1001");
            // window.open('https://www.amazon.cn/s?k=' + name);
          }
          // return str;
          // console.log(names);
        },
        loadArticles: function () {
          let _this = this;
          if (!this.token) {
            return;
          }
          feynmanRequest(
            {
              api: "Article.list",
              type: "request",
              token: _this.token,
              data: {
                title: "",
                includeTagIds: "",
                current: 1,
                size: 50,
              },
            },
            function (res) {
              CRS.log("Article.list", res);
              let data = res.data || [];
              _this.articles = data.records || [];
            },
          );
        },
        getOneNote: function (item) {
          let extra = item.extra || '"{}"';
          extra = JSON.parse(extra);
          let steps = extra.steps || [];
          var note = {};
          _.each(steps, function (_note) {
            if (_note.tip) {
              note = _note;
            }
          });
          if (!note.tip) {
            note = steps[0];
          }
          // console.log(note, extra);
          return note || { text: "", tip: "" };
        },

        //网页信息处理
        getTitle: function () {
          if (location.host.indexOf(".dedao.cn") > -1) {
            let obj = document.querySelector(".audio-title") || {};
            return obj.innerText || "";
          }
          if (location.host.indexOf(".feishu.cn") > -1) {
            let obj = document.querySelector(".op-symbol") || {};
            return obj.innerText || "";
          }
          if (location.host.indexOf("notion.so") > -1) {
            let obj = document.querySelector(".notion-topbar .notranslate") || {};
            return obj.innerText || "";
          }

          let h1 = document.querySelector("h1") || {};
          let h2 = document.querySelector("h2") || {};
          let h3 = document.querySelector("h3") || {};
          let title = h1.innerText || h2.innerText || h3.innerText;
          title = document.title || title || document.body.innerText;

          //title 需要不变，才能提供唯一的连续识别依赖。
          title = title.substr(0, 200);
          title = title.split("#").join("");
          title = title.split("“").join("");
          title = title.split("”").join("");

          return title;
        },
        changeTitle: function () {
          this.article.titleEdit += 1;
        },
        setBanner: function (refresh) {
          //从页面中选择一个有效的且高宽 > 200 的图片
          let bannerKey = this.pageId + "-banner";
          let banner = CRS.cache.get(bannerKey) || "";
          if (banner && !refresh) {
            this.article.banner = banner;
            return;
          }

          let imgs = document.querySelectorAll("img");
          let banners = [];
          for (var i = 0; i < imgs.length; i++) {
            if (imgs[i].src && imgs[i].clientHeight >= 120 && imgs[i].clientWidth >= 120) {
              banners.push(imgs[i].src);
            }
          }
          //填充 1 张，后续可以考虑 AI 生成。
          if (banners.length == 0) {
            // let index = encodeURIComponent(location.href).length%10 + 1;
            let index = (Math.ceil(Math.random() * 99999) % 10) + 1;
            let bannerSystem = "https://notes.bluetech.top/libs/covers/" + index + ".png";
            banners.push(bannerSystem);
          }
          this.banners.data = banners;

          let index = this.banners.index;
          let next = (index + 1) % banners.length;
          this.article.banner = banners[next];
          this.banners.index = next;

          CRS.cache.set(bannerKey, banners[next]);
        },
        setArticleInfo: function () {
          let _this = this;
          let title = _this.getTitle();
          let originUrl = location.href;
          this.setBanner(false);
          this.article.title = title;
          this.article.originUrl = originUrl;
        },

        //下载笔记，生成卡片
        downloadArticle: function () {
          var documentClone = document.cloneNode(true);
          var article = new Readability(documentClone).parse();
          let html = article.content;
          let md = html2md(html);
          md += "\n\n 来源：" + location.href + "\n\n";

          let zkCard = CRS.dateFormat(new Date(), "yyyyMMddhhmm");
          let fileName = this.article.title || zkCard;
          fileName = fileName + ".md";
          let file = new File([md], fileName, { type: "text/plain" });
          let objectUrl = URL.createObjectURL(file);
          this.download(objectUrl, fileName);
        },
        createMD: function () {
          let tpls = {
            article: "# {title} \n\n 原文：{originUrl} \n",
            banner: '\n ![]({banner} "") \n\n',
            topics: "[[{topic}]]",
            notes: "\n\n {text} \n > {tip}",
          };

          let article = this.article;
          let md = CRS.subs(tpls.article, article);

          let topics = [];
          let tagMap = {};
          if (topics.length > 1) {
            md += "\n";
            _.each(topics, function (item) {
              if (!tagMap[item]) {
                tagMap[item] = item;
                md += "[[" + item + "]] ";
              }
            });
          }

          if (article.banner) {
            md += CRS.subs(tpls.banner, article);
          }

          let notes = this.notes;
          _.each(notes, function (item) {
            md += "\n\n " + item.text;
            if (item.tip) {
              md += "\n > " + (item.tip || "");
            }
          });

          md += "\n\n\n";
          // md += CRS.subs(tpls.notes, notes);

          return md;
        },
        createCard: _.throttle(function (note) {
          // this.okTips('生成卡片稍慢，请等待，生成后会自动弹出。');
          let _this = this;
          _this.card.status = "";

          let userInfo = this.userInfo;
          note.spaceTitle = userInfo.account;

          getPageQrcode(function (base64data) {
            let text = note.text.split("\n\n").join("\n");
            text = text.split("\n \n").join("\n");
            text = text.split("\n").join("<br>");
            note.note = text;
            note.day = CRS.dateFormat(new Date(), "yyyy/MM/dd");
            _this.currentNote.data = note;
            _this.currentNote.qrcode = base64data;
            _this.currentNote.open = true;
          });

          function getPageQrcode(callback) {
            // let logo = 'https://notes.bluetech.top/libs/avatars/' + (userInfo.avatar || 'bloom') + '.png';

            //发布用笔记页，未发布用原始页面；
            let url = location.href;

            CRS.qrcode(
              {
                url: url,
                logo: "",
              },
              function (dataUrl) {
                callback(dataUrl);
                // console.log(url, dataUrl);
              },
            );
          }
        }, 2000),
        setCardStyle: function (styleType) {
          this.card.status = "";
          this.card.styleType = styleType || "1";
        },
        downloadCard: function () {
          let _this = this;
          let target = document.getElementById("feynCard");
          let t = new Date().getTime();
          _this.card.status = "creating";
          let len = _this.card.prog.length;
          let str = "…";
          let count = 0;
          let mov = setInterval(function () {
            _this.card.prog += str;
            count += 1;
            if (count % 5 == 0) {
              _this.card.prog = _this.card.prog.substring(0, len);
            }
          }, 200);
          //https://html2canvas.hertzen.com/configuration
          html2canvas(target, {
            backgroundColor: null,
            width: 480,
            allowTaint: true,
            useCORS: true,
            proxy: "",
          }).then(function (canvas) {
            let newImageData = canvas.toDataURL("image/png", 1.0);
            let name = _this.article.title;
            _this.card.status = "end";
            _this.card.image = newImageData;
            _this.card.name = name;
            clearInterval(mov);

            // alert(new Date().getTime() - t);
            // _this.download(newImageData, name);
          });
        },
        endCreateCard: function () {
          this.currentNote.open = false;
          this.card.status = "";
          this.localImage = "";
        },
        downloadNotes: function () {
          let md = this.createMD();

          if (this.notes.length == 0) {
            CRS.log("无笔记数据");
            return;
          }

          let zkCard = CRS.dateFormat(new Date(), "yyyyMMddhhmm");
          let fileName = this.article.title || zkCard;
          fileName = fileName + "-笔记.md";
          let file = new File([md], fileName, { type: "text/plain" });
          let objectUrl = URL.createObjectURL(file);
          this.download(objectUrl, fileName);
        },

        //发布，保存到云端，或创建分享
        createPublicLinkPop: function () {
          if (!this.token) {
            this.isLogin = true;
            return;
          }
          this.isSharing = true;
        },
        createPublicLink: _.throttle(function () {
          let _this = this;
          let zkCard = CRS.dateFormat(new Date(), "yyyyMMddhhmm");

          _this.noteSaveToServer(function (res) {
            if (!_this.article.public) {
              // window.open('https://notes.bluetech.top/public/index.html');
              // alert('保存成功');
              _this.isSharing = false;
              _this.saved = true;
              setTimeout(function () {
                _this.saved = false;
              }, 3000);
              return;
            }
            _this.notesPublish(res, function (link) {
              window.open(link);
              _this.isSharing = false;
            });
          });
        }, 5000),
        userLoginSubmit: _.throttle(function () {
          let _this = this;
          _this.userLogin(function () {
            location.reload();
          });
        }, 5000),
        noteSaveToServer: function (callback) {
          let _this = this;
          let data = this.article;
          let notes = this.notes;

          if (notes.length == 0) {
            console.log("无笔记");
            return;
          }

          let paragraphs = [];
          _.each(notes, function (item) {
            paragraphs.push({
              note: item.text,
              summary: item.tip || "",
              markTime: item.time,
              sort: item.y,
            });
          });
          data.paragraphs = paragraphs;

          let host = location.host;
          let uniqueId = md5(data.title + host);
          data.uniqueId = uniqueId;
          data.tagIds = data.topicIds;

          let pageId = this.pageId;
          let extra = CRS.cache.get(pageId);
          extra.pageId = pageId;
          data.extra = JSON.stringify(extra);

          //防止标题过长
          data.title = data.title.substring(0, 200);

          feynmanRequest(
            {
              api: "Article.add",
              type: "request",
              token: _this.token,
              data: data,
            },
            function (res) {
              CRS.log("Article.add", data);
              CRS.log("Article.add", _this.article);
              CRS.log("Article.add", res);

              callback(res.data);
              _this.article.id = res.data.id;
              CRS.cache.set("article", _this.article);
            },
          );
        },
        notesPublish: function (data, callback) {
          let _this = this;
          feynmanRequest(
            {
              api: "Article.publish",
              token: _this.token,
              type: "request",
              data: data,
            },
            function (res) {
              CRS.log("Article.publish", data);
              CRS.log("Article.publish", res);
              let params = {
                account: _this.userInfo.account,
                uniqueId: data.uniqueId,
              };
              let link = "https://notes.bluetech.top/published/{account}/{uniqueId}.html";
              link = CRS.subs(link, params);
              callback(link);
            },
          );
        },
        notesRefresh: function (data) {
          data = data || {};
          this.notes = data.steps || [];
        },

        //从服务器获取数据
        userLogin: function (callback) {
          let _this = this;
          let userInfo = _this.userInfo;
          CRS.log("user", userInfo);
          if (!userInfo.account || !userInfo.psw) {
            alert("请输入用户名和密码");
            return;
          }

          //用户名正则，4到16位（字母，数字，下划线，减号）
          var accountPattern = /^[a-zA-Z0-9_-]{6,50}$/;
          if (!accountPattern.test(userInfo.account)) {
            alert("用户名只允许使用字母、数字、下划线和减号，长度为 6~50");
            return;
          }

          var pswPattern = /^[a-zA-Z0-9_-]{10,50}$/;
          if (!pswPattern.test(userInfo.psw)) {
            alert("密码只允许使用字母、数字、下划线和减号，长度为 10~50");
            return;
          }

          userInfo.password = md5(userInfo.psw);
          feynmanRequest(
            {
              api: "User.login",
              type: "request",
              data: userInfo,
            },
            function (res) {
              CRS.log("user", res);
              if (res.code != "0") {
                alert(res.msg);
                return;
              }

              feynmanRequest(
                {
                  type: "setCookie",
                  name: "userInfo",
                  value: res.data,
                },
                function () {
                  _this.isLogin = false;
                  _this.token = res.data.token;
                  _this.account = res.data.account;
                  callback();
                },
              );
            },
          );
        },
        logout: function () {
          this.token = "";
          let userInfo = this.userInfo;
          userInfo.token = "";

          feynmanRequest(
            {
              type: "setCookie",
              name: "userInfo",
              value: userInfo,
            },
            function () {},
          );
        },
        loadTopics: function (userInfo, callback) {
          let _this = this;
          CRS.log("Topic.list token", userInfo);
          feynmanRequest(
            {
              api: "Topic.list",
              type: "request",
              token: _this.token,
              data: {
                tagStatus: "ENABLE",
              },
            },
            function (res) {
              CRS.log("Topic.list", res);
              CRS.log("user token", _this.token);
              res = res || {};
              if (res.code == "40101") {
                _this.logout();
                return;
              }
              _this.topics = res.data || [];
              callback && callback(_this.topics);
            },
          );
        },
        initPagenoteFormCloud: function (callback) {
          let _this = this;
          let title = this.getTitle();
          let host = location.host;
          let uniqueId = md5(title + host);
          CRS.log("Article.info", host + "-" + uniqueId + "-" + title);

          feynmanRequest(
            {
              api: "Article.notes",
              type: "request",
              token: _this.token,
              data: {
                uniqueId: uniqueId,
              },
            },
            function (res) {
              CRS.log("Article.notes uniqueId", uniqueId);
              CRS.log("Article.notes", res);
              let data = res.data || {};
              let notes = data.paragraphs || [];

              let extra = data.extra || "{}";
              extra = JSON.parse(extra);
              extra.steps = extra.steps || [];

              //与本地合并
              let pageId = _this.pageId;
              let isSamePage = extra.pageId == pageId;

              let dataCache = CRS.cache.get(pageId) || {};
              let stepsCache = dataCache.steps || [];

              if (isSamePage && extra.steps.length > 0 && stepsCache.length > 0) {
                extra.steps = mergeNotes(stepsCache, extra.steps, notes);
              }

              _this.initPagenote(extra);
              callback(data);
            },
          );

          function mergeNotes(_local, _cloud, notes) {
            // console.log('mergeNotes', _local, _cloud, notes);
            let noteMap = {};
            _.each(_cloud, function (item) {
              let key = md5(item.text);
              noteMap[key] = item;
            });
            _.each(_local, function (item) {
              let key = md5(item.text);
              if (!noteMap[key]) {
                _cloud.push(item);
              }
            });
            _.each(notes, function (item) {
              let key = md5(item.note);
              let isModified = new Date(item.updatedAt).getTime() > noteMap[key]["time"];
              if (noteMap[key] && isModified) {
                noteMap[key]["tip"] = item.summary;
              }
            });
            return _cloud;
          }
        },

        //初始化笔记工具，用户退出
        initPagenote: function (extra) {
          let _this = this;
          let pageId = _this.pageId;
          extra = extra || {};
          extra.steps = extra.steps || [];

          // 如何使用 就看这里就好了，使用前，记得先引入 SDK
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
            renderAnnotation: function (data, light) {
              // 自定义笔记渲染逻辑，这里可以处理为从服务器端根据 lightId 查询数据来渲染，包括点赞量等数据
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

              const asides = [];
              return [null, asides];
            },
            debug: false,
            enableMarkImg: true,
          });

          // 这里可以从服务器端拉取数据，用于 init
          CRS.log("notes recovery", extra);
          let data = CRS.cache.get(pageId) || {};

          if (extra.steps.length > 0) {
            data = extra;
          }
          CRS.log("notes recovery", data);
          pagenote.init(data); // 初始化开始工作
          _this.notesRefresh(data);

          pagenote.addListener(function (status) {
            CRS.log("pagenote", status);
            // if(status == 10 || status == 3){
            // 	let editor = document.querySelector('pagenote-block[data-role="annotation-editor"]');
            // 	if(editor){
            // 		editor.innerHTML = CRS.removeHTML(editor.innerHTML);
            //         var range = window.getSelection();//创建range
            //         range.selectAllChildren(editor);//range 选择obj下所有子内容
            //         range.collapseToEnd();//光标移至最后
            // 	}
            // }
            let steps = pagenote.plainData.steps || [];
            let isSameCount = steps.length == _this.notes.length;

            if (status === pagenote.CONSTANT.SYNCED) {
              // localStorage.setItem('shiuse-notes',JSON.stringify(pagenote.plainData))
              CRS.log("pagenote", pagenote);

              let notes = [];
              _.each(steps, function (item) {
                item.text = CRS.removeHTML(item.text);
                item.tip = CRS.removeHTML(item.tip);
                notes.push(item);
              });

              pagenote.plainData.steps = notes;
              // pagenote.init(pagenote.plainData);

              CRS.cache.set(pageId, pagenote.plainData);
              _this.notesRefresh(pagenote.plainData);
              // 数据变化回调，将数据发送到服务器端，在这里处理
            }

            //不强制登录，但只有登录时才能做数据同步。
            //笔记数量有变化时同步，还需要加上定制同步，需要判断笔记内容是否有变更
            CRS.log("isSameCount", isSameCount);
            if (!isSameCount && status == 10) {
              if (!_this.token) {
                return;
              }
              _this.noteSaveToServer(function () {
                CRS.log("note save cloud", "保存成功");
              });
            }
            setInterval(
              function () {
                _this.noteSaveToServer(function () {
                  CRS.log("note save setInterval", "保存成功");
                });
              },
              5 * 60 * 1000,
            );
          });
        },
      },
    });
  }

  function feynmanRequest(data, callback) {
    //发送创建请求
    chrome.extension.sendRequest(data, function (response) {
      callback(response);
    });
  }
})();
