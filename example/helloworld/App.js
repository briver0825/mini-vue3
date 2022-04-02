import { h } from "../../lib/guide-mini-vue3.esm.js"

const App = {
  render() {
    return h("div", { id: "aaaaa" }, [
      h("h1", { class: "red" }, "Hello Vue3!!!"),
      h("h2", {}, "h2"),
    ])
  },
  setup() {
    return {
      msg: "hello mini-vue3!!!",
    }
  },
}

export default App
