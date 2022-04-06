import { h, ref } from "../../lib/guide-mini-vue3.esm.js"

const App = {
  render() {
    return h("div", {}, [h("h1", {}, this.count), h("button", {}, "点我")])
  },
  setup() {
    const count = ref(0)
    return {
      count,
    }
  },
}

export default App
