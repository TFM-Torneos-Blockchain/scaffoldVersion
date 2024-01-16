import { BigInt } from "@graphprotocol/graph-ts";
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

  tournamentEntity.save();
}

export function handleEnroll(event: EnrollEvent): void {
  //? it is necessary to do this distinction? or just better try create new and framework will know it already exists?
  // if user already registered but in another tournament, no need to create new instance
  let playerEntity = Player.load(event.params.user.toString());
  if (!playerEntity) {
    let playerEntity = new Player(event.params.user.toString());
    playerEntity.save();
  }

  let tournamentEntity = Tournament.load(event.params.tournamentID.toString());
  if (tournamentEntity) {
    // ? I wouldn't have done the IF but it give me undefined errors... i guess it's standard protocol, but in this case I'm 100% sure that tournament will always exist
    tournamentEntity.totalCollectedAmount = event.params.totalCollectedAmount;
    tournamentEntity.numParticipant = event.params.numParticipants;
    tournamentEntity.save();
  }

  //? would you put this first and then the tournamentEntity?
  //? as it's sure that this entry won't exist, should I just skip the load step + if ?
  let tournamentPlayerEntity = TournamentPlayer.load(
    event.params.tournamentID.toString().concat(event.params.user.toString())
  );
  // creation of the auxiliar table so Tournament and Player can relate when a new User is enrolled, NOT when he makes the play!
  if (!tournamentPlayerEntity) {
    tournamentPlayerEntity = new TournamentPlayer(
      event.params.tournamentID.toString().concat(event.params.user.toString())
    );
    tournamentPlayerEntity.tournamentID = event.params.tournamentID.toString();
    tournamentPlayerEntity.player = event.params.user.toString();
  }
  tournamentPlayerEntity.save();
  // ? you asked me here to already create a TournamentPlayer, is this because as TournamentPlayer is also an auxiliar table, right?
}

export function handleResultCreated(event: ResultCreatedEvent): void {
  // the TournamentPlayer will mandatorily already have been created when creating player
  let tournamentPlayerEntity = TournamentPlayer.load(
    event.params.tournamentID.toString().concat(event.params.player.toString())
  );
  if (tournamentPlayerEntity) {
    tournamentPlayerEntity.scoreNumber = event.params.scoreNumber;
    tournamentPlayerEntity.blockTimestamp = event.block.timestamp;
    tournamentPlayerEntity.save();
  }
}
