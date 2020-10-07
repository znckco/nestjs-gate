import { Gate } from "./Gate"

describe("Gate", () => {
  const service = {
    allows: jest.fn(),
    denies: jest.fn(),
  }

  test("allows", () => {
    Gate._useService(service)
    Gate.allows("foo", { id: 1 })
    expect(service.allows).toHaveBeenCalledWith("foo", { id: 1 })
  })
  
  test("denies", () => {
    Gate._useService(service)
    Gate.denies("foo", { id: 1 })
    expect(service.denies).toHaveBeenCalledWith("foo", { id: 1 })
  })
})
