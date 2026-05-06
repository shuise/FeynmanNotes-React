import React from "./vendor/react-global"
import { createRoot } from "./vendor/react-dom-global"
import feynmanPanelCss from "./generated/feynman-panel-css"

import Notes from "./notes"
import { restoreLinks } from "./utils/tools"

const HOST_ID = "feynotes-shadow-host"
const ROOT_ID = "feynotes-wrapper"
const RESET_STYLE_ID = "feynotes-shadow-reset-style"
const SHADOW_CONTAINER_ID = "feynotes-shadow-root"

const SHADOW_STYLE_RESET = `
:host {
  all: initial !important;
}

:host,
:host * {
  box-sizing: border-box;
}

#${SHADOW_CONTAINER_ID} {
  all: initial;
  display: block;
  position: relative;
  z-index: 2147483647;
}

#${SHADOW_CONTAINER_ID},
#${SHADOW_CONTAINER_ID} * {
  box-sizing: border-box;
}

${feynmanPanelCss}
`

function ensureShadowStyles(shadowRoot: ShadowRoot) {
  let resetStyle = shadowRoot.getElementById(RESET_STYLE_ID) as HTMLStyleElement | null
  if (!resetStyle) {
    resetStyle = document.createElement("style")
    resetStyle.id = RESET_STYLE_ID
    resetStyle.textContent = SHADOW_STYLE_RESET
    shadowRoot.prepend(resetStyle)
  }
}

const getRootContainer = () => {
  const existingHost = document.getElementById(HOST_ID)
  const existingShadowRoot = existingHost?.shadowRoot
  const existingRoot = existingShadowRoot?.getElementById(ROOT_ID)
  if (existingRoot instanceof HTMLElement && existingShadowRoot) {
    ensureShadowStyles(existingShadowRoot)
    return existingRoot
  }

  const shadowHost = document.createElement("feynotes-host")
  shadowHost.id = HOST_ID
  shadowHost.style.all = "initial"
  shadowHost.style.position = "fixed"
  shadowHost.style.inset = "0"
  shadowHost.style.width = "100vw"
  shadowHost.style.height = "100vh"
  shadowHost.style.zIndex = "2147483647"
  shadowHost.style.pointerEvents = "none"

  const shadowRoot = shadowHost.attachShadow({ mode: "open" })

  const shadowContainer = document.createElement("div")
  shadowContainer.id = SHADOW_CONTAINER_ID
  shadowContainer.style.width = "100%"
  shadowContainer.style.height = "100%"
  shadowContainer.style.pointerEvents = "none"

  const rootElement = document.createElement("div")
  rootElement.id = ROOT_ID
  rootElement.className = "feynotes-wrapper"
  rootElement.style.display = "block"
  rootElement.style.pointerEvents = "auto"

  ensureShadowStyles(shadowRoot)
  shadowContainer.appendChild(rootElement)
  shadowRoot.appendChild(shadowContainer);
  (document.body || document.documentElement).appendChild(shadowHost)

  return rootElement
}

let root: ReturnType<typeof createRoot> | null = null
let rootElement: HTMLElement | null = null

function ensureStyles() {
  // Styles are bundled through the content entry so the React mount logic
  // only needs to guard against duplicate renders here.
}

function readTips() {
  if (location.host !== "feedly.com") {
    return
  }

  const keywords = ["笔记", "工具", "哲学", "创新", "经典", "内容", "邮箱", "机器学习", "市值", "思维"]
  const timer = window.setInterval(() => {
    const list = Array.from(document.querySelectorAll<HTMLElement>(".list-entries .content"))
    if (list.length === 0) {
      return
    }

    window.clearInterval(timer)
    list.forEach((item) => {
      const text = item.innerText
      keywords.forEach((keyword) => {
        if (text.includes(keyword) && !item.classList.contains("isHighlight")) {
          item.style.border = "2px solid orange"
          const title = item.querySelector<HTMLAnchorElement>("a.entry__title")
          if (title) {
            title.innerText = `${title.innerText} [${keyword}]`
          }
          const summary = item.querySelector<HTMLElement>("div.summary")
          if (summary) {
            summary.style.maxHeight = "600px"
          }
          item.classList.add("isHighlight")
        }
      })
    })
  }, 1000)
}

function shouldRedirectUrl() {
  if (location.href.startsWith("https://m.thepaper.cn/")) {
    location.href = location.href.replace("https://m.thepaper.cn", "https://thepaper.cn")
    return true
  }

  if (
    location.href.startsWith("https://twitter.com/") &&
    location.href.includes("/status/") &&
    !location.href.includes("?feynman")
  ) {
    location.href = `${location.href}?feynman`
    return true
  }

  return false
}

function canRenderCurrentDocument() {
  const contentType = document.contentType || ""
  return contentType.includes("text/html") || contentType.includes("text/plain")
}

function renderNotes() {
  const currentRootElement = getRootContainer()

  if (rootElement !== currentRootElement) {
    rootElement = currentRootElement
    root = null
  }

  if (!root) {
    root = createRoot(currentRootElement)
  }

  ensureStyles()
  root.render(<Notes />)
}

function init() {
  if (shouldRedirectUrl()) {
    return
  }

  window.setTimeout(readTips, 100)

  document.body.addEventListener(
    "load",
    () => {
      readTips()
      restoreLinks()
    },
    false
  )

  window.setTimeout(() => {
    if (!canRenderCurrentDocument()) {
      return
    }
    renderNotes()
  }, 2000)
}

export function mountFeynmanNotes() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true })
  } else {
    init()
  }
}

export default Notes
