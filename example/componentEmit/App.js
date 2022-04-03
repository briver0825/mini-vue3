import { h, renderSlots } from "../../lib/guide-mini-vue3.esm.js"

const Foo = {
  setup(props, { emit }) {
    return {
      emitAdd() {
        emit("add")
      },
    }
  },
  render() {
    const btn = h("button", { onClick: this.emitAdd }, "emitAdd")
    const foo = h("div", {}, "foo")
    return h("div", {}, [foo, btn])
  },
}

const app = h("div", {}, [
  h(Foo, {
    onAdd() {
      console.log("onAdd")
    },
  }),
])

const App = {
  render() {
    return app
  },
  setup() {
    return {}
  },
}

export default App
