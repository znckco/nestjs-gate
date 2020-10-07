import { Namespace } from "cls-hooked"
import { from } from "rxjs"
import { GATE_USER_KEY } from "../constants"
import { GateInterceptor } from "./GateInterceptor"

describe("GateInterceptor", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should use user provided getUser", async () => {
    let value: any
    const namespace: Namespace = {
      enter: jest.fn(),
      exit: jest.fn(),
      get: jest.fn(() => value),
      set: jest.fn((_, v) => (value = v)),
      createContext: jest.fn(),
    } as any
    const user = { id: 1 }
    const context = { user } as any
    const options = { getUser: jest.fn((context: any) => context.user) }
    const interceptor = new GateInterceptor(namespace, options)

    const observable = await interceptor.intercept(context, {
      handle: () => from([null]),
    })
    expect(namespace.enter).toHaveBeenCalledTimes(1)
    expect(namespace.exit).toHaveBeenCalledTimes(0)

    await observable.toPromise()
    expect(namespace.enter).toHaveBeenCalledTimes(1)
    expect(namespace.exit).toHaveBeenCalledTimes(1)

    namespace.get(GATE_USER_KEY)()

    expect(namespace.createContext).toHaveBeenCalledTimes(1)
    expect(options.getUser).toHaveBeenCalledTimes(1)
    expect(options.getUser).toHaveBeenCalledWith(context)
    expect(namespace.set).toHaveBeenCalledTimes(1)
  })

  it("should get user from request", async () => {
    const namespace: Namespace = {
      enter: jest.fn(),
      exit: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      createContext: jest.fn(),
    } as any
    const user = { id: 1 }
    const request = { user }
    const http = { getRequest: jest.fn(() => request) }
    const context = { switchToHttp: jest.fn(() => http) } as any
    const interceptor = new GateInterceptor(namespace)

    const observable = await interceptor.intercept(context, {
      handle: () => from([null]),
    })
    expect(namespace.enter).toHaveBeenCalledTimes(1)
    expect(namespace.exit).toHaveBeenCalledTimes(0)

    await observable.toPromise()
    expect(namespace.enter).toHaveBeenCalledTimes(1)
    expect(namespace.exit).toHaveBeenCalledTimes(1)

    expect(namespace.createContext).toHaveBeenCalledTimes(1)
    expect(namespace.set).toHaveBeenCalledTimes(1)
  })

  it("should work in non-http environment", async () => {
    const namespace: Namespace = {
      enter: jest.fn(),
      exit: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      createContext: jest.fn(),
    } as any
    const context = { switchToHttp: () => ({ getRequest: () => null }) } as any
    const interceptor = new GateInterceptor(namespace)

    const observable = await interceptor.intercept(context, {
      handle: () => from([null]),
    })
    expect(namespace.enter).toHaveBeenCalledTimes(1)
    expect(namespace.exit).toHaveBeenCalledTimes(0)

    await observable.toPromise()
    expect(namespace.enter).toHaveBeenCalledTimes(1)
    expect(namespace.exit).toHaveBeenCalledTimes(1)

    expect(namespace.createContext).toHaveBeenCalledTimes(1)
    expect(namespace.set).toHaveBeenCalledTimes(1)
  })
})
