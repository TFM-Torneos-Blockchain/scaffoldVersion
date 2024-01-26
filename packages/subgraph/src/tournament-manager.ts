import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  Enroll as EnrollEvent,
  ResultCreated as ResultCreatedEvent,
  TournamentCreated as TournamentCreatedEvent,
  TournamentManager,
} from "../generated/TournamentManager/TournamentManager";
import {
  Tournament,
  Player,
  TournamentPlayer,
  Token,
} from "../generated/schema";

const BIGINT_ZERO = new BigInt(0);

export function handleTournamentCreated(event: TournamentCreatedEvent): void {
  let tournamentID_string = event.params.tournamentID.toString();
  let tournamentEntity = new Tournament(tournamentID_string);
  let contractAddress = TournamentManager.bind(event.address);

  let tournamentID_BigInt = new BigInt(event.params.tournamentID);
  let tournament = contractAddress.tournaments(tournamentID_BigInt);

  tournamentEntity.initDate = event.params.initData;
  tournamentEntity.endDate = event.params.endDate;
  tournamentEntity.deFiBridgeAddress = event.params.deFiBridgeAddress;
  tournamentEntity.maxParticipants = tournament.getMaxParticipants();
  tournamentEntity.enrollmentAmount = tournament.getEnrollmentAmount();
  tournamentEntity.totalCollectedAmount = BIGINT_ZERO;
  tournamentEntity.numParticipant = 0;
  tournamentEntity.save();

  let callAcceptedTokens = contractAddress.try_getAcceptedTokens(
    event.params.tournamentID
  );
  let acceptedTokens = callAcceptedTokens.value;
  if (callAcceptedTokens.reverted) {
    log.info("getAcceptedTokens reverted", []);
  } else {
    for (let i = 0; i < acceptedTokens.length; i++) {
      let tokensID = [
        tournamentID_string,
        acceptedTokens[i].toHexString(),
      ].join("_");
      let tokenEntity = new Token(tokensID);
      tokenEntity.tournamentID = tournamentID_string;
      tokenEntity.tokenAddress = acceptedTokens[i];
      tokenEntity.save();
    }
  }
}

export function handleEnroll(event: EnrollEvent): void {
  // if user already registered but in another tournament, no need to create new instance
  let userID = event.params.user.toHexString();
  let playerEntity = Player.load(userID);
  if (!playerEntity) {
    let playerEntity = new Player(userID);
    playerEntity.save();
  }

  let tournamentID = event.params.tournamentID.toString();
  let tournamentEntity = Tournament.load(tournamentID);
  // it should never happen that a TournamentID doesn't exist when someone enrolls
  if (!tournamentEntity) {
    log.critical("No one could enroll to a non existing tournament", []);
    return;
  }
  tournamentEntity.totalCollectedAmount = event.params.totalCollectedAmount;
  tournamentEntity.numParticipant = event.params.numParticipants;
  tournamentEntity.save();

  // a user can't enroll twice in same Tournament therefor, for each enroll event a new TournamentPlayer will be done.
  let tournamentPlayerEntity = new TournamentPlayer(
    [tournamentID, userID].join("_")
  );
  tournamentPlayerEntity.tournamentID = tournamentID;
  tournamentPlayerEntity.player = userID;
  tournamentPlayerEntity.scoreNumber = BIGINT_ZERO;
  tournamentPlayerEntity.blockTimestamp = BIGINT_ZERO;
  tournamentPlayerEntity.save();
}

export function handleResultCreated(event: ResultCreatedEvent): void {
  // The TournamentPlayer will already have been created when creating a player (in the enroll step).
  let tournamentID = event.params.tournamentID.toString();
  let userID = event.params.player.toHexString();
  let tournamentPlayerEntity = TournamentPlayer.load(
    [tournamentID, userID].join("_")
  );
  if (tournamentPlayerEntity) {
    tournamentPlayerEntity.scoreNumber = event.params.scoreNumber;
    tournamentPlayerEntity.blockTimestamp = event.block.timestamp;
    tournamentPlayerEntity.save();
  }
}
