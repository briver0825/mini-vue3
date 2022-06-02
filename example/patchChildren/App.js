import { createTextVnode, h, ref } from "../../lib/guide-mini-vue3.esm.js"

const App = {
  render() {
    const textToArray = h(
      "div",
      {},
      !this.isChange ? "text children" : [h("div", {}, "A"), h("div", {}, "B")]
    )

    const textToText = h(
      "div",
      {},
      !this.isChange ? "text children" : "new text children"
    )

    const ArrayToText = h(
      "div",
      {},
      !this.isChange ? [h("div", {}, "A"), h("div", {}, "B")] : "text children"
    )
    return ArrayToText
  },
  setup() {
    const isChange = ref(false)

    window.isChange = isChange
    return {
      isChange,
    }
  },
}

export default App
