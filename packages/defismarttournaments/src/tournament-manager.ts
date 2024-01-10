import {
  Enroll as EnrollEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  ResultCreated as ResultCreatedEvent,
  TournamentCreated as TournamentCreatedEvent
} from "../generated/TournamentManager/TournamentManager"
import {
  Enroll,
  OwnershipTransferred,
  ResultCreated,
  TournamentCreated
} from "../generated/schema"

export function handleEnroll(event: EnrollEvent): void {
  let entity = new Enroll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tournamentID = event.params.tournamentID
  entity.user = event.params.user
  entity.numParticipants = event.params.numParticipants
  entity.totalCollectedAmount = event.params.totalCollectedAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleResultCreated(event: ResultCreatedEvent): void {
  let entity = new ResultCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tournamentID = event.params.tournamentID
  entity.player = event.params.player
  entity.scoreNumber = event.params.scoreNumber

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTournamentCreated(event: TournamentCreatedEvent): void {
  let entity = new TournamentCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tournamentID = event.params.tournamentID
  entity.initData = event.params.initData
  entity.endDate = event.params.endDate
  entity.deFiBridgeAddress = event.params.deFiBridgeAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
