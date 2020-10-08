/* eslint-disable */
import { Type } from "@nestjs/common"
import { ModuleRef, Reflector } from "@nestjs/core"
import { Namespace } from "cls-hooked"
import { Policy } from "../decorators/Policy"
import { MissingPolicyException } from "../exceptions/MissingPolicyException"
import { UnknownPermissionException } from "../exceptions/UnknownPermissionException"
import { UnsupportedCheckException } from "../exceptions/UnsupportedCheckException"
import { GateService } from "./GateService"

describe("GateService", () => {
  class EntityPolicy {}

  @Policy(EntityPolicy)
  class EntityA {}

  class EntityB {}

  const reflector = new Reflector()

  let service: GateService
  let moduleRef: ModuleRef
  let namespace: Namespace

  beforeEach(() => {
    moduleRef = {
      get: (T: Type<any>) => (typeof T === "function" ? new T() : null),
    } as any
    namespace = { get: () => undefined } as any

    service = new GateService(reflector, moduleRef, namespace)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("should throw when policy is not registered", async () => {
    await expect(service.allows("search")).rejects.toThrow(
      MissingPolicyException,
    )
    await expect(service.allows("search", EntityB)).rejects.toThrow(
      MissingPolicyException,
    )
    await expect(service.allows("search", new EntityB())).rejects.toThrow(
      MissingPolicyException,
    )
  })
  it("should throw when policy does not have a check method", async () => {
    await expect(service.allows("search", EntityA)).rejects.toThrow(
      UnknownPermissionException,
    )
    await expect(service.allows("search", new EntityA())).rejects.toThrow(
      UnknownPermissionException,
    )
  })
  it("should throw if check method throws", async () => {
    const error = new Error("TestError")
    const policy = {
      search: jest.fn(() => {
        throw error
      }),
    }

    jest.spyOn(moduleRef, "get").mockImplementation(async () => policy)

    await expect(service.allows("search", EntityA)).rejects.toThrowError(error)
  })
  it("should call check method with correct params", async () => {
    const policy = {
      search: jest.fn(() => false),
      create: jest.fn((user) => false),
      view: jest.fn((user, entity) => false),
      custom: jest.fn((user, entity, other) => false),
    }
    jest.spyOn(moduleRef, "get").mockImplementation(async () => policy)
    const entity = new EntityA()

    await service.allows("search", entity)
    await service.allows("create", entity)
    await service.allows("view", entity)

    expect(policy.search).toHaveBeenCalledTimes(1)
    expect(policy.search).toHaveBeenCalledWith()

    expect(policy.create).toHaveBeenCalledTimes(1)
    expect(policy.create).toHaveBeenCalledWith(null)

    expect(policy.view).toHaveBeenCalledTimes(1)
    expect(policy.view).toHaveBeenCalledWith(null, entity)

    await expect(service.allows("custom", entity)).rejects.toThrow(
      UnsupportedCheckException,
    )
  })
  it("should consistently work with allows and denies", async () => {
    const policy = { search: jest.fn(() => true) }
    jest.spyOn(moduleRef, "get").mockImplementation(async () => policy)
    const resource = new EntityA()

    await expect(service.allows("search", resource)).resolves.toBe(true)
    await expect(service.denies("search", resource)).resolves.toBe(false)
  })
  it("should resolve promises in check", async () => {
    const policy = { search: jest.fn(() => Promise.resolve(false)) }
    jest.spyOn(moduleRef, "get").mockImplementation(async () => policy)
    const resource = new EntityA()

    await expect(service.allows("search", resource)).resolves.toBe(false)
  })
  it("should normalize check names", async () => {
    const policy = { searchUser: jest.fn(() => Promise.resolve(true)) }
    jest.spyOn(moduleRef, "get").mockImplementation(async () => policy)
    const resource = new EntityA()

    await expect(service.allows("search:user", resource)).resolves.toBe(true)
    await expect(service.allows("searchUser", resource)).resolves.toBe(true)

    expect(policy.searchUser).toHaveBeenCalledTimes(2)
  })

  it("should assume user resource when resource is null and User has policy", async () => {
    const user = { id: 1 }
    const spy = jest.fn()
    class UserPolicy {
      search(user: any) {
        spy(user)
        return true
      }
    }
    @Policy(UserPolicy)
    class User {}
    const options = {
      getUser: () => user,
      User,
    }
    namespace.get = () => options.getUser
    const service = new GateService(reflector, moduleRef, namespace, options)

    await expect(service.allows("search")).resolves.toBe(true)

    expect(spy).toHaveBeenCalledWith(user)
  })
  it("should assume user resource when resource is null", async () => {
    const user = { id: 1 }
    const spy = jest.fn()
    class UserPolicy {
      any(user: any) {
        spy(user)
        return true
      }
    }
    const options = {
      getUser: () => user,
      UserPolicy,
    }
    namespace.get = () => options.getUser
    const service = new GateService(reflector, moduleRef, namespace, options)

    await expect(service.allows("any")).resolves.toBe(true)

    expect(spy).toHaveBeenCalledWith(user)
  })
})
