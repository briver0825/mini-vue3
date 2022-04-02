import { isReactive, shallowReactive, isProxy, reactive } from "../src"

describe("reactivity/reactive", () => {
  test("Object", () => {
    const original = { foo: 1 }
    const observed: any = reactive(original)
    expect(observed).not.toBe(original)

    // get
    expect(observed.foo).toBe(1)

    // set
    observed.foo = 2
    expect(original.foo).toBe(2)
  })

  it("should make nested values reactive", () => {
    const obj = {
      foo: {
        bar: 1,
      },
    }
    const wrapped: any = reactive(obj)
    expect(isReactive(obj)).toBe(false)
    expect(isReactive(wrapped)).toBe(true)
    expect(isReactive(obj.foo)).toBe(false)
    expect(isReactive(wrapped.foo)).toBe(true)
    expect(isProxy(obj)).toBe(false)
    expect(isProxy(obj.foo)).toBe(false)
    expect(isProxy(wrapped)).toBe(true)
    expect(isProxy(wrapped.foo)).toBe(true)
  })

  it("should make shallow values reactive", () => {
    const obj = {
      foo: {
        bar: 1,
      },
    }
    const wrapped: any = shallowReactive(obj)
    expect(isReactive(wrapped.foo)).toBe(false)
  })
})
