import type * as ReactTypes from "react"

const ReactGlobal = (globalThis as typeof globalThis & {
  React?: typeof ReactTypes
}).React

if (!ReactGlobal) {
  throw new Error("React global is not available")
}

const React = ReactGlobal

export const Fragment = React.Fragment
export const useEffect = React.useEffect
export const useRef = React.useRef
export const useState = React.useState

export default React
