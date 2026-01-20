import "./index.css"

function IndexPopup() {
  return (
    <div className="w-[300px] p-5">
      <img 
        src="https://notes.bluetech.top/website/Feynman.jpg" 
        alt="Feynman" 
        className="w-[300px]" 
      />
      <h1 className="text-base text-center">
        <a 
          href="https://notes.bluetech.top/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          安装笔记工具
        </a>，
        像费曼一样思考、分享
      </h1>
      {/* https://alpinejs.dev/start-here 重构，发布到商店 */}
    </div>
  )
}

export default IndexPopup
