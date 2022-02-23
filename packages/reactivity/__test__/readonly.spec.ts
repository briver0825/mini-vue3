import { readonly, isReadonly, shallowReadonly, isProxy } from "../src"
describe("reactivity/readonly", () => {
  it("should when get", () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped: any = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
  })
  it("should not set when set", () => {
    console.warn = jest.fn()

    const user: any = readonly({
      age: 10,
    })

    user.age = 11

    expect(console.warn).toBeCalled()
  })

  it("should make nested values readonly", () => {
    const obj = {
      foo: {
        bar: 1,
      },
    }
    const wrapped: any = readonly(obj)
    expect(isReadonly(obj)).toBe(false)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(obj.foo)).toBe(false)
    expect(isReadonly(wrapped.foo)).toBe(true)
    expect(isProxy(obj)).toBe(false)
    expect(isProxy(obj.foo)).toBe(false)
    expect(isProxy(wrapped)).toBe(true)
    expect(isProxy(wrapped.foo)).toBe(true)
  })

  it("should make shallow values readonly", () => {
    const obj = {
      foo: {
        bar: 1,
      },
    }
    const wrapped: any = shallowReadonly(obj)
    expect(isReadonly(wrapped.foo)).toBe(false)
  })
})
