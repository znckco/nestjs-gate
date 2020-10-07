<p align="center">
  <img alt="NestJS Gate" src="https://raw.githubusercontent.com/znckco/nestjs-gate/master/.assets/cover.png"/>
</p>

<p align="center">

[![NPM](https://img.shields.io/npm/v/nestjs-gate)](https://www.npmjs.com/package/nestjs-gate)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![CI](https://github.com/znckco/nestjs-gate/workflows/CI/badge.svg)](https://github.com/znckco/nestjs-gate/actions?query=workflow%3ACI)
[![codecov](https://codecov.io/gh/znckco/nestjs-gate/branch/master/graph/badge.svg)](https://codecov.io/gh/znckco/nestjs-gate)

</p>

## Description

Gate is an authorization module for NestJS.

## Installation

```bash
$ npm install --save nestjs-gate
```

## Quick Start

```ts
import { GateModule, Gate, Policy } from "nestjs-gate"
import { Module, Injectable, Controller } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"

// 1. Create policy
@Injectable()
class ResourcePolicy {
  update(user: any, resource: Resource) {
    return true // Check if "user" can update "resource"
  }
}

// 2. Register policy
@Policy(ResourcePolicy)
class Resource {}

// 3. Use Gate for authorization
@Injectable()
class ExampleService {
  async update(resource: Resource) {
    if (await Gate.allows("update", resource)) {
      // Yes, update is allowed.
    } else {
      // No, throw forbidden error.
    }
  }
}

// 3. Use Gate with pipe transform
@Controller()
class ExampleController {
  @Post("/update")
  async update(@Param("id", /* id -> resource */ , can("update")) resource: Resource) {
      // Yes, update is allowed.
  }
}

// 4. Import GateModule and provide your polices.
@Module({ imports: [GateModule], providers: [ResourcePolicy, ExampleService] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}

bootstrap()
```

## Stay in touch

- Author - [Rahul Kadyan](https://znck.me)
- Twitter - [@znck0](https://twitter.com/znck0)

## License

NestJS Gate is [MIT licensed](LICENSE).
