import { effect } from "../../reactivity/src"
import { EMPTY_OBJ } from "../../shared"
import { ShapeFlags } from "../../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRender(options) {
  const {
    createTextNode,
    insert,
    createElement,
    hostPatchProps,
    setElementInnerContext,
    removeAllChildren,
  } = options
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
      updateElement(n1, n2, container)
    }
  }

  function updateElement(n1, n2, container) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)

    // 对比props
    patchProps(el, oldProps, newProps)

    // 对比children
    patchChildren(n1, n2, el)
  }

  function patchChildren(n1, n2, container) {
    // n1 children 是文本节点
    if (!!(n1.shapeFlag & ShapeFlags.TEXT_CHILDREN)) {
      if (!!(n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN)) {
        // text children  => array children
        removeAllChildren(container)
        mountChildren(n2.children, container, null)
      } else {
        // text children  => text children
        if (n1.children !== n2.children) {
          setElementInnerContext(container, n2.children)
        }
      }
    } else {
      // n1 children 是一个数组
      if (!!(n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN)) {
        // array children  => array children
      } else {
        // array children  => text children
        removeAllChildren(container)
        setElementInnerContext(container, n2.children)
      }
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]

        if (prevProp !== nextProp) {
          hostPatchProps(el, key, prevProp, nextProp)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProps(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  function mountElement(vnode, container, parentComponent) {
    const { type, children, props, shapeFlag } = vnode
    const el = (vnode.el = createElement(type))

    //children
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    } else if (!!(children.shapeFlag & ShapeFlags.TEXT_CHILDREN)) {
      const vlaue = children.children
      insert(createTextNode(vlaue), el)
    } else {
      setElementInnerContext(el, children)
    }

    // props
    for (const key in props) {
      const val = props[key]
      hostPatchProps(el, key, null, val)
    }

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
        instance.vnode.el = subTree.el
        patch(preSubTree, subTree, container, instance)
      }
    })
  }

  return {
    createApp: createAppApi(render),
  }
}
