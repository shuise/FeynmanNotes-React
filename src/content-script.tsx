import React from "./vendor/react-global"
import { createRoot } from "./vendor/react-dom-global"

import Notes from "./notes"
import { restoreLinks } from "./utils/tools"

const ROOT_ID = "feynotes-wrapper"

const getRootContainer = () => {
  const existingRoot = document.getElementById(ROOT_ID)
  if (existingRoot) {
    return existingRoot
  }

  const rootElement = document.createElement("div")
  rootElement.id = ROOT_ID
  rootElement.className = "feynotes-wrapper"
  rootElement.style.display = "block"
  document.body.appendChild(rootElement)
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
