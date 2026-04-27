import { md5 } from "./libs/md5-browser"
import type {
  Article,
  ArticleItem,
  Book,
  CurrentNote,
  Note,
  NotesProps,
  Topic,
  UserInfo
} from "./types"
import { getTitle, plainFormat, scrollToHL } from "./utils/pageUtils"
import { createQRCodeDataUrl, html2canvas, Readability } from "./vendor/content-libs"
import React, { useEffect, useRef, useState } from "./vendor/react-global"

const ARTICLE_CACHE_KEY = "article"
const USER_COOKIE_KEY = "userInfo"
const PANEL_PADDING = "400px"
const SYSTEM_COVER_COUNT = 10
const SYSTEM_COVER_BASE = "https://notes.bluetech.top/libs/covers"
const PUBLIC_BASE_URL = "https://notes.bluetech.top/published"

type FeynType = "close" | "feynote" | "weread" | "linkrs"

interface RequestPayload {
  api?: string
  data?: unknown
  name?: string
  token?: string
  type: "request" | "setCookie" | "getCookie"
  value?: unknown
}

interface RuntimeCookie {
  value?: string
}

interface RequestResult<T = unknown> {
  code?: string | number
  data?: T
  msg?: string
  [key: string]: unknown
}

interface PageNoteLight {
  openEditor: () => void
}

interface PageNoteStep {
  images?: string[]
  text: string
  tip?: string
  time: number
  x: number
  y: number
  [key: string]: unknown
}

interface PageNoteData {
  pageId?: string
  steps: PageNoteStep[]
  [key: string]: unknown
}

interface PageNoteInstance {
  CONSTANT: {
    SYNCED: number
  }
  plainData: PageNoteData
  addListener: (listener: (status: number) => void) => void
  init: (data: PageNoteData) => void
}

interface PageNoteConstructor {
  new (
    name: string,
    options: {
      brushes: Array<{
        bg: string
        label: string
        level: number
        shortcut?: string
      }>
      categories: unknown[]
      debug: boolean
      enableMarkImg: boolean
      functionColors: unknown[]
      renderAnnotation: (data: PageNoteStep, light: PageNoteLight) => [null, unknown[]]
      showBarTimeout: number
    }
  ): PageNoteInstance
}

interface WeReadBookInfo {
  author: string
  bookId: string
  cover?: string
  title: string
}

interface WeReadBookEntry extends Book {
  book: WeReadBookInfo
}

interface WeReadBookmark {
  bookmarkId: string
  createTime: number
  markText: string
  range: string
}

interface WeReadChapter {
  chapterUid: string
  title: string
}

interface WeReadReviewItem {
  review: {
    content: string
    range: string
  }
}

interface WeReadBookNotesResponse {
  book: WeReadBookInfo
  chapters: WeReadChapter[]
  reviews: Record<string, { content: string; range: string }>
  updated: WeReadBookmark[]
}

interface StoredUserInfo extends UserInfo {
  token?: string
}

declare global {
  interface Window {
    PageNote?: PageNoteConstructor
    html2md?: (html: string) => string
    pagenote?: PageNoteInstance
  }
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback
  }
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.warn("Failed to parse JSON value", error)
    return fallback
  }
}

function removeHtml(value: string | undefined): string {
  if (!value) {
    return ""
  }
  const container = document.createElement("div")
  container.innerHTML = value
  return container.textContent?.trim() ?? ""
}

function formatFileTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes())
  ].join("")
}

function getDefaultCover(): string {
  const next = (Math.ceil(Math.random() * 99999) % SYSTEM_COVER_COUNT) + 1
  return `${SYSTEM_COVER_BASE}/${next}.png`
}

function getSystemPublishedLink(account: string, uniqueId: string): string {
  return `${PUBLIC_BASE_URL}/${account}/${uniqueId}.html`
}

async function waitForPageNote(retries = 40): Promise<PageNoteConstructor | null> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    if (window.PageNote) {
      return window.PageNote
    }
    await new Promise((resolve) => window.setTimeout(resolve, 100))
  }
  return null
}

function downloadWithAnchor(fileUrl: string, fileName: string) {
  const downloadFrame = document.createElement("iframe")
  downloadFrame.id = downloadFrame.name = "f_downIframe"
  const temporaryLink = document.createElement("a")
  temporaryLink.href = fileUrl
  temporaryLink.target = "f_downIframe"
  temporaryLink.download = fileName

  document.body.appendChild(downloadFrame)
  document.body.appendChild(temporaryLink)
  temporaryLink.click()
  document.body.removeChild(temporaryLink)
  document.body.removeChild(downloadFrame)

  if (fileUrl.startsWith("blob:")) {
    URL.revokeObjectURL(fileUrl)
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function isAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return Boolean(url.host)
  } catch (error) {
    return false
  }
}

function createArticleMarkdown(article: Article, notes: Note[]): string {
  let markdown = `# ${article.title} \n\n 原文：${article.originUrl} \n`

  if (article.banner) {
    markdown += `\n ![](${article.banner} "") \n\n`
  }

  notes.forEach((item) => {
    markdown += `\n\n ${item.text}`
    if (item.tip) {
      markdown += `\n > ${item.tip}`
    }
  })

  markdown += "\n\n\n"
  return markdown
}

function getStoredArticle(): Partial<Article> {
  return safeJsonParse<Partial<Article>>(localStorage.getItem(ARTICLE_CACHE_KEY), {})
}

