function IndexPopup() {
  return (
    <div style={{ width: "300px", padding: "20px" }}>
      <img 
        src="https://notes.bluetech.top/website/Feynman.jpg" 
        alt="Feynman" 
        style={{ width: "300px" }} 
      />
      <h1 style={{ fontSize: "16px", textAlign: "center" }}>
        <a href="https://notes.bluetech.top/" target="_blank" rel="noopener noreferrer">
          安装笔记工具
        </a>，
        像费曼一样思考、分享
      </h1>
      {/* https://alpinejs.dev/start-here 重构，发布到商店 */}
    </div>
  )
}

export default IndexPopup
