import { createApp } from "../../runtime-dom"
import { isObject } from "../../shared/index"
import { ShapeFlags } from "../../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRender(options) {
  const { createTextNode, insert, createElement, patchProps } = options
  function render(vnode, rootContainer) {
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

          insert(createTextNode(vnode), container)
        }
    }
  }

  function processText(vnode, container) {
    const { children } = vnode
    const textNode = (vnode.el = createTextNode(children))
    insert(textNode, container)
  }

  function processFragment(vnode, container) {
    mountChildren(vnode.children, container, null)
  }

  function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent)
  }

  function mountElement(vnode, container, parentComponent) {
    const { type, children, props, shapeFlag } = vnode
    const el = (vnode.el = createElement(type))

    //children
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      insert(createTextNode(children), el)
    }

    // props
    patchProps(props, el)
    insert(el, container)
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

  return {
    createApp: createAppApi(render),
  }
}
