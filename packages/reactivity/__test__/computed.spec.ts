import { computed } from "../src/computed"
import { reactive } from "../src/reactive"
describe("reactivity/computed", () => {
  it("should when get", () => {
    const state: any = reactive({ count: 1 })
    const double = computed(() => state.count * 2)
    expect(double.value).toBe(2)
  })

  it("should compute lazily", () => {
    const value: any = reactive({
      foo: 1,
    })
    const getter = jest.fn(() => value.foo)
    const cValue = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    // // should not compute until needed
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    // now it should compute
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
