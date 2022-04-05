import { h, provide, inject } from "../../lib/guide-mini-vue3.esm.js"

const Child = {
  name: "Child",
  setup() {
    const foo = inject("foo")
    return { foo }
  },
  render() {
    return h("div", {}, "value =>" + this.foo)
  },
}

const App = {
  name: "App",
  render() {
    return h("div", { id: "aaaaa" }, [h(Child)])
  },
  setup() {
    provide("foo", "foo-value")

    return {
      msg: "hello mini-vue3!!!",
    }
  },
}

export default App
