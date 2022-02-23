import { ref, effect, isRef, unRef, proxyRefs } from "../src"
describe("ractivity/ref", () => {
  it("should hold a value", () => {
    const a = ref(1)
    expect(a.value).toBe(1)
    a.value = 2
    expect(a.value).toBe(2)
  })

  it("should be reactive", () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // same value should not trigger
    a.value = 2
    expect(calls).toBe(2)
  })

  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1,
    })
    let dummy
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
    a.value = {
      count: 10,
    }
    expect(dummy).toBe(10)
  })

  it("isRef", () => {
    const a = ref(0)
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
  })

  it("unRef", () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })

  it("proxyRefs", () => {
    const user = {
      age: ref(18),
      name: "lisi",
    }
    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(18)
    expect(proxyUser.age).toBe(18)
    expect(proxyUser.name).toBe("lisi")
    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)
    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
  })
})
