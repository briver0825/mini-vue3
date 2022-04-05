import { isObject } from "../../shared/index"
import { ShapeFlags } from "../../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, rootContainer) {
  patch(vnode, rootContainer, null)
}

function patch(vnode, container, parentComponent) {
  const { type, shapeFlag } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break

    default:
      if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // vnode 是一个component
        // h(App,{},[])
        processComponent(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.ELEMENT) {
        // vnode 是一个element
        // h('div',{class:'red'},null)
        processElement(vnode, container, parentComponent)
      } else if (vnode) {
        // vnode 不是component 和 element 那就可能是一个文本节点
        // h('div',{},[h('p',{},null),'222',this.msg])
        const TextNode = document.createTextNode(vnode)
        container.appendChild(TextNode)
      }
  }
}

function processText(vnode, container) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.appendChild(textNode)
}

function processFragment(vnode, container) {
  mountChildren(vnode.children, container, null)
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

function mountElement(vnode, container, parentComponent) {
  const { type, children, props, shapeFlag } = vnode
  const el = (vnode.el = document.createElement(type))

  //children
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el, parentComponent)
  } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  }

  // props
  for (const key in props) {
    const value = props[key]

    const isOn = (key: string) => /^on[A-Z]*/.test(key)
    // event
    if (isOn(key)) {
      const event = key.slice(2).toLocaleLowerCase()
      el.addEventListener(event, value)
    } else {
      // attribute
      el.setAttribute(key, value)
    }
  }
  container.append(el)
}

function mountChildren(children, container, parentComponent) {
  children.forEach((child) => {
    patch(child, container, parentComponent)
  })
}

function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(initinalVNode, container, parentComponent) {
  const instance = createComponentInstance(initinalVNode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container, instance)
  instance.vnode.el = subTree.el
}
