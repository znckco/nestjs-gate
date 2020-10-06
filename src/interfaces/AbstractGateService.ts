import type { Type } from "@nestjs/common";

export interface AbstractGateService {
  denies(permission: string, resource?: object | Type<object>): Promise<boolean>
  allows(permission: string, resource?: object | Type<object>): Promise<boolean>
}
