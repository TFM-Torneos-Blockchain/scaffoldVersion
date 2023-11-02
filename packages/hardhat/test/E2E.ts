import { expect } from "chai";
import { ethers, network } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { TournamentManager, FunToken, FunToken2, CompoundProtocol, MajorHashGame } from "../typechain-types";
import { getLeaderboard } from "../../nextjs/utils/leader-board/leaderboard";
import { getMerkleRoot } from "../../nextjs/utils/leader-board/merkle_tree_proof";
import type { Signer } from "ethers";

describe("tournamentManager and MerkleTree", function () {
  // We define a fixture to reuse the same setup in every test.

  const enrollmentAmount = ethers.utils.parseEther("1");

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

  let filter;
  let mintResultCreated;
  let eventsResultCreated: EventsResultCreated[];
  let badEventsResultCreated: EventsResultCreated[];

  before("Deploy contracts", async () => {
    // Initialize some signers
    // [owner, participant1, participant2] = await ethers.getSigners();

    // // Compound protocol contract
    // const tournamentManagerFactory = await ethers.getContractFactory("TournamentManager");
    // tournamentManager = (await tournamentManagerFactory.deploy(owner.getAddress())) as TournamentManager;
    // await tournamentManager.deployed();
    // // Compound protocol contract
    // const CompoundProtocolFactory = await ethers.getContractFactory("CompoundProtocol");
    // compoundProtocol = (await CompoundProtocolFactory.deploy(owner.getAddress())) as CompoundProtocol;
    // await compoundProtocol.deployed();
    // // Major hash game contract
    // const MajorHashGameFactory = await ethers.getContractFactory("MajorHashGame");
    // majorHashGame = (await MajorHashGameFactory.deploy(tournamentManager.address)) as MajorHashGame;
    // await majorHashGame.deployed();
    // // FunToken contract
    // const FunTokenFactory = await ethers.getContractFactory("FunToken");
    // funToken = (await FunTokenFactory.deploy(owner.getAddress())) as FunToken;
    // await funToken.deployed();
    // // FunToken2 contract
    // const FunToken2Factory = await ethers.getContractFactory("FunToken2");
    // funToken2 = (await FunToken2Factory.deploy(owner.getAddress())) as FunToken2;
    // await funToken2.deployed();

    // const currentDate = new Date();
    // const tomorrow = new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000); // Add 24 hours
    // const init_date_UnixTimestampInSeconds = Math.floor(tomorrow.getTime() / 1000);

    // const afterTomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000); // Add another 24 hours
    // const end_date_UnixTimestampInSeconds = Math.floor(afterTomorrow.getTime() / 1000);

    // await tournamentManager
    //   .connect(owner)
    //   .createTournament(
    //     10000,
    //     1,
    //     enrollmentAmount,
    //     [funToken.address],
    //     init_date_UnixTimestampInSeconds,
    //     end_date_UnixTimestampInSeconds,
    //     compoundProtocol.address,
    //     ["0xF09F0369aB0a875254fB565E52226c88f10Bc839"],
    //   );

    //   await tournamentManager
    //   .connect(owner)
    //   .createTournament(
    //     10000,
    //     1,
    //     enrollmentAmount,
    //     [funToken.address],
    //     init_date_UnixTimestampInSeconds,
    //     end_date_UnixTimestampInSeconds,
    //     compoundProtocol.address,
    //     ["0xF09F0369aB0a875254fB565E52226c88f10Bc839"],
    //   );

    // await funToken.transfer(participant1.getAddress(), ethers.utils.parseEther("15"));
    // await funToken2.transfer(participant1.getAddress(), ethers.utils.parseEther("15"));
    // await funToken.transfer(participant2.getAddress(), ethers.utils.parseEther("15"));
    // await funToken2.transfer(participant2.getAddress(), ethers.utils.parseEther("15"));

    // await funToken.connect(owner).approve(tournamentManager.address, enrollmentAmount);
    // await tournamentManager.enrollWithERC20(0);
    // await funToken.connect(participant1).approve(tournamentManager.address, enrollmentAmount);
    // await tournamentManager.connect(participant1).enrollWithERC20(0);
    // await funToken.connect(participant2).approve(tournamentManager.address, enrollmentAmount);
    // await tournamentManager.connect(participant2).enrollWithERC20(0);

    // // advance time by one hour and mine a new block
    // await time.increase(3600 * 50);
    // await majorHashGame.connect(owner).play(0);
    // const blockNumBefore1 = await ethers.provider.getBlockNumber();
    // const blockBefore1 = await ethers.provider.getBlock(blockNumBefore1);
    // const timestampBefore1 = blockBefore1.timestamp;
    // // console.log("temps owner", timestampBefore1);
    // await majorHashGame.connect(participant1).play(0);
    // await majorHashGame.connect(participant2).play(0);
    // const blockNumBefore = await ethers.provider.getBlockNumber();
    // const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    // const timestampBefore = blockBefore.timestamp;
    // // console.log("temps player1", timestampBefore);

    // filter = tournamentManager.filters.ResultCreated(0);
    // mintResultCreated = await tournamentManager.queryFilter(filter);

    // eventsResultCreated = [];

    // for (let i = 0; i < mintResultCreated.length; i++) {
    //   const player = mintResultCreated[i].args.player;
    //   const scoreNumber = mintResultCreated[i].args.scoreNumber.toBigInt();

    //   eventsResultCreated.push({ player, score_number: scoreNumber });
    // }

  });

  it("E2E", async () => {
    console.log("ts giew")
  });

});
