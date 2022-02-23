import { trackEffects, triggerEffects, activeEffect } from "./effect"
import { hasChanged, isObject } from "../../shared"
import { reactive } from "./reactive"

class refImpl {
  private _value: any
  public _rawValue: any
  public __v_ref: boolean = true
  public dep
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
    this.dep = new Set()
  }

  get value() {
    if (activeEffect) {
      trackEffects(this.dep)
    }
    return this._value
  }

  set value(value) {
    if (hasChanged(value, this._rawValue)) {
      this._rawValue = value
      this._value = convert(value)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

export function ref(value) {
  return new refImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_ref
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectwithRefs) {
  return new Proxy(objectwithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    },
  })
}
