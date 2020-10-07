/* eslint-disable */
import { Gate } from "#/facades/Gate"
import { ForbiddenException } from "@nestjs/common"
import { cannot } from "./cannot"

describe("cannot(...)", () => {
  it("should return value", async () => {
    jest.spyOn(Gate, "denies").mockImplementation(() => Promise.resolve(true))
    await expect(cannot("test").transform("foo", {} as any)).resolves.toBe(
      "foo",
    )
  })
  it("should throw 403", async () => {
    jest.spyOn(Gate, "denies").mockImplementation(() => Promise.resolve(false))
    await expect(cannot("test").transform("foo", {} as any)).rejects.toThrow(
      ForbiddenException,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
})
