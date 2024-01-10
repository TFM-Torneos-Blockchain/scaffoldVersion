import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Enroll } from "../generated/schema"
import { Enroll as EnrollEvent } from "../generated/TournamentManager/TournamentManager"
import { handleEnroll } from "../src/tournament-manager"
import { createEnrollEvent } from "./tournament-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let tournamentID = 123
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let numParticipants = 123
    let totalCollectedAmount = BigInt.fromI32(234)
    let newEnrollEvent = createEnrollEvent(
      tournamentID,
      user,
      numParticipants,
      totalCollectedAmount
    )
    handleEnroll(newEnrollEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Enroll created and stored", () => {
    assert.entityCount("Enroll", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Enroll",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tournamentID",
      "123"
    )
    assert.fieldEquals(
      "Enroll",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Enroll",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "numParticipants",
      "123"
    )
    assert.fieldEquals(
      "Enroll",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "totalCollectedAmount",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
