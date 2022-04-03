export const extend = Object.assign

export const isObject = (target) => typeof target === "object"

export const hasChanged = (value, newValue) => !Object.is(value, newValue)

export const hasOwn = (value, key) =>
  Object.prototype.hasOwnProperty.call(value, key)

export const camelize = (str) =>
  str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""))

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

export const toHandlerKey = (str) => (str ? "on" + capitalize(str) : "")
