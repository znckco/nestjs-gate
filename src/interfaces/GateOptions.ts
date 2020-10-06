import type { ExecutionContext, Type } from "@nestjs/common"
import type { AbstractPolicy } from "./AbstractPolicy"

export interface GateOptions<User> {
  User?: Type<User>
  UserPolicy?: Type<AbstractPolicy<User, never>>
  getUser(context: ExecutionContext): Promise<User | null> | User | null
}
