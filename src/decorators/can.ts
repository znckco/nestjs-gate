import { Gate } from "#/facades/Gate"
import { ForbiddenException, PipeTransform } from "@nestjs/common"

export function can(ability: string): PipeTransform {
  return {
    async transform(value) {
      if (await Gate.allows(ability, value)) {
        return value
      }

      throw new ForbiddenException()
    },
  }
}
