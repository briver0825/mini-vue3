import { h } from "../../lib/guide-mini-vue3.esm.js"

window.self = null
const App = {
  render() {
    window.self = this
    return h("div", { id: "aaaaa" }, this.msg)
  },
  setup() {
    return {
      msg: "hello mini-vue3!!!",
    }
  },
}

export default App
