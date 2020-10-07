import type { Type } from "@nestjs/common"
import { SetMetadata } from "@nestjs/common"
import { AbstractPolicy } from "../interfaces/AbstractPolicy"
import { POLICY_KEY } from "../constants"

export function createPolicyDecorator<User>(): <
  Entity,
  Policy extends AbstractPolicy<User, Entity>
>(
  policy: Type<Policy>,
) => ClassDecorator {
  return (policy) => SetMetadata(POLICY_KEY, policy)
}

export const Policy = createPolicyDecorator<any>()
