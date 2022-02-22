import { readonly } from "../src"
describe("reactivity/readonly", () => {
  it("should when get", () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
  })
  it("should when set", () => {
    console.warn = jest.fn()

    const user = readonly({
      age: 10,
    })

    user.age = 11

    expect(console.warn).toBeCalled()
  })
})
