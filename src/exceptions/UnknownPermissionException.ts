import { InternalServerErrorException } from "@nestjs/common"

export class UnknownPermissionException extends InternalServerErrorException {}
