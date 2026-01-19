<div class="feynotes-wrapper" id="feynotes-wrapper" style="display:none">
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
	</div>