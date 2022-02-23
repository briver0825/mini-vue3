export const extend = Object.assign

export const isObject = (target) => typeof target === "object"

export const hasChanged = (value, newValue) => !Object.is(value, newValue)
