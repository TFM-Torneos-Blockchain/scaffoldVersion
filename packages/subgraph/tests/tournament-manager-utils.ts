import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Enroll,
  OwnershipTransferred,
  ResultCreated,
  TournamentCreated
} from "../generated/TournamentManager/TournamentManager"

export function createEnrollEvent(
  tournamentID: i32,
  user: Address,
  numParticipants: i32,
  totalCollectedAmount: BigInt
): Enroll {
  let enrollEvent = changetype<Enroll>(newMockEvent())

  enrollEvent.parameters = new Array()

  enrollEvent.parameters.push(
    new ethereum.EventParam(
      "tournamentID",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tournamentID))
    )
  )
  enrollEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  enrollEvent.parameters.push(
    new ethereum.EventParam(
      "numParticipants",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(numParticipants))
    )
  )
  enrollEvent.parameters.push(
    new ethereum.EventParam(
      "totalCollectedAmount",
      ethereum.Value.fromUnsignedBigInt(totalCollectedAmount)
    )
  )

  return enrollEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createResultCreatedEvent(
  tournamentID: i32,
  player: Address,
  scoreNumber: BigInt
): ResultCreated {
  let resultCreatedEvent = changetype<ResultCreated>(newMockEvent())

  resultCreatedEvent.parameters = new Array()

  resultCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "tournamentID",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tournamentID))
    )
  )
  resultCreatedEvent.parameters.push(
    new ethereum.EventParam("player", ethereum.Value.fromAddress(player))
  )
  resultCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "scoreNumber",
      ethereum.Value.fromUnsignedBigInt(scoreNumber)
    )
  )

  return resultCreatedEvent
}

export function createTournamentCreatedEvent(
  tournamentID: i32,
  initData: BigInt,
  endDate: BigInt,
  deFiBridgeAddress: Address
): TournamentCreated {
  let tournamentCreatedEvent = changetype<TournamentCreated>(newMockEvent())

  tournamentCreatedEvent.parameters = new Array()

  tournamentCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "tournamentID",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tournamentID))
    )
  )
  tournamentCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "initData",
      ethereum.Value.fromUnsignedBigInt(initData)
    )
  )
  tournamentCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "endDate",
      ethereum.Value.fromUnsignedBigInt(endDate)
    )
  )
  tournamentCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "deFiBridgeAddress",
      ethereum.Value.fromAddress(deFiBridgeAddress)
    )
  )

  return tournamentCreatedEvent
}
