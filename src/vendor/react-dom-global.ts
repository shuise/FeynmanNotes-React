import type * as ReactDOMClientTypes from "react-dom/client"

const ReactDOMGlobal = (globalThis as typeof globalThis & {
  ReactDOM?: typeof ReactDOMClientTypes
}).ReactDOM

if (!ReactDOMGlobal) {
  throw new Error("ReactDOM global is not available")
}

export const createRoot = ReactDOMGlobal.createRoot
export const hydrateRoot = ReactDOMGlobal.hydrateRoot
