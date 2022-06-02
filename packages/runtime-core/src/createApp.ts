import { createVNode } from "./vnode"

export function createAppApi(render) {
  return function createApp(rootComponent: any) {
    return {
      mount(rootContainer) {
        const vnode = createVNode(rootComponent)

        render(vnode, rootContainer)
      },
    }
  }
}
