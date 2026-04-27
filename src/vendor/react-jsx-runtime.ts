import React from "./react-global"

type Props = Record<string, unknown> | null | undefined

export const Fragment = React.Fragment

function createElement(
  type: unknown,
  props: Props,
  key?: string
) {
  const normalizedProps =
    key === undefined ? props : { ...(props || {}), key }

  return React.createElement(type as never, normalizedProps)
}

export const jsx = createElement
export const jsxs = createElement
export const jsxDEV = createElement
