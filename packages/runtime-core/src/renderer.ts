import { isObject } from "../../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, rootContainer) {
  patch(vnode, rootContainer)
}

function patch(vnode, container) {
  if (isObject(vnode.type)) {
    // component
    processComponent(vnode, container)
  } else if (typeof vnode.type === "string") {
    // element
    processElement(vnode, container)
  } else if (typeof vnode === "string") {
    container.textContent = vnode
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const { type, children, props } = vnode
  const el = (vnode.el = document.createElement(type))
  //children
  if (Array.isArray(children)) {
    mountChildren(children, el)
  } else if (typeof children === "string") {
    el.textContent = children
  }
  // props
  for (const key in props) {
    const value = props[key]
    el.setAttribute(key, value)
  }
  container.append(el)
}

function mountChildren(children, container) {
  children.forEach((child) => {
    patch(child, container)
  })
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(initinalVNode, container) {
  const instance = createComponentInstance(initinalVNode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  instance.vnode.el = subTree.el
}
