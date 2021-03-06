import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from "@nestjs/common"
import type { Namespace } from "cls-hooked"
import type { Observable } from "rxjs"

import { tap } from "rxjs/operators"
import { Inject, Injectable } from "@nestjs/common"
import { GateOptions } from "../interfaces/GateOptions"
import {
  GATE_NAMESPACE_PROVIDER,
  GATE_OPTIONS_PROVIDER,
  GATE_USER_KEY,
} from "../constants"

@Injectable()
export class GateInterceptor implements NestInterceptor {
  constructor(
    @Inject(GATE_NAMESPACE_PROVIDER)
    private readonly namespace: Namespace,
    @Inject(GATE_OPTIONS_PROVIDER)
    private readonly options?: GateOptions,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const scope = this.namespace.createContext()

    this.namespace.enter(scope)
    if (this.options != null) {
      const options = this.options
      this.namespace.set(GATE_USER_KEY, () => options.getUser(context))
    } else {
      const request = context.switchToHttp().getRequest<any | null>()
      this.namespace.set(GATE_USER_KEY, () => request?.user)
    }

    return next
      .handle()
      .pipe(tap({ complete: () => this.namespace.exit(scope) }))
  }
}
