import { getCurrentInstance } from "./component"

export function provide(key, value) {
  const instance = getCurrentInstance()

  if (instance) {
    const { provides } = instance
    provides[key] = value
  }
}

export function inject(key) {
  const instance = getCurrentInstance()

  if (instance) {
    let value = null
    while (value === null) {
      const { parent } = instance
      if (parent) {
        if (parent.provides[key]) {
          return parent.provides[key]
        }
      }
    }
  }
}
