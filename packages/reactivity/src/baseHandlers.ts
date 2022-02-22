import { track, trigger } from "./effect"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

export function createGetter(isReadonly = false) {
  return function (target: object, key: string) {
    const value = Reflect.get(target, key)
    if (!isReadonly) {
      track(target, key)
    }
    return value
  }
}

export function createSetter() {
  return function set(target: object, key: string, value: any) {
    const result = Reflect.set(target, key, value)
    trigger(target, key)
    return result
  }
}

export const mutableHandlers = {
  get,
  set,
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key: ${key} set 失败 因为 target 是 readonly`, key)
    return true
  },
}
