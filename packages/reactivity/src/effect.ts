import { extend } from "../../shared"
import { createGetter } from "./baseHandlers"

let activeEffect: ReactiveEffect | undefined | null
const targetMap = new WeakMap()

export function track(target: Object, key: string) {
  if (!activeEffect) {
    return
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  dep.add(activeEffect)
  activeEffect.deps.push(dep)
  activeEffect = null
}

export function trigger(target: Object, key: string) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  let dep = depsMap.get(key)
  if (!dep) {
    return
  }

  dep.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  })
}

export class ReactiveEffect {
  deps: any = []
  active = true
  onStop: (() => void) | undefined
  constructor(public _fn: Function, public scheduler?: () => any) {
    activeEffect = this
  }
  run() {
    return this._fn()
  }
  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

export function effect(fn: Function, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)

  extend(_effect, options)

  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
