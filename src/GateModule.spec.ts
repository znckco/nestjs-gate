import {
  CallHandler,
  Controller,
  ExecutionContext,
  ForbiddenException,
  Get,
} from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { Policy } from "./decorators/Policy"
import { Gate } from "./facades/Gate"
import { GateModule } from "./GateModule"

class EntityPolicy {
  search() {
    return true
  }

  create(user: unknown) {
    return user != null
  }
}

@Policy(EntityPolicy)
class Entity {}

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

class AuthProvider {
  constructor(private user?: unknown) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp()

    http.getRequest().user = this.user

    return next.handle()
  }
}

describe("GateModule", () => {
  async function createApp(user?: unknown) {
    const moduleRef = await Test.createTestingModule({
      imports: [GateModule],
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
