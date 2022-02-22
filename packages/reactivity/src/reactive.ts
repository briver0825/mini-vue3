import { mutableHandlers, readonlyHandlers } from "./baseHandlers"

export function reactive(raw: object) {
  return createActiveObject(raw, mutableHandlers)
}

function createActiveObject(raw: object, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}

export function readonly(raw: object) {
  return createActiveObject(raw, readonlyHandlers)
}
