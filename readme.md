<p align="center">
  <img alt="NestJS Gate" src="https://raw.githubusercontent.com/znckco/nestjs-gate/master/.assets/cover.png"/>
</p>

<h1 align="center">NestJS Gate</h1>

<p align="center">

[![NPM](https://img.shields.io/npm/v/nestjs-gate)](https://www.npmjs.com/package/nestjs-gate)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![CI](https://github.com/znckco/nestjs-gate/workflows/CI/badge.svg)](https://github.com/znckco/nestjs-gate/actions?query=workflow%3ACI)

</p>

## Description

NestJS Gate is template repository to create new nestjs modules.

## Installation

```bash
$ npm install --save nestjs-gate
```

## Quick Start

```ts
import { GateModule, Gate } from "nestjs-gate"

@Module({ imports: [GateModule] })
class AppModule {}

// TODO: Add docs.
Gate.allows("ability", resource)
```

## Stay in touch

- Author - [Rahul Kadyan](https://znck.me)
- Twitter - [@znck0](https://twitter.com/znck0)

## License

NestJS Gate is [MIT licensed](LICENSE).
