import { publicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  }
  return component
}

export function setupComponent(instance) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type

  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

  const { setup } = Component
  if (setup) {
    const setupResult = setup()
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
