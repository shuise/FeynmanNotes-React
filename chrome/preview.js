// flowus

<div contenteditable="true" class="whitespace-pre-wrap self-start flex-1 w-0 break-words _1vs7lkh" data-tr40owj="" data-editor="eee9c17d-99e3-4e20-8337-3eb85bdeecf1::668c1448-4bb9-4a62-9b51-5ee650973435" data-revision="1" spellcheck="false"><span data-tr40owj="" data-text="" data-length="95" class="_nj97hl _23v5d0 _1p2ly5v">网页保存到本地最简单的方法还是用 Feynman笔记的一键下载，也可以使用 MarkDownload 这样的工具复制 md 到本地 ob，关于图片或附件的问题需要通过 ob 的插件来解决。
</span><br contenteditable="false"></div>

(function(){
	var area = document.querySelector('.next-space-page-content');
	var doms1 = area.querySelectorAll('div');
	doms1.forEach(function(dom){
		dom.removeAttribute('contenteditable');
		dom.removeAttribute('data-block-id');
		dom.removeAttribute('data-page-id');
		dom.removeAttribute('data-tr40owj');
		dom.removeAttribute('data-editor');
		dom.removeAttribute('spellcheck');
		dom.removeAttribute('class');
		dom.removeAttribute('id');
	});
	var doms2 = area.querySelectorAll('span');
	doms2.forEach(function(dom){
		dom.removeAttribute('contenteditable');
		dom.removeAttribute('data-block-id');
		dom.removeAttribute('data-page-id');
		dom.removeAttribute('data-tr40owj');
		dom.removeAttribute('data-editor');
		dom.removeAttribute('spellcheck');
		dom.removeAttribute('class');
		dom.removeAttribute('id');
	});

	// let content = document.querySelector('#next-space-page');
	// document.querySelector('#root').innerHTML = content.innerText.split('\n').join('<br />');
})();