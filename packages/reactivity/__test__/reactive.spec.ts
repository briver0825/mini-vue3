import { reactive } from "../src"

describe("reactivity/reactive", () => {
  test("Object", () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)

    // get
    expect(observed.foo).toBe(1)

    // set
    observed.foo = 2
    expect(original.foo).toBe(2)
  })
})
