import type { Type } from "@nestjs/common"
import { Inject, Injectable } from "@nestjs/common"
import { ModuleRef, Reflector } from "@nestjs/core"
import type { Namespace } from "cls-hooked"
import {
  GATE_NAMESPACE_PROVIDER,
  GATE_OPTIONS_PROVIDER,
  GATE_USER_KEY,
  POLICY_KEY,
} from "../constants"
import { MissingPolicyException } from "../exceptions/MissingPolicyException"
import { UnknownPermissionException } from "../exceptions/UnknownPermissionException"
import { UnsupportedCheckException } from "../exceptions/UnsupportedCheckException"
import { Gate } from "../facades/Gate"
import { AbstractGateService } from "../interfaces/AbstractGateService"
import { AbstractPolicy } from "../interfaces/AbstractPolicy"
import { GateOptions } from "../interfaces/GateOptions"

@Injectable()
export class GateService implements AbstractGateService {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
    @Inject(GATE_NAMESPACE_PROVIDER)
    private readonly namespace: Namespace,
    @Inject(GATE_OPTIONS_PROVIDER)
    private readonly options?: GateOptions,
  ) {
    Gate._useService(this)
  }

  async denies(
    permission: string,
    resource?: object | Type<object>,
  ): Promise<boolean> {
    const result = await this.allows(permission, resource)

    return !result
  }

  async allows(
    permission: string,
    resource?: object | Type<object>,
  ): Promise<boolean> {
    const check = await this.getPolicyChecker(permission, resource)

    switch (check.length) {
      case 2: {
        const user = await this.getUser()
        const result = await check(user, resource)
        return result
      }
      case 1: {
        const result = await check(await this.getUser())
        return result
      }
      case 0: {
        const result = await check()
        return result
      }

      default:
        throw new UnsupportedCheckException()
    }
  }

  private async getUser(): Promise<any> {
    const fn = this.namespace.get(GATE_USER_KEY)

    return typeof fn === "function" ? (await fn()) ?? null : null
  }

  private async getPolicyChecker(
    permission: string,
    resource?: object | Type<object>,
  ): Promise<(...args: any[]) => Promise<boolean>> {
    const policy = await this.getPolicy(resource)
    const method = this.getMethodName(permission) as keyof typeof policy
    const fn = policy[method]

    if (typeof fn === "function") {
      return fn.bind(policy) as any
    }

    throw new UnknownPermissionException()
  }

  // TODO: Memoize this function.
  private getMethodName(permission: string): string {
    if (permission.includes(":")) {
      return permission.replace(/:([a-z])/gi, (_, char: string) =>
        char.toUpperCase(),
      )
    } else {
      return permission
    }
  }

  private async getPolicy(
    resource?: object | Type<object>,
  ): Promise<AbstractPolicy<unknown, unknown>> {
    if (resource == null) {
      if (this.options?.UserPolicy != null) {
        const policy = await this.moduleRef.get(this.options.UserPolicy, {
          strict: false,
        })
        // istanbul ignore else
        if (policy != null) return policy
      } else if (this.options?.User != null) {
        resource = this.options.User
      }
    }

    if (resource != null) {
      const Policy = this.reflector.get(
        POLICY_KEY,
        typeof resource === "function"
          ? resource
          : Reflect.getPrototypeOf(resource).constructor,
      )

      const policy = await this.moduleRef.get(Policy, { strict: false })

      if (policy != null) return policy
    }

    throw new MissingPolicyException()
  }
}
