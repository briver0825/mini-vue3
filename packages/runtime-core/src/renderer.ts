import { isObject } from "../../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, rootContainer) {
  patch(vnode, rootContainer)
}

function patch(vnode, container) {
  if (isObject(vnode.type)) {
    // vnode 是一个component
    // h(App,{},[])
    processComponent(vnode, container)
  } else if (typeof vnode.type === "string") {
    // vnode 是一个element
    // h('div',{class:'red'},null)
    processElement(vnode, container)
  } else if (vnode) {
    // vnode 不是component 和 element 那就可能是一个文本节点
    // h('div',{},[h('p',{},null),'222',this.msg])
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