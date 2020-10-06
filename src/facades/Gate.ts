import type { Type } from "@nestjs/common"
import type { AbstractGateService } from "../interfaces/AbstractGateService"

export class Gate {
  private static service: AbstractGateService

  /**
   * @internal
   */
  static async _useService(service: AbstractGateService) {
    this.service = service
  }

  static async allows(
    permission: string,
    resource: object | Type<object>,
  ): Promise<boolean> {
    return this.service.allows(permission, resource)
  }

  static async denies(
    permission: string,
    resource: object | Type<object>,
  ): Promise<boolean> {
    return this.service.denies(permission, resource)
  }
}
