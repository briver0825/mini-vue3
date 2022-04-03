import { shallowReadonly } from "../../reactivity/src/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    emit: (instance, event) => {},
  }

  component.emit = emit.bind(null, component)

  return component
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type

  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

  const { setup } = Component
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === "object") {
    // 如果是object那么返回的就是context
    instance.setupState = setupResult
  } else if (typeof setupResult === "function") {
    // 如果是function那么返回的是render函数
  }
  finishCompoentSetup(instance)
}

function finishCompoentSetup(instance) {
  const Component = instance.type
  instance.render = Component.render
}
