import { track, trigger } from "./effect"
import { ReactiveFlags, readonly, reactive } from "./reactive"
import { isObject, extend, hasChanged } from "../../shared"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReactiveGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)

export function createGetter(isReadonly = false, isShallow = false) {
  return function (target: object, key: string) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const value = Reflect.get(target, key)

    if (isObject(value) && !isShallow) {
      return isReadonly ? readonly(value) : reactive(value)
    }

    if (!isReadonly) {
      track(target, key)
    }
    return value
  }
}

export function createSetter() {
  return function set(target: object, key: string, value: any) {
    const oldValue = Reflect.get(target, key)
    if (hasChanged(oldValue, value)) {
      const result = Reflect.set(target, key, value)
      trigger(target, key)
      return result
    }
    return oldValue
  }
}

export const mutableHandlers = {
  get,
  set,
}

export const shallowMutableHandlers = extend({}, shallowReactiveGet, {
  get: shallowReadonlyGet,
})

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key: ${key} set 失败 因为 target 是 readonly`, key)
    return true
  },
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
})
