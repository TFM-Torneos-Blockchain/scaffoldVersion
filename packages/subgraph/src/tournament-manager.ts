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
  let tournamentEntity = new Tournament(event.params.tournamentID.toString());
  let contractAddress = TournamentManager.bind(event.address);

  let tournamentID = new BigInt(event.params.tournamentID);
  let tournament = contractAddress.tournaments(tournamentID);

  tournamentEntity.initDate = event.params.initData;
  tournamentEntity.endDate = event.params.endDate;
  tournamentEntity.deFiBridgeAddress = event.params.deFiBridgeAddress;
  tournamentEntity.maxParticipants = tournament.getMaxParticipants();
  tournamentEntity.enrollmentAmount = tournament.getEnrollmentAmount();
  tournamentEntity.totalCollectedAmount = BIGINT_ZERO;
  tournamentEntity.numParticipant = 0;

  let callResult = contractAddress.try_getAcceptedTokens(
    event.params.tournamentID
  );
  let acceptedTokens = callResult.value;
  if (callResult.reverted) {
    log.info("getAcceptedTokens reverted", []);
  } else {
    for (let i = 0; i < acceptedTokens.length; i++) {
      let tokenEntity = Token.load(acceptedTokens[i]);
      if (!tokenEntity) {
        let tokenEntity = new Token(acceptedTokens[i]);
        tokenEntity.save();
      }
    }
  }

  tournamentEntity.acceptedTokens = changetype<Bytes[]>(acceptedTokens);
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
  // As no one can enroll twice in a tournament it should never happen that a TournamentID doesn't exist when someone enrolls
  if (!tournamentEntity) {
    log.critical("This should not happen", []);
    return;
  }
  tournamentEntity.totalCollectedAmount = event.params.totalCollectedAmount;
  tournamentEntity.numParticipant = event.params.numParticipants;
  tournamentEntity.save();

  let tournamentID = event.params.tournamentID.toString();
  let userID = event.params.user.toHexString();
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
  // The TournamentPlayer will already have been created when creating a player.
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
