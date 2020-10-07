/* eslint-disable */
import { Gate } from "#/facades/Gate"
import { ForbiddenException } from "@nestjs/common"
import { can } from "./can"

describe("can(...)", () => {
  it("allows", async () => {
    jest.spyOn(Gate, "allows").mockImplementation(() => Promise.resolve(true))
    await expect(can("test").transform("foo", {} as any)).resolves.toBe("foo")
  })
  it("denies", async () => {
    jest.spyOn(Gate, "allows").mockImplementation(() => Promise.resolve(false))
    await expect(can("test").transform("foo", {} as any)).rejects.toThrow(
      ForbiddenException,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
})
