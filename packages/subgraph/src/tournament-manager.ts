import {
  Enroll as EnrollEvent,
  ResultCreated as ResultCreatedEvent,
  TournamentCreated as TournamentCreatedEvent,
} from "../generated/TournamentManager/TournamentManager";
import { Enroll, ResultCreated, TournamentCreated } from "../generated/schema";

export function handleTournamentCreated(event: TournamentCreatedEvent): void {
  let tournamentEntity = new Tournament(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  tournamentEntity.tournamentID = event.params.tournamentID;
  tournamentEntity.initData = event.params.initData;
  tournamentEntity.endDate = event.params.endDate;
  tournamentEntity.deFiBridgeAddress = event.params.deFiBridgeAddress;

  // Todo

  tournamentEntity.save();
}

export function handleEnroll(event: EnrollEvent): void {
  // TODO
  // create player
  // create player result
  // load the tournament and update the totalcollectedamount and number of participants load.Tournament
  let entity = new Enroll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tournamentID = event.params.tournamentID;
  entity.user = event.params.user;
  entity.numParticipants = event.params.numParticipants;
  entity.totalCollectedAmount = event.params.totalCollectedAmount;

  entity.blockTimestamp = event.block.timestamp;

  entity.save();
}

export function handleResultCreated(event: ResultCreatedEvent): void {
  let entity = new ResultCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tournamentID = event.params.tournamentID;
  entity.player = event.params.player;
  entity.scoreNumber = event.params.scoreNumber;

  entity.blockTimestamp = event.block.timestamp;

  entity.save();
}
