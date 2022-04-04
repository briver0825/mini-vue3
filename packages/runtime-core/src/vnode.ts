import { ShapeFlags } from "../../shared/shapeFlags"

export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type, children),
    el: null,
  }
  return vnode
}

export function createTextVnode(text) {
  return createVNode(Text, {}, text)
}

function getShapeFlag(type, children) {
  let flag = 0
  // 处理 element 和 component 的flag
  if (typeof type === "string") {
    flag |= ShapeFlags.ELEMENT
  } else {
    flag |= ShapeFlags.STATEFUL_COMPONENT
  }

  // 处理 children 的flag
  if (Array.isArray(children)) {
    flag |= ShapeFlags.ARRAY_CHILDREN
  } else {
    flag |= ShapeFlags.TEXT_CHILDREN
  }

  return flag
}
