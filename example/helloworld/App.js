import { h } from "../../lib/guide-mini-vue3.esm.js"
const Title = {
  render() {
    return h("p", {}, "title")
  },
}

const App = {
  render() {
    return h("div", { id: "aaaaa" }, [
      h("h1", { class: "red" }, "h1"),
      h("h2", {}, "h2"),
      Title,
    ])
  },
  setup() {
    return {
      msg: "hello mini-vue3!!!",
    }
  },
}

export default App
