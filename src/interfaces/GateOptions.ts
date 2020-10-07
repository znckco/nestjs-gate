import type { ExecutionContext, Type } from "@nestjs/common"
import type { AbstractPolicy } from "./AbstractPolicy"

export interface GateOptions<
  User = any,
  UserPolicy extends AbstractPolicy<User, User> = any
> {
  User?: Type<User>
  UserPolicy?: Type<UserPolicy>
  getUser: (context: ExecutionContext) => Promise<User | null> | User | null
}
