import { h } from "../../lib/guide-mini-vue3.esm.js"

const Title = {
  setup(props) {
    props.count++
  },
  render() {
    return h("div", {}, this.count)
  },
}

const App = {
  render() {
    return h("div", { id: "aaaaa" }, [
      h(
        "h1",
        {
          id: "red",
          onClick() {
            console.log("click")
          },
          onMouseDown() {
            console.log("mousedown")
          },
        },
        "Hello Vue3!!!"
      ),
      h("h2", {}, this.msg),
      h(Title, { count: 1 }),
    ])
  },
  setup() {
    return {
      msg: "hello mini-vue3!!!",
    }
  },
}

export default App
