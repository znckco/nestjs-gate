/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { Type } from "@nestjs/common"
import type { AbstractGateService } from "../interfaces/AbstractGateService"

export class Gate {
  private static service: AbstractGateService

  /**
   * @internal
   */
  static _useService(service: AbstractGateService): void {
    this.service = service
  }

  static async allows(
    permission: string,
    resource: object | Type<object>,
  ): Promise<boolean> {
    return await this.service.allows(permission, resource)
  }

  static async denies(
    permission: string,
    resource: object | Type<object>,
  ): Promise<boolean> {
    return await this.service.denies(permission, resource)
  }
}