async function runtimeRequest<T = unknown>(payload: RequestPayload): Promise<T> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(payload, (response) => {
      resolve(response as T)
    })
  })
}

function Notes({ feynType: externalType, onTransPanel }: NotesProps) {
  const storedArticle = getStoredArticle()
  const [pageId] = useState(() => md5(location.href))
  const [feynType, setFeynType] = useState<FeynType>(externalType ?? "close")
  const [isSharing, setIsSharing] = useState(false)
  const [isLogin, setIsLogin] = useState(false)
  const [saved, setSaved] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [books, setBooks] = useState<WeReadBookEntry[]>([])
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [token, setToken] = useState("")
  const [localImage, setLocalImage] = useState("")
  const [userInfo, setUserInfo] = useState<UserInfo>({
    account: storedArticle.account ?? "",
    psw: "",
    password: ""
  })
  const [article, setArticle] = useState<Article>({
    id: storedArticle.id ?? "",
    target: storedArticle.target ?? {},
    title: storedArticle.title ?? "",
    titleEdit: 0,
    topicIds: storedArticle.topicIds ?? [],
    banner: storedArticle.banner ?? "",
    originUrl: storedArticle.originUrl ?? "",
    public: storedArticle.public ?? 1,
    uniqueId: storedArticle.uniqueId ?? ""
  })
  const [currentNote, setCurrentNote] = useState<CurrentNote>({
    open: false,
    data: {
      day: "",
      id: "",
      note: "",
      spaceTitle: "",
      summary: "",
      tip: ""
    },
    qrcode: ""
  })
  const [card, setCard] = useState({
    image: "",
    name: "",
    prog: "生成中…",
    status: "",
    styleType: ""
  })

  const articleRef = useRef(article)
  const notesRef = useRef(notes)
  const tokenRef = useRef(token)
  const userInfoRef = useRef(userInfo)
  const pagenoteRef = useRef<PageNoteInstance | null>(null)
  const autosaveIntervalRef = useRef<number | null>(null)
  const bannersRef = useRef<{ data: string[]; index: number }>({
    data: [],
    index: -1
  })
  const actionLocksRef = useRef<Record<string, number>>({})
  const syncStatusRef = useRef({ lastLength: 0, listenerAttached: false })
  const mountedRef = useRef(true)

  useEffect(() => {
    articleRef.current = article
    try {
      localStorage.setItem(ARTICLE_CACHE_KEY, JSON.stringify(article))
    } catch (error) {
      console.warn("Failed to cache article", error)
    }
  }, [article])

  useEffect(() => {
    notesRef.current = notes
  }, [notes])

  useEffect(() => {
    tokenRef.current = token
  }, [token])

  useEffect(() => {
    userInfoRef.current = userInfo
  }, [userInfo])

  useEffect(() => {
    if (externalType) {
      setFeynType(externalType)
    }
  }, [externalType])

  useEffect(() => {
    const body = document.body
    body.style.paddingRight = feynType === "close" ? "0px" : PANEL_PADDING

    return () => {
      body.style.paddingRight = "0px"
    }
  }, [feynType])

  const runThrottledAction = (key: string, waitMs: number, callback: () => void) => {
    const lastRun = actionLocksRef.current[key] ?? 0
    const now = Date.now()
    if (now - lastRun < waitMs) {
      return
    }
    actionLocksRef.current[key] = now
    callback()
  }

  const cachePageNotes = (data: PageNoteData) => {
    try {
      localStorage.setItem(pageId, JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to cache page notes", error)
    }
  }

  const getCachedPageNotes = (): PageNoteData =>
    safeJsonParse<PageNoteData>(localStorage.getItem(pageId), { steps: [] })

  const persistUserCookie = async (value: StoredUserInfo) => {
    await runtimeRequest({
      name: USER_COOKIE_KEY,
      type: "setCookie",
      value
    })
  }

  const downloadTextFile = (content: string, fileName: string) => {
    const file = new File([content], fileName, { type: "text/plain" })
    const objectUrl = URL.createObjectURL(file)
    downloadWithAnchor(objectUrl, fileName)
  }

  const getBanners = () => {
    const images = Array.from(document.querySelectorAll("img"))
    const banners = images
      .filter(
        (image) =>
          Boolean(image.src) &&
          image.clientHeight >= 120 &&
          image.clientWidth >= 120 &&
          image.src.startsWith("http")
      )
      .map((image) => image.src)

    return banners.length > 0 ? banners : [getDefaultCover()]
  }

  const setBanner = (refresh: boolean) => {
    const bannerKey = `${pageId}-banner`
    const cachedBanner = localStorage.getItem(bannerKey) ?? ""

    if (cachedBanner && !refresh) {
      setArticle((previous) => ({
        ...previous,
        banner: cachedBanner
      }))
      return
    }

    const banners = getBanners()
    bannersRef.current.data = banners
    const nextIndex = (bannersRef.current.index + 1) % banners.length
    const nextBanner = banners[nextIndex]
    bannersRef.current.index = nextIndex

    setArticle((previous) => ({
      ...previous,
      banner: nextBanner
    }))
    localStorage.setItem(bannerKey, nextBanner)
  }

  const setArticleInfo = () => {
    const nextTitle = getTitle()
    setBanner(false)
    setArticle((previous) => ({
      ...previous,
      originUrl: location.href,
      title: nextTitle
    }))
  }

  const notesRefresh = (data: PageNoteData) => {
    setNotes((data.steps ?? []) as Note[])
  }

  const notesPublish = async (data: { id?: string; uniqueId?: string }) => {
    const response = await runtimeRequest<RequestResult>({
      api: "Article.publish",
      data,
      token: tokenRef.current,
      type: "request"
    })

    if (!data.uniqueId) {
      return ""
    }

    if (response.code && String(response.code) !== "0") {
      throw new Error(response.msg || "发布失败")
    }

    return getSystemPublishedLink(userInfoRef.current.account, data.uniqueId)
  }

  const noteSaveToServer = async () => {
    const currentNotes = notesRef.current
    const currentArticle = articleRef.current
    const currentToken = tokenRef.current

    if (!currentToken || currentNotes.length === 0) {
      return null
    }

    const paragraphs = currentNotes.map((item) => ({
      markTime: item.time,
      note: item.text,
      sort: item.y,
      summary: item.tip || ""
    }))

    const uniqueId = md5(currentArticle.title + location.host)
    const cacheData = getCachedPageNotes()
    cacheData.pageId = pageId

    const payload = {
      ...currentArticle,
      extra: JSON.stringify(cacheData),
      paragraphs,
      tagIds: currentArticle.topicIds,
      title: currentArticle.title.substring(0, 200),
      uniqueId
    }

    const response = await runtimeRequest<RequestResult<{ id: string; uniqueId: string }>>({
      api: "Article.add",
      data: payload,
      token: currentToken,
      type: "request"
    })

    if (response.code && String(response.code) !== "0") {
      throw new Error(response.msg || "保存失败")
    }

    if (response.data) {
      setArticle((previous) => ({
        ...previous,
        id: response.data?.id ?? previous.id,
        uniqueId
      }))
      return response.data
    }

    return null
  }

  const loadTopics = async (currentToken: string) => {
    if (!currentToken) {
      setTopics([])
      return
    }

    const response = await runtimeRequest<RequestResult<Topic[]>>({
      api: "Topic.list",
      data: {
        tagStatus: "ENABLE"
      },
      token: currentToken,
      type: "request"
    })

    if (String(response.code ?? "") === "40101") {
      await persistUserCookie({
        ...userInfoRef.current,
        token: ""
      })
      setToken("")
      return
    }

    setTopics(response.data ?? [])
  }

  const createPublicLink = () => {
    runThrottledAction("createPublicLink", 5000, async () => {
      try {
        const savedArticle = await noteSaveToServer()
        if (!savedArticle) {
          return
        }

        if (!articleRef.current.public) {
          setIsSharing(false)
          setSaved(true)
          window.setTimeout(() => setSaved(false), 3000)
          return
        }

        const link = await notesPublish(savedArticle)
        if (link) {
          window.open(link)
        }
        setIsSharing(false)
      } catch (error) {
        alert(error instanceof Error ? error.message : "发布失败")
      }
    })
  }

  const userLogin = () => {
    runThrottledAction("userLogin", 5000, async () => {
      const currentUser = userInfoRef.current

      if (!currentUser.account || !currentUser.psw) {
        alert("请输入用户名和密码")
        return
      }

      const accountPattern = /^[a-zA-Z0-9_-]{6,50}$/
      if (!accountPattern.test(currentUser.account)) {
        alert("用户名只允许使用字母、数字、下划线和减号，长度为 6~50")
        return
      }

      const passwordPattern = /^[a-zA-Z0-9_-]{10,50}$/
      if (!passwordPattern.test(currentUser.psw)) {
        alert("密码只允许使用字母、数字、下划线和减号，长度为 10~50")
        return
      }

      const payload = {
        ...currentUser,
        password: md5(currentUser.psw)
      }

      const response = await runtimeRequest<RequestResult<StoredUserInfo>>({
        api: "User.login",
        data: payload,
        type: "request"
      })

      if (String(response.code ?? "") !== "0" || !response.data) {
        alert(response.msg || "登录失败")
        return
      }

      await persistUserCookie(response.data)
      location.reload()
    })
  }

  const logout = async () => {
    setToken("")
    setUserInfo((previous) => ({
      ...previous,
      psw: ""
    }))

    await persistUserCookie({
      ...userInfoRef.current,
      token: ""
    })
  }

  const initPagenote = async (extra?: PageNoteData) => {
    const PageNote = await waitForPageNote()
    if (!PageNote) {
      console.warn("PageNote is unavailable on this page")
      return
    }

    const data = extra && extra.steps.length > 0 ? extra : getCachedPageNotes()
    const initialData: PageNoteData = {
      ...data,
      steps: data.steps ?? []
    }

    if (!window.pagenote) {
      window.pagenote = new PageNote("Feynman", {
        brushes: [
          {
            bg: "#FF6900",
            label: "一级画笔",
            level: 1,
            shortcut: "p"
          }
        ],
        categories: [],
        debug: false,
        enableMarkImg: true,
        functionColors: [],
        renderAnnotation: (data, light) => {
          const element = document.createElement("div")
          const aside = document.createElement("div")
          aside.innerHTML = `<pagenote-block aria-controls="aside-info">${new Date(
            data.time
          ).toLocaleDateString()}</pagenote-block>`
          element.appendChild(aside)
          element.ondblclick = () => {
            light.openEditor()
          }
          return [null, []]
        },
        showBarTimeout: 0
      })
    }

    pagenoteRef.current = window.pagenote
    pagenoteRef.current.init(initialData)
    syncStatusRef.current.lastLength = initialData.steps.length
    notesRefresh(initialData)

    if (!syncStatusRef.current.listenerAttached) {
      syncStatusRef.current.listenerAttached = true

      pagenoteRef.current.addListener((status) => {
        const instance = pagenoteRef.current
        if (!instance) {
          return
        }

        const steps = instance.plainData.steps ?? []

        if (status === instance.CONSTANT.SYNCED) {
          const sanitizedSteps = steps.map((item) => ({
            ...item,
            text: removeHtml(item.text),
            tip: removeHtml(item.tip)
          }))
          const nextData = {
            ...instance.plainData,
            steps: sanitizedSteps
          }

          instance.plainData = nextData
          cachePageNotes(nextData)
          notesRefresh(nextData)
        }

        if (
          status === 10 &&
          tokenRef.current &&
          steps.length !== syncStatusRef.current.lastLength
        ) {
          syncStatusRef.current.lastLength = steps.length
          void noteSaveToServer()
        } else {
          syncStatusRef.current.lastLength = steps.length
        }
      })
    }
  }

  const initPagenoteFromCloud = async (currentToken: string) => {
    const title = getTitle()
    const uniqueId = md5(title + location.host)
    const response = await runtimeRequest<RequestResult<{
      banner?: string
      extra?: string
      originUrl?: string
      paragraphs?: Array<{ note: string; summary?: string; updatedAt?: string }>
      title?: string
      uniqueId?: string
    }>>({
      api: "Article.notes",
      data: {
        uniqueId
      },
      token: currentToken,
      type: "request"
    })

    const data = response.data ?? {}
    const notesFromServer = data.paragraphs ?? []
    const extra = safeJsonParse<PageNoteData>(data.extra ?? "{}", { steps: [] })
    extra.steps = extra.steps ?? []

    const localData = getCachedPageNotes()
    if (extra.pageId === pageId && extra.steps.length > 0 && localData.steps.length > 0) {
      const noteMap = new Map<string, PageNoteStep>()

      extra.steps.forEach((item) => {
        noteMap.set(md5(item.text), item)
      })

      localData.steps.forEach((item) => {
        const key = md5(item.text)
        if (!noteMap.has(key)) {
          extra.steps.push(item)
          noteMap.set(key, item)
        }
      })

      notesFromServer.forEach((item) => {
        const key = md5(item.note)
        const localStep = noteMap.get(key)
        if (!localStep || !item.updatedAt) {
          return
        }
        if (new Date(item.updatedAt).getTime() > localStep.time) {
          localStep.tip = item.summary || ""
        }
      })
    }

    await initPagenote(extra)
    return data
  }

  const loadBooks = async () => {
    const response = await runtimeRequest<{ books?: WeReadBookEntry[] }>({
      api: "weRead.books",
      type: "request"
    })
    setBooks(response.books ?? [])
  }

  const loadBookNotes = async (book: WeReadBookEntry) => {
    const [notesResponse, summaryResponse] = await Promise.all([
      runtimeRequest<{
        book: WeReadBookInfo
        chapters: WeReadChapter[]
        updated: WeReadBookmark[]
      }>({
        api: "weRead.notes",
        data: book,
        type: "request"
      }),
      runtimeRequest<{ reviews?: WeReadReviewItem[] }>({
        api: "weRead.summarys",
        data: book,
        type: "request"
      })
    ])

    const reviews: Record<string, { content: string; range: string }> = {}
    ;(summaryResponse.reviews ?? []).forEach((item) => {
      reviews[item.review.range] = item.review
    })

    return {
      book: notesResponse.book,
      chapters: notesResponse.chapters ?? [],
      reviews,
      updated: notesResponse.updated ?? []
    } satisfies WeReadBookNotesResponse
  }

  const downloadWeReadBook = async (book: WeReadBookEntry) => {
    const result = await loadBookNotes(book)
    const chapterMap = new Map<string, WeReadChapter>()
    result.chapters.forEach((item) => chapterMap.set(item.chapterUid, item))

    let markdown = `# ${result.book.title} \n\n`
    if (result.book.cover) {
      markdown += `\n ![](${result.book.cover} "") \n\n`
    }

    result.updated
      .slice()
      .reverse()
      .forEach((item) => {
        const chapterUid = item.bookmarkId.split("_")[2] ?? ""
        markdown += `\n\n## ${chapterMap.get(chapterUid)?.title ?? ""}`
        markdown += `\n${item.markText}`
        if (result.reviews[item.range]) {
          markdown += `\n > ${result.reviews[item.range].content}`
        }
      })

    markdown += "\n\n\n"
    const fileName = `${result.book.title || formatFileTime(new Date())}-书摘.md`
    downloadTextFile(markdown, fileName)
  }

  const shareWeReadBook = () => {
    runThrottledAction("shareWeReadBook", 5000, async () => {
      const currentBook = articleRef.current.target as WeReadBookEntry | undefined
      if (!currentBook?.book?.bookId) {
        return
      }

      try {
        const result = await loadBookNotes(currentBook)
        const paragraphs = result.updated.slice().reverse().map((item, index) => ({
          markTime: item.createTime,
          note: item.markText,
          sort: index,
          summary: result.reviews[item.range]?.content || ""
        }))

        const uniqueId = md5(`weread.qq.com${result.book.bookId}`)
        const payload = {
          ...result.book,
          banner: result.book.cover,
          extra: "",
          originUrl: `https://weread.qq.com/web/search/books?author=${encodeURIComponent(
            result.book.author
          )}`,
          paragraphs,
          tagIds: articleRef.current.topicIds,
          uniqueId
        }

        const addResponse = await runtimeRequest<RequestResult<{ id: string; uniqueId: string }>>({
          api: "Article.add",
          data: payload,
          token: tokenRef.current,
          type: "request"
        })

        if (String(addResponse.code ?? "") !== "0" || !addResponse.data) {
          throw new Error(addResponse.msg || "保存失败")
        }

        if (!articleRef.current.public) {
          setIsSharing(false)
          setSaved(true)
          window.setTimeout(() => setSaved(false), 3000)
          return
        }

        const link = await notesPublish({
          id: addResponse.data.id,
          uniqueId
        })
        if (link) {
          window.open(link)
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : "分享失败")
      }
    })
  }

  const searchBooks = () => {
    const content = document.body.innerText
    const pattern = /《([^《|》]*)》/g
    const results = new Set<string>()
    let match: RegExpExecArray | null

    do {
      match = pattern.exec(content)
      if (match?.[1]) {
        results.add(match[1])
      }
    } while (match)

    results.forEach((name) => {
      window.open(
        `https://search.douban.com/book/subject_search?search_text=${encodeURIComponent(
          name
        )}&cat=1001`
      )
    })
  }

  const loadArticles = async () => {
    if (!tokenRef.current) {
      return
    }

    const response = await runtimeRequest<RequestResult<{
      records?: ArticleItem[]
    }>>({
      api: "Article.list",
      data: {
        current: 1,
        includeTagIds: "",
        size: 50,
        title: ""
      },
      token: tokenRef.current,
      type: "request"
    })

    setArticles(response.data?.records ?? [])
  }

  const getOneNote = (item: ArticleItem) => {
    const extra = safeJsonParse<PageNoteData>(item.extra || "{}", { steps: [] })
    const tipNote = extra.steps.find((step) => step.tip)
    return tipNote ?? extra.steps[0] ?? { text: "", tip: "" }
  }

  const changeTitle = () => {
    setArticle((previous) => ({
      ...previous,
      titleEdit: previous.titleEdit + 1
    }))
  }

  const createPublicLinkPop = () => {
    if (!tokenRef.current) {
      setIsLogin(true)
      return
    }
    setIsSharing(true)
  }

  const shareWeReadBookPop = (book: WeReadBookEntry) => {
    if (!tokenRef.current) {
      setIsLogin(true)
      return
    }

    setArticle((previous) => ({
      ...previous,
      target: book
    }))
    setIsSharing(true)
  }

  const transPanel = async (type?: FeynType) => {
    let pageName: FeynType = "feynote"
    if (location.host === "weread.qq.com") {
      pageName = "weread"
      await loadBooks()
    }
    if (location.host === "www.36linkr.com") {
      pageName = "linkrs"
      await loadArticles()
    }

    const nextType = type ?? pageName
    setFeynType(nextType)
    onTransPanel?.(nextType)
  }

  const downloadArticle = () => {
    const clone = document.cloneNode(true) as Document
    const readable = new Readability(clone).parse()
    const html = readable?.content ?? document.body.innerHTML
    const markdown = window.html2md ? window.html2md(html) : removeHtml(html)
    const content = `${markdown}\n\n 来源：${location.href}\n\n`
    const fileName = `${articleRef.current.title || formatFileTime(new Date())}.md`
    downloadTextFile(content, fileName)
  }

  const downloadNotes = () => {
    if (notesRef.current.length === 0) {
      console.log("无笔记数据")
      return
    }

    const fileName = `${
      articleRef.current.title || formatFileTime(new Date())
    }-笔记.md`
    downloadTextFile(createArticleMarkdown(articleRef.current, notesRef.current), fileName)
  }

  const loadLocalImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const imageData = await readFileAsDataUrl(file)
      setLocalImage(imageData)
    } catch (error) {
      console.warn("Failed to load local image", error)
    }
  }

  const refreshImage = () => {
    const banners = getBanners()
    const next = Math.floor(Math.random() * banners.length)
    setLocalImage(banners[next] ?? "")
  }

  const createCard = (note: Note) => {
    runThrottledAction("createCard", 2000, async () => {
      const account = userInfoRef.current.account
      const formattedText = note.text
        .split("\n\n")
        .join("\n")
        .split("\n \n")
        .join("\n")
        .split("\n")
        .join("<br>")

      const qrCode = await createQRCodeDataUrl(location.href)

      setCard((previous) => ({
        ...previous,
        status: ""
      }))
      setCurrentNote({
        data: {
          day: new Date().toLocaleDateString("zh-CN").replaceAll("/", "/"),
          id: "",
          note: formattedText,
          spaceTitle: account,
          summary: note.tip || "",
          tip: note.tip || ""
        },
        open: true,
        qrcode: qrCode
      })
    })
  }

  const setCardStyle = (styleType: string) => {
    setCard((previous) => ({
      ...previous,
      status: "",
      styleType
    }))
  }

  const downloadCard = async () => {
    const target = document.getElementById("feynCard")
    if (!target) {
      return
    }

    setCard((previous) => ({
      ...previous,
      prog: "生成中…",
      status: "creating"
    }))

    const interval = window.setInterval(() => {
      setCard((previous) => {
        const base = "生成中"
        const dots = previous.prog.replace(base, "")
        const nextDots = dots.length >= 5 ? "…" : `${dots}…`
        return {
          ...previous,
          prog: `${base}${nextDots}`
        }
      })
    }, 200)

    try {
      const canvas = await html2canvas(target, {
        allowTaint: true,
        backgroundColor: null,
        proxy: "",
        useCORS: true,
        width: 480
      })
      const image = canvas.toDataURL("image/png", 1.0)
      setCard((previous) => ({
        ...previous,
        image,
        name: articleRef.current.title,
        status: "end"
      }))
    } finally {
      window.clearInterval(interval)
    }
  }

  const endCreateCard = () => {
    setCurrentNote((previous) => ({
      ...previous,
      open: false
    }))
    setCard((previous) => ({
      ...previous,
      status: ""
    }))
    setLocalImage("")
  }

  useEffect(() => {
    mountedRef.current = true

    const syncFromCookie = async () => {
      const cookie = await runtimeRequest<RuntimeCookie>({
        name: USER_COOKIE_KEY,
        type: "getCookie"
      })
      const cookieUser = safeJsonParse<StoredUserInfo>(cookie.value, {
        account: "",
        password: "",
        psw: "",
        token: ""
      })

      if (!mountedRef.current) {
        return
      }

      setUserInfo((previous) => ({
        ...previous,
        account: cookieUser.account || previous.account
      }))
      setToken(cookieUser.token || "")

      await loadTopics(cookieUser.token || "")

      if (cookieUser.token) {
        const cloudArticle = await initPagenoteFromCloud(cookieUser.token)
        if (!mountedRef.current) {
          return
        }
        setArticle((previous) => ({
          ...previous,
          banner: cloudArticle.banner || previous.banner,
          originUrl: cloudArticle.originUrl || previous.originUrl,
          title: cloudArticle.title || previous.title,
          uniqueId: cloudArticle.uniqueId || previous.uniqueId
        }))
        if (!cloudArticle.banner) {
          setArticleInfo()
        }
      } else {
        await initPagenote()
        if (mountedRef.current) {
          setArticleInfo()
        }
      }
    }

    const handleClipboard = async (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData
      if (!clipboardData) {
        return
      }

      const text = clipboardData.getData("text/plain")
      if (text && isAbsoluteUrl(text)) {
        setArticle((previous) => ({
          ...previous,
          banner: text
        }))
        localStorage.setItem(`${pageId}-banner`, text)
        return
      }

      const fileItem = Array.from(clipboardData.items).find((item) =>
        item.type.startsWith("image/")
      )
      const file = fileItem?.getAsFile()
      if (!file) {
        return
      }

      const imageData = await readFileAsDataUrl(file)
      setArticle((previous) => ({
        ...previous,
        banner: imageData
      }))
      localStorage.setItem(`${pageId}-banner`, imageData)
    }

    void syncFromCookie()
    document.addEventListener("paste", handleClipboard)
    document.addEventListener("copy", handleClipboard)

    return () => {
      mountedRef.current = false
      document.removeEventListener("paste", handleClipboard)
      document.removeEventListener("copy", handleClipboard)
      if (autosaveIntervalRef.current) {
        window.clearInterval(autosaveIntervalRef.current)
      }
    }
  }, [pageId])

  useEffect(() => {
    if (autosaveIntervalRef.current) {
      window.clearInterval(autosaveIntervalRef.current)
      autosaveIntervalRef.current = null
    }

    if (!token || notes.length === 0) {
      return
    }

    autosaveIntervalRef.current = window.setInterval(() => {
      void noteSaveToServer()
    }, 5 * 60 * 1000)

    return () => {
      if (autosaveIntervalRef.current) {
        window.clearInterval(autosaveIntervalRef.current)
        autosaveIntervalRef.current = null
      }
    }
  }, [notes.length, token])

  const renderFeynotePanel = () => (
    <>
      <div className="feynote-banner" onClick={() => setBanner(true)}>
        {article.banner ? <img alt="" src={article.banner} /> : null}
        <div className="feynote-banner-text">
          {userInfo.account ? (
            <a
              className="feynote-author"
              href={
                article.uniqueId
                  ? getSystemPublishedLink(userInfo.account, article.uniqueId)
                  : `https://notes.bluetech.top/public/home.html?user=${userInfo.account}`
              }
              rel="noreferrer"
              target="_blank">
              {userInfo.account}
            </a>
          ) : null}
          {token ? (
            <span
              className="feynote-logout"
              onClick={(event) => {
                event.stopPropagation()
                void logout()
              }}>
              退出
            </span>
          ) : null}
        </div>
      </div>

      <div className="feynote-header">
        {article.titleEdit >= 10 ? (
          <input
            onChange={(event) =>
              setArticle((previous) => ({
                ...previous,
                title: event.target.value
              }))
            }
            value={article.title}
          />
        ) : (
          <h2 onClick={changeTitle}>{article.title || "Feynman 笔记"}</h2>
        )}
      </div>

      <div className="feynote-main">
        {notes.map((note, index) => (
          <div
            className="feynote-item"
            data-images={String(note.images ?? "")}
            key={`${note.time}-${index}`}>
            <div className="feynote-item-content">
              <a className="feynote-item-card" onClick={() => createCard(note)}>
                ✂
              </a>
              <span
                dangerouslySetInnerHTML={{ __html: plainFormat(note.text) }}
                onClick={() => scrollToHL(note)}
              />
            </div>
            {note.tip ? (
              <div
                className="feynote-item-remark"
                dangerouslySetInnerHTML={{ __html: plainFormat(note.tip) }}
                onClick={() => scrollToHL(note)}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="feynote-foot">
        <span className="feynote-btn" onClick={downloadNotes}>
          笔记
        </span>
        <span className="feynote-btn" onClick={downloadArticle}>
          原文
        </span>
        <span className="feynote-btn" onClick={searchBooks}>
          相关书籍
        </span>
        <span className="feynote-btn" onClick={createPublicLinkPop}>
          分享
        </span>
        {token ? (
          <a href="http://notes.bluetech.top/public/index.html" rel="noreferrer" target="_blank">
            管理
          </a>
        ) : null}
        <span className="feynote-btn" onClick={() => void transPanel("close")} style={{ marginLeft: "1rem" }}>
          收起
        </span>
      </div>
    </>
  )

  const renderWeReadPanel = () => (
    <>
      <div className="feynote-header">
        <h2>
          {userInfo.account ? (
            <a
              href={`https://notes.bluetech.top/public/home.html?user=${userInfo.account}`}
              rel="noreferrer"
              target="_blank">
              {userInfo.account}
            </a>
          ) : null}
          完读书籍
        </h2>
      </div>
      <div className="feynote-main feynote-books">
        {books.map((item) => {
          const isDimmed =
            isSharing &&
            Boolean((article.target as WeReadBookEntry | undefined)?.bookId) &&
            (article.target as WeReadBookEntry).bookId !== item.bookId

          return (
            <div
              className={`feynote-book-item ${isDimmed ? "feynote-book-item-disable" : ""}`}
              key={item.bookId}>
              <h3>{item.book.title}</h3>
              <p>作者：【{item.book.author}】</p>
              <p>
                书摘数量：{item.noteCount}
                <span onClick={() => void downloadWeReadBook(item)}>导出笔记</span>
                <span onClick={() => shareWeReadBookPop(item)}>分享</span>
              </p>
            </div>
          )
        })}
      </div>
      <div className="feynote-foot">
        {token ? (
          <a href="http://notes.bluetech.top/public/index.html" rel="noreferrer" target="_blank">
            管理
          </a>
        ) : null}
        {token ? (
          <span className="feynote-btn" onClick={() => void logout()}>
            退出
          </span>
        ) : null}
        <span className="feynote-btn" onClick={() => void transPanel("close")}>
          关闭
        </span>
      </div>
    </>
  )

  const renderLinkrsPanel = () => (
    <>
      <div className="feynote-header">
        <h2>可用文章</h2>
      </div>
      <div className="feynote-main">
        {articles.map((item, index) => {
          const note = getOneNote(item)
          return (
            <div className="feynote-item" key={`${item.originUrl}-${index}`}>
              <div className="feynote-item-content" style={{ textIndent: 0 }}>
                <a href={item.originUrl} rel="noreferrer" target="_blank">
                  {item.title}
                </a>
              </div>
              <div className="feynote-item-content" style={{ textIndent: 0 }}>
                {note.text}
              </div>
              {note.tip ? <div className="feynote-item-remark">{note.tip}</div> : null}
            </div>
          )
        })}
      </div>
      <div className="feynote-foot">
        {token ? (
          <a href="http://notes.bluetech.top/public/index.html" rel="noreferrer" target="_blank">
            管理
          </a>
        ) : null}
        <span className="feynote-btn" onClick={() => void transPanel("close")}>
          关闭
        </span>
      </div>
    </>
  )

  return (
    <>
      {feynType === "close" ? (
        <div className="feynote-panel-fold">
          {notes.length > 0 ? <span className="feynote-count">{notes.length}</span> : null}
          <span className="feynote-button" onClick={() => void transPanel()}>
            Feynman 笔记
          </span>
        </div>
      ) : (
        <div className="feynotes" id="feynote-canvas">
          {feynType === "feynote" ? renderFeynotePanel() : null}
          {feynType === "weread" ? renderWeReadPanel() : null}
          {feynType === "linkrs" ? renderLinkrsPanel() : null}

          {saved ? (
            <div className="feynote-login">
              <div className="feynote-topics">
                <div className="feynote-label"></div>
                <label>保存成功！</label>
              </div>
            </div>
          ) : null}

          {isSharing ? (
            <div className="feynote-login">
              <div className="feynote-topics">
                <div className="feynote-label">话题：</div>
                {topics.map((item) => (
                  <label data-label={item.id} key={item.id}>
                    <input
                      checked={article.topicIds.includes(item.id)}
                      name="article-topics"
                      onChange={(event) =>
                        setArticle((previous) => ({
                          ...previous,
                          topicIds: event.target.checked
                            ? [...previous.topicIds, item.id]
                            : previous.topicIds.filter((topicId) => topicId !== item.id)
                        }))
                      }
                      type="checkbox"
                      value={item.id}
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
                <div style={{ height: "10px" }}></div>
                <div className="feynote-label">范围：</div>
                <label>
                  <input
                    checked={article.public === 1}
                    name="article-public"
                    onChange={() =>
                      setArticle((previous) => ({
                        ...previous,
                        public: 1
                      }))
                    }
                    type="radio"
                    value={1}
                  />
                  <span>公开</span>
                </label>
                <label>
                  <input
                    checked={article.public === 0}
                    name="article-public"
                    onChange={() =>
                      setArticle((previous) => ({
                        ...previous,
                        public: 0
                      }))
                    }
                    type="radio"
                    value={0}
                  />
                  <span>仅自己可见</span>
                </label>
              </div>
              <div className="feynote-tags">
                <span
                  className="feynote-button"
                  onClick={() => {
                    if (feynType === "feynote") {
                      createPublicLink()
                    } else {
                      shareWeReadBook()
                    }
                  }}>
                  发布分享
                </span>
                <span onClick={() => setIsSharing(false)}>取消</span>
              </div>
            </div>
          ) : null}

          {isLogin ? (
            <div className="feynote-login">
              <div className="feynote-tags">
                <input
                  onChange={(event) =>
                    setUserInfo((previous) => ({
                      ...previous,
                      account: event.target.value
                    }))
                  }
                  placeholder="账号"
                  type="text"
                  value={userInfo.account}
                />
              </div>
              <div className="feynote-tags">
                <input
                  onChange={(event) =>
                    setUserInfo((previous) => ({
                      ...previous,
                      psw: event.target.value
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      userLogin()
                    }
                  }}
                  placeholder="密码"
                  type="password"
                  value={userInfo.psw}
                />
              </div>
              <div className="feynote-tags">
                <span className="feynote-button" onClick={userLogin}>
                  登录
                </span>
                <a href="https://notes.bluetech.top/public/index.html" rel="noreferrer" target="_blank">
                  注册
                </a>
                <span onClick={() => setIsLogin(false)}>取消</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {currentNote.open ? <div className="feyn-card-img-mask"></div> : null}
      {currentNote.open ? (
        <div className="feyn-card-img" style={{ textAlign: "left", width: "490px" }}>
          <div style={{ height: "40px" }}></div>
          <div
            className="feynote-foot"
            style={{
              background: "#f5f5f5",
              borderRadius: "10px 10px 0 0",
              bottom: "auto",
              top: 0
            }}>
            <span>
              风格：
              <span className="feynote-btn" onClick={() => setCardStyle("1")}>
                默认
              </span>
              <span className="feynote-btn" onClick={() => setCardStyle("2")}>
                去标题
              </span>
              <span className="feynote-btn" onClick={() => setCardStyle("3")}>
                去图
              </span>
            </span>
            <span
              className="feynote-btn"
              onClick={() => void downloadCard()}
              style={{ fontWeight: 700, margin: "0px 7rem 0 4rem" }}>
              生成卡片
            </span>
            <span className="feynote-btn" onClick={endCreateCard}>
              关闭
            </span>
          </div>
          <div className="feyn-note-card" id="feynCard" style={{ width: "480px" }}>
            {card.styleType !== "3" ? (
              <div className="feyn-note-card-input">
                <img
                  alt=""
                  src={localImage || article.banner}
                  style={{ display: "block", width: "480px" }}
                />
                <input
                  className="feynote-upload-image"
                  onChange={(event) => void loadLocalImage(event)}
                  style={{ opacity: 0 }}
                  title="上传"
                  type="file"
                />
                <span className="feynote-refresh-image" onClick={refreshImage} title="刷新"></span>
              </div>
            ) : null}
            <div
              style={{
                background: "#fff",
                lineHeight: 1.3,
                overflow: "hidden",
                padding: "20px",
                width: "450px"
              }}>
              {card.styleType !== "2" ? (
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 400, lineHeight: 1, padding: "0 0 15px" }}>
                    {article.title}
                  </h2>
                  <p
                    className="feyn-note-card-time"
                    style={{
                      color: "#999",
                      fontSize: "14px",
                      lineHeight: 1,
                      paddingBottom: "15px"
                    }}>
                    {currentNote.data.day}
                  </p>
                </div>
              ) : null}
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 400,
                  lineHeight: 1.8,
                  maxHeight: "800px",
                  minHeight: "50px",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                <span dangerouslySetInnerHTML={{ __html: plainFormat(currentNote.data.note) }}></span>
              </div>
              {currentNote.data.tip ? (
                <div
                  className="feyn-note-summary"
                  dangerouslySetInnerHTML={{ __html: plainFormat(currentNote.data.tip) }}
                  style={{
                    background: "#f5f5f5",
                    borderRadius: "5px",
                    fontSize: "14px",
                    fontWeight: 300,
                    lineHeight: 1.5,
                    marginLeft: "20px",
                    marginTop: "10px",
                    maxHeight: "475px",
                    overflow: "hidden",
                    padding: "10px",
                    position: "relative",
                    textOverflow: "ellipsis"
                  }}></div>
              ) : null}
              <div className="feyn-note-footer" style={{ lineHeight: 1, marginTop: "20px", paddingLeft: "20px", width: "460px" }}>
                <img
                  alt=""
                  src={currentNote.qrcode}
                  style={{
                    display: "inline-block",
                    height: "100px",
                    marginRight: "0.5rem",
                    verticalAlign: "middle",
                    width: "100px"
                  }}
                />
                <strong>{userInfo.account}@Feynman 笔记</strong>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {card.status ? (
        <div className="feyn-card-img-data">
          {card.status === "creating" ? (
            <div className="feyn-card-img-creating" style={{ paddingLeft: "2rem" }}>
              {card.prog}
            </div>
          ) : null}
          {card.status === "end" ? <img alt={card.name} src={card.image} /> : null}
        </div>
      ) : null}
    </>
  )
}

export default Notes
