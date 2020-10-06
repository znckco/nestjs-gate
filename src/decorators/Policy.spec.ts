import { Reflector } from "@nestjs/core"
import { POLICY_KEY } from "../constants"
import { createPolicyDecorator, Policy } from "./Policy"

describe("@Policy(...)", () => {
  class EntityPolicy {}

  @Policy(EntityPolicy)
  class A {}

  const reflector = new Reflector()
  it("should set Policy as class metadata", () => {
    const value = reflector.get(POLICY_KEY, A)

    expect(value).toBe(EntityPolicy)
  })
})

describe("createPolicyDecorator()", () => {
  class EntityPolicy {}

  const Policy = createPolicyDecorator<any>()

  @Policy(EntityPolicy)
  class A {}

  const reflector = new Reflector()
  it("should set Policy as class metadata", () => {
    const value = reflector.get(POLICY_KEY, A)

    expect(value).toBe(EntityPolicy)
  })
})
