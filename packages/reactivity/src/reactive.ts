import { isObject } from "../../shared"
import {
  mutableHandlers,
  readonlyHandlers,
  shallowMutableHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers"

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function reactive(raw: object) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw: object) {
  return createActiveObject(raw, readonlyHandlers)
}

export function shallowReactive(raw) {
  return createActiveObject(raw, shallowMutableHandlers)
}
export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers)
}

function createActiveObject(raw: object, baseHandlers: object) {
  if (!isObject(raw)) {
    console.log(`target ${raw} 必须是一个对象`)
    return raw
  }
  return new Proxy(raw, baseHandlers)
}

export function isReadonly(value: any): boolean {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isReactive(value: any): boolean {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isProxy(value: any): boolean {
  return isReactive(value) || isReadonly(value)
}
