import { expect } from "chai";
import { ethers, network } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { TournamentManager, FunToken, FunToken2, CompoundProtocol, MajorHashGame } from "../typechain-types";
import { getLeaderboard } from "../../nextjs/utils/leader-board/leaderboard";
import { getMerkleRoot } from "../../nextjs/utils/leader-board/merkle_tree_proof";
import type { Signer } from "ethers";
import contracts from "../../nextjs/generated/deployedContracts";

describe("tournamentManager and MerkleTree", function () {
  // We define a fixture to reuse the same setup in every test.

  const enrollmentAmount = ethers.utils.parseEther("0.001");

  let tournamentManager: TournamentManager;
  let funToken: FunToken;
  let funToken2: FunToken2;
  let compoundProtocol: CompoundProtocol;
  let majorHashGame: MajorHashGame;
  let owner: Signer, participant1: Signer, participant2: Signer;

  type EventsResultCreated = {
    player: string;
    score_number: bigint;
  };

  let filterTournaments;
  let filterResults;
  let mintTournamentsCreated;
  let mintResultCreated;
  let eventsResultCreated: EventsResultCreated[];
  let badEventsResultCreated: EventsResultCreated[];

  it("E2E", async () => {
    // this.timeout(400000); // Initialize some signers
    [owner, participant1, participant2] = await ethers.getSigners();
    const provider = ethers.provider;
    console.log(await provider.getBalance(await owner.getAddress()));
    console.log(await owner.getAddress());

    // TournamentManager contract
    const tournamentManagerFactory = await ethers.getContractFactory("TournamentManager");
    const tournamentManager = tournamentManagerFactory.attach(
      contracts[5][0].contracts.TournamentManager.address, // The deployed contract address
    );
    // Compound protocol contract
    const CompoundProtocolFactory = await ethers.getContractFactory("CompoundProtocol");
    const CompoundProtocol = CompoundProtocolFactory.attach(
      contracts[5][0].contracts.CompoundProtocol.address, // The deployed contract address
    );

    // Compound protocol contract
    const RocketProtocolFactory = await ethers.getContractFactory("RocketProtocol");
    const RocketProtocol = RocketProtocolFactory.attach(
      contracts[5][0].contracts.RocketProtocol.address, // The deployed contract address
    );
    // Major hash game contract
    const MajorHashGameFactory = await ethers.getContractFactory("MajorHashGame");
    const MajorHashGame = MajorHashGameFactory.attach(
      contracts[5][0].contracts.MajorHashGame.address, // The deployed contract address
    );
    // FunToken contract
    const FunTokenFactory = await ethers.getContractFactory("FunToken");
    const FunToken = FunTokenFactory.attach(
      contracts[5][0].contracts.FunToken.address, // The deployed contract address
    );
    // FunToken2 contract
    const FunToken2Factory = await ethers.getContractFactory("FunToken2");
    const FunToken2 = FunToken2Factory.attach(
      contracts[5][0].contracts.FunToken2.address, // The deployed contract address
    );
      // const erc20 = new ethers.Contract(erc20.address,erc20.abi,owner)


    const currentDate = new Date();
    const tomorrow = new Date(currentDate.getTime() + 2* 60 * 1000); // Add 2 days
    const init_date_UnixTimestampInSeconds = Math.floor(tomorrow.getTime() / 1000);

    const afterTomorrow = new Date(tomorrow.getTime() + 2*60 * 1000); // Add another day
    const end_date_UnixTimestampInSeconds = Math.floor(afterTomorrow.getTime() / 1000);
    console.log("creating tournament");
    // await tournamentManager
    //   .connect(owner)
    //   .createTournament(
    //     10000,
    //     1,
    //     enrollmentAmount,
    //     ["0x42a71137C09AE83D8d05974960fd607d40033499"],
    //     init_date_UnixTimestampInSeconds,
    //     end_date_UnixTimestampInSeconds,
    //     CompoundProtocol.address,
    //     ["0x9A539EEc489AAA03D588212a164d0abdB5F08F5F", "0xef9e070044d62C38D2e316146dDe92AD02CF2c2c"],
    //   );
    // console.log("tournament created");

    // filterTournaments = tournamentManager.filters.TournamentCreated();
    // mintTournamentsCreated = await tournamentManager.queryFilter(filterTournaments);

    // let greatestTournamentID = 0;

    // for (const event of mintTournamentsCreated) {
    //   if (event.args && event.args && event.args.tournamentID > greatestTournamentID) {
    //     greatestTournamentID = event.args.tournamentID;
    //   }
    // }

    // console.log({ greatestTournamentID }, "to enroll");

    // await funToken.connect(participant1).approve(leaderBoard.address, enrollmentAmount);


    // await tournamentManager.connect(owner).enrollWithERC20(greatestTournamentID);

    // const newTournament = await tournamentManager.tournaments(greatestTournamentID);
    // console.log("enrolled to ", greatestTournamentID,"num parts",newTournament.numParticipants);

    // console.log("waiting 1 minute to allow enrolls");

    // await tournamentManager.connect(owner).startETHTournament(17);

    // console.log("played!");

    // await MajorHashGame.connect(owner).play(greatestTournamentID);

    const newTournament1 = await tournamentManager.tournaments(17);


    console.log("SPONGE", newTournament1.resultsSpongeHash, "players",  (newTournament1.initDate).toBigInt(),newTournament1.deFiBridgeAddress,newTournament1.enrollmentAmount);

    // filterResults = tournamentManager.filters.ResultCreated();
    // mintResultCreated = await tournamentManager.queryFilter(filterResults);
    // console.log(mintResultCreated);

    // eventsResultCreated = [];

    // for (let i = 0; i < mintResultCreated.length; i++) {
    //   const player = mintResultCreated[i].args.player;
    //   const scoreNumber = mintResultCreated[i].args.scoreNumber.toBigInt();

    //   eventsResultCreated.push({ player, score_number: scoreNumber });
    // }
    // console.log(eventsResultCreated);
    // const backendLeaderBoard = getLeaderboard(60n, eventsResultCreated);
    // // console.log(backendLeaderBoard.positions);
    // const index = backendLeaderBoard.positions.indexOf(0);
    // const backendMerkleTree = getMerkleRoot(
    //   60,
    //   backendLeaderBoard.concatenatedStringBytes,
    //   backendLeaderBoard.positions,
    //   index,
    // );
    //   console.log(backendLeaderBoard.spongeHash)
    // const end = tournamentManager.endERC20Tournament(
    //   greatestTournamentID,
    //   backendLeaderBoard.concatenatedStringBytes,
    //   backendLeaderBoard.positions,
    // );
    // await new Promise(end => setTimeout(end, 5000));
    // console.log("tournament finished");
  });
});
