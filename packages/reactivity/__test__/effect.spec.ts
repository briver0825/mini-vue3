import { reactive } from "../src/reactive"
import { effect, stop } from "../src/effect"

describe("reactivity/effect", () => {
  it("should observe basic properties", () => {
    const counter: any = reactive({ num: 1 })
    let dummy

    effect(function () {
      dummy = counter.num
    })

    expect(dummy).toBe(1)

    // update
    counter.num++
    expect(dummy).toBe(2)
  })

  it("should return runner when call effect", () => {
    let foo = 10
    const runner = effect(() => {
      foo++
      return "foo"
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe("foo")
  })

  it("scheduler", () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj: any = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })

  it("stop", () => {
    let dummy
    let a
    const obj: any = reactive({ prop: 1, a: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop++
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })

  it("events: onStop", () => {
    const onStop = jest.fn()
    const runner = effect(() => {}, {
      onStop,
    })

    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })
})
