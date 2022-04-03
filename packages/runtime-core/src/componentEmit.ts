import { camelize, toHandlerKey } from "../../shared"

export function emit(instance, event) {
  const { props } = instance

  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler && handler()
}
