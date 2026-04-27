declare module "~src/libs/html2canvas.js" {
  type Html2CanvasOptions = {
    allowTaint?: boolean
    backgroundColor?: string | null
    proxy?: string
    useCORS?: boolean
    width?: number
  }

  const html2canvas: (
    element: HTMLElement,
    options?: Html2CanvasOptions
  ) => Promise<HTMLCanvasElement>

  export default html2canvas
}

declare module "~src/libs/Readability.js" {
  interface ReadabilityArticle {
    content?: string
    title?: string
  }

  interface ReadabilityInstance {
    parse: () => ReadabilityArticle | null
  }

  const Readability: new (
    doc: Document,
    options?: Record<string, unknown>
  ) => ReadabilityInstance

  export default Readability
}

declare module "~src/libs/qrcode.js" {
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

  const QRCode: {
    new (element: HTMLElement, options?: QRCodeOptions): QRCodeInstance
    CorrectLevel?: {
      H?: number
    }
  }

  export default QRCode
}
