import { InternalServerErrorException } from "@nestjs/common"

export class MissingPolicyException extends InternalServerErrorException {}
