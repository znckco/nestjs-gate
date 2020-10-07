/* eslint-disable */

import {
  CallHandler,
  Controller,
  ExecutionContext,
  ForbiddenException,
  Get,
  Module,
} from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { createPolicyDecorator, Gate, GateModule, Policy } from "./index"

const CustomPolicy = createPolicyDecorator()

class EntityPolicy {
  search() {
    return true
  }

  create(user: any) {
    return user != null
  }
}

@Policy(EntityPolicy)
class Entity {}

@CustomPolicy(EntityPolicy)
class EntityB {}

@Controller()
class TestController {
  @Get("/search")
  async search() {
    if (await Gate.allows("search", Entity)) {
      return [{ test: true }]
    }

    throw new ForbiddenException()
  }

  @Get("/create")
  async create() {
    if (await Gate.allows("create", new Entity())) {
      return { test: true }
    }

    throw new ForbiddenException()
  }

  @Get("/update")
  async update() {
    if (await Gate.allows("update", new Entity())) {
      return { test: true }
    }

    throw new ForbiddenException()
  }
}

@Module({ imports: [GateModule] })
class TestApp {}

@Module({
  imports: [
    GateModule.forRoot({
      getUser: (context) => context.switchToHttp().getRequest()?.user,
    }),
  ],
})
class TestApp2 {}

class AuthProvider {
  constructor(private user?: any) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp()

    http.getRequest().user = this.user

    return next.handle()
  }
}

describe("GateModule", () => {
  async function createApp(user?: any) {
    const moduleRef = await Test.createTestingModule({
      imports: [TestApp],
      providers: [
        EntityPolicy,
        { provide: APP_INTERCEPTOR, useValue: new AuthProvider(user) },
      ],
      controllers: [TestController],
    }).compile()
    const app = moduleRef.createNestApplication()

    await app.init()

    return app
  }

  it("should just work", async () => {
    const app = await createApp()

    return request(app.getHttpServer())
      .get("/search")
      .expect(200)
      .expect([{ test: true }])
  })

  it("should just work when not authenticated", async () => {
    const app = await createApp()

    return request(app.getHttpServer()).get("/create").expect(403)
  })
  it("should throw when check not available", async () => {
    const app = await createApp()

    return request(app.getHttpServer()).get("/update").expect(500)
  })

  it("should work when authenticated", async () => {
    const app = await createApp({ id: 1 })

    return request(app.getHttpServer())
      .get("/create")
      .expect(200)
      .expect({ test: true })
  })
})
