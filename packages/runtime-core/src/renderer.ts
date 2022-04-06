import { effect } from "../../reactivity/src"
import { createApp } from "../../runtime-dom"
import { isObject } from "../../shared/index"
import { ShapeFlags } from "../../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRender(options) {
  const { createTextNode, insert, createElement, patchProps } = options
  function render(vnode, rootContainer) {
    patch(null, vnode, rootContainer, null)
  }

  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container)
        break
      case Text:
        processText(n1, n2, container)
        break

      default:
        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // vnode 是一个component
          // h(App,{},[])
          processComponent(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.ELEMENT) {
          // vnode 是一个element
          // h('div',{class:'red'},null)
          processElement(n1, n2, container, parentComponent)
        } else {
          // vnode 不是component 和 element 那就可能是一个文本节点
          // h('div',{},[h('p',{},null),'222',this.msg])
          insert(createTextNode(n2), container)
        }
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = (n2.el = createTextNode(children))
    insert(textNode, container)
  }

  function processFragment(n1, n2, container) {
    mountChildren(n2.children, container, null)
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log(n1, n2)
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
      patch(null, child, container, parentComponent)
    })
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initinalVNode, container, parentComponent) {
    const instance = createComponentInstance(initinalVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, container)
  }

  function setupRenderEffect(instance, container) {
    effect(() => {
      const { proxy } = instance
      if (!instance.isMounted) {
        console.log("init")
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance)
        instance.vnode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log("update")
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.subTree
        patch(preSubTree, subTree, container, instance)
        instance.vnode.el = subTree.el
      }
    })
  }

  return {
    createApp: createAppApi(render),
  }
}
