import { createAppApi } from "../runtime-core/src/createApp"
import { createRender } from "../runtime-core/src/renderer"

function createTextNode(text) {
  return document.createTextNode(text)
}
function insert(child, container) {
  container.appendChild(child)
}
function createElement(type) {
  return document.createElement(type)
}
function patchProps(el, key, prevVal, nextVal) {
  const isOn = (key: string) => /^on[A-Z]*/.test(key)
  // event
  if (isOn(key)) {
    const event = key.slice(2).toLocaleLowerCase()
    el.addEventListener(event, nextVal)
  } else {
    // attribute
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextVal)
    }
  }
}

function setElementInnerContext(el, context) {
  el.textContent = context
}

const renderer = createRender({
  createTextNode,
  insert,
  createElement,
  hostPatchProps: patchProps,
  setElementInnerContext,
})

export function createApp(rootComponent) {
  return renderer.createApp(rootComponent)
}

export * from "../runtime-core/src"
