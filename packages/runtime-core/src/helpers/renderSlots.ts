import { createVNode, Fragment } from "../vnode"

export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === "function") {
      return createVNode(Fragment, {}, handleSlotChilren(slot(props)))
    }
  }
}

function handleSlotChilren(slot) {
  return Array.isArray(slot) ? slot : [slot]
}
