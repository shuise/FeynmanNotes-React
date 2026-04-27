import html2canvasModule from "~src/libs/html2canvas.js"
import QRCodeModule from "~src/libs/qrcode.js"
import ReadabilityModule from "~src/libs/Readability.js"

type Html2CanvasOptions = {
  allowTaint?: boolean
  backgroundColor?: string | null
  proxy?: string
  useCORS?: boolean
  width?: number
}

type Html2CanvasFn = (
  element: HTMLElement,
  options?: Html2CanvasOptions
) => Promise<HTMLCanvasElement>

interface ReadabilityArticle {
  content?: string
  title?: string
}

interface ReadabilityInstance {
  parse: () => ReadabilityArticle | null
}

type ReadabilityCtor = new (
  doc: Document,
  options?: Record<string, unknown>
) => ReadabilityInstance

interface QRCodeOptions {
  colorDark?: string
  colorLight?: string
  correctLevel?: number
  height?: number
  text?: string
  width?: number
}

interface QRCodeInstance {
  clear: () => void
  makeCode: (text: string) => void
}

interface QRCodeCtor {
  new (element: HTMLElement, options?: QRCodeOptions): QRCodeInstance
  CorrectLevel?: {
    H?: number
  }
}

function unwrapDefault<T>(moduleValue: T | { default?: T }): T {
  if (
    typeof moduleValue === "object" &&
    moduleValue !== null &&
    "default" in moduleValue &&
    moduleValue.default
  ) {
    return moduleValue.default
  }

  return moduleValue as T
}

const html2canvas = unwrapDefault(
  html2canvasModule as Html2CanvasFn | { default?: Html2CanvasFn }
)

const Readability = unwrapDefault(
  ReadabilityModule as ReadabilityCtor | { default?: ReadabilityCtor }
)

const QRCode = unwrapDefault(
  QRCodeModule as QRCodeCtor | { default?: QRCodeCtor }
)

export { html2canvas, Readability }

export async function createQRCodeDataUrl(text: string): Promise<string> {
  const container = document.createElement("div")
  container.style.left = "-9999px"
  container.style.pointerEvents = "none"
  container.style.position = "fixed"
  container.style.top = "-9999px"
  document.body.appendChild(container)

  try {
    new QRCode(container, {
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel?.H,
      height: 256,
      text,
      width: 256
    })

    const canvas = container.querySelector("canvas")
    if (canvas) {
      return canvas.toDataURL("image/png")
    }

    const image = container.querySelector("img")
    if (image?.src) {
      return image.src
    }

    throw new Error("QR code renderer did not produce a canvas or image element")
  } finally {
    container.remove()
  }
}
