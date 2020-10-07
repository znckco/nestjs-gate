import { Gate } from "#/facades/Gate"
import { ForbiddenException, PipeTransform } from "@nestjs/common"

export function cannot(ability: string): PipeTransform {
  return {
    async transform(value) {
      if (await Gate.denies(ability, value)) {
        return value
      }

      throw new ForbiddenException()
    },
  }
}
