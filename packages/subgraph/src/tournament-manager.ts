import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Enroll as EnrollEvent,
  ResultCreated as ResultCreatedEvent,
  TournamentCreated as TournamentCreatedEvent,
  TournamentManager,
} from "../generated/TournamentManager/TournamentManager";
import { Tournament, Player, TournamentPlayer } from "../generated/schema";

export function handleTournamentCreated(event: TournamentCreatedEvent): void {
  let tournamentEntity = new Tournament(event.params.tournamentID.toString());
  let contractAddress = TournamentManager.bind(event.address);

  tournamentEntity.initDate = event.params.initData;
  tournamentEntity.endDate = event.params.endDate;
  tournamentEntity.deFiBridgeAddress = event.params.deFiBridgeAddress;
  tournamentEntity.maxParticipants = contractAddress
    .tournaments(new BigInt(event.params.tournamentID))
    .getMaxParticipants();
  tournamentEntity.enrollmentAmount = contractAddress
    .tournaments(new BigInt(event.params.tournamentID))
    .getEnrollmentAmount();
  tournamentEntity.totalCollectedAmount = new BigInt(0);
  tournamentEntity.numParticipant = 0;
  tournamentEntity.acceptedTokens = changetype<Bytes[]>(
    contractAddress.getAcceptedTokens(event.params.tournamentID)
  );

  tournamentEntity.save();
}

export function handleEnroll(event: EnrollEvent): void {
  //? it is necessary to do this distinction? or just better try create new and framework will know it already exists?
  // if user already registered but in another tournament, no need to create new instance
  let playerEntity = Player.load(event.params.user.toHexString());
  if (!playerEntity) {
    let playerEntity = new Player(event.params.user.toHexString());
    playerEntity.save();
  }

  let tournamentEntity = Tournament.load(event.params.tournamentID.toString());
  if (!tournamentEntity) {
    tournamentEntity = new Tournament(event.params.tournamentID.toString());
  }
  tournamentEntity.totalCollectedAmount = event.params.totalCollectedAmount;
  tournamentEntity.numParticipant = event.params.numParticipants;
  tournamentEntity.save();

  // a user can't enroll twice in same Tournament therefor, for each enroll event a new TournamentPlayer will be done.
  let tournamentPlayerEntity = new TournamentPlayer(
    event.params.tournamentID.toString().concat(event.params.user.toHexString())
  );
  tournamentPlayerEntity.tournamentID = event.params.tournamentID.toString();
  tournamentPlayerEntity.player = event.params.user.toHexString();
  tournamentPlayerEntity.scoreNumber = new BigInt(0);
  tournamentPlayerEntity.blockTimestamp = new BigInt(0);
  tournamentPlayerEntity.save();
}

export function handleResultCreated(event: ResultCreatedEvent): void {
  // The TournamentPlayer will already have been created when creating a player.
  let tournamentPlayerEntity = TournamentPlayer.load(
    event.params.tournamentID
      .toString()
      .concat(event.params.player.toHexString())
  );
  if (tournamentPlayerEntity) {
    tournamentPlayerEntity.scoreNumber = event.params.scoreNumber;
    tournamentPlayerEntity.blockTimestamp = event.block.timestamp;
    tournamentPlayerEntity.save();
  }
}
