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
function patchProps(props, el) {
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
}

const renderer = createRender({
  createTextNode,
  insert,
  createElement,
  patchProps,
})

export function createApp(rootComponent) {
  return renderer.createApp(rootComponent)
}

export * from "../runtime-core/src"
