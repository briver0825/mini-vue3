import { h, renderSlots } from "../../lib/guide-mini-vue3.esm.js"

const Foo = {
  setup(props) {},
  render() {
    const foo = h("p", {}, "foo")
    return h("div", {}, [
      renderSlots(this.$slots, "header", { a: 1 }),
      foo,
      renderSlots(this.$slots, "footer"),
    ])
  },
}

const foo = h(
  Foo,
  {},
  {
    header: ({ a }) => h("p", {}, "header slot" + a),
    footer: () => h("p", {}, "footer slot"),
  }
)

const app = h("div", { id: "app" }, ["App", foo])

const App = {
  render() {
    return app
  },
  setup() {
    return {}
  },
}

export default App
