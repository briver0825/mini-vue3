import { createTextVnode, h, ref } from "../../lib/guide-mini-vue3.esm.js"

const App = {
  render() {
    return h("div", { ...this.props }, [
      h("h1", {}, createTextVnode(this.count)),
      h("button", { onClick: this.changePropsDemo }, "add Count"),
      h("button", { onClick: this.changePropsDemo1 }, "修改props"),
      h(
        "button",
        { onClick: this.changePropsDemo2 },
        "修改props为undefind，删除prop"
      ),
      h(
        "button",
        { onClick: this.changePropsDemo3 },
        "新的props中不存在某个属性，则删除该属性"
      ),
    ])
  },
  setup() {
    const props = ref({
      foo: "foo",
      bar: "bar",
    })

    const count = ref(0)

    const changePropsDemo = () => {
      count.value++
    }

    // 修改props
    const changePropsDemo1 = () => {
      props.value.foo = "new-foo"
    }

    // 设置 props 为undefined 删除prop
    const changePropsDemo2 = () => {
      props.value.foo = undefined
    }

    // 新的props中不存在某个属性，则删除该属性
    const changePropsDemo3 = () => {
      props.value = {
        foo: "foo",
      }
    }

    return {
      count,
      props,
      changePropsDemo,
      changePropsDemo1,
      changePropsDemo2,
      changePropsDemo3,
    }
  },
}

export default App
