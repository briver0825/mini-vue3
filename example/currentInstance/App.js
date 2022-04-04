import { h, getCurrentInstance } from "../../lib/guide-mini-vue3.esm.js"

const Foo = {
  name: "Foo",
  setup() {
    const instance = getCurrentInstance()
    console.log(instance)
  },
  render() {
    return h("p", {}, "foo")
  },
}

const App = {
  name: "App",
  render() {
    return h("div", {}, [h(Foo), "currentInstance Demo"])
  },
  setup() {
    const instance = getCurrentInstance()

    console.log(instance)
  },
}

export default App
