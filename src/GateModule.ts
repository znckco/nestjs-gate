/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { DynamicModule } from "@nestjs/common"
import { Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { createNamespace } from "cls-hooked"
import { GATE_NAMESPACE_PROVIDER, GATE_OPTIONS_PROVIDER } from "./constants"
import { GateInterceptor } from "./interceptors/GateInterceptor"
import { GateOptions } from "./interfaces/GateOptions"
import { GateService } from "./services/GateService"

@Module({})
class DynamicGateModule {}

@Module({
  providers: [
    { provide: GATE_NAMESPACE_PROVIDER, useValue: createNamespace("Gate") },
    { provide: GATE_OPTIONS_PROVIDER, useValue: null },
    { provide: APP_INTERCEPTOR, useClass: GateInterceptor },
    GateService,
  ],
  exports: [GateService],
})
export class GateModule {
  static forRoot<User, UserPolicy>(
    options: GateOptions<User, UserPolicy>,
  ): DynamicModule {
    return {
      module: DynamicGateModule,
      providers: [
        { provide: GATE_NAMESPACE_PROVIDER, useValue: createNamespace("Gate") },
        { provide: GATE_OPTIONS_PROVIDER, useValue: options },
        { provide: APP_INTERCEPTOR, useClass: GateInterceptor },
        GateService,
      ],
      exports: [GateService],
      global: true,
    }
  }
}
