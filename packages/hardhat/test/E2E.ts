import * as dotenv from "dotenv";
dotenv.config();
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

  const enrollmentAmount = ethers.utils.parseEther("1");

  let tournamentManager: TournamentManager;
  let funToken: FunToken;
  let funToken2: FunToken2;
  let compoundProtocol: CompoundProtocol;
  let majorHashGame: MajorHashGame;
  let owner: Signer, participant1: Signer, participant2: Signer;

  type EventsResultCreated = {
    address: string;
    score: bigint;
  };

  let filterTournaments;
  let filterResults;
  let mintTournamentsCreated;
  let mintResultCreated;
  let eventsResultCreated: EventsResultCreated[];
  let badEventsResultCreated: EventsResultCreated[];

  it("E2E", async () => {
    // this.timeout(400000); // Initialize some signers
    [owner] = await ethers.getSigners();
    const provider = ethers.provider;
    const signer1 = new ethers.Wallet("0x2cfda362c267f3a20867934fb70ca6a139af282b820fbf1efec8839d303d3d7b", provider);
    const signer2 = new ethers.Wallet("0x7a49e0ff147a2919d3f04b96bcd8dbdc255b6eeb175420f4be3d4f5109406901", provider);
    console.log(await provider.getBalance(await owner.getAddress()));
    console.log(await signer1.getAddress());
    // console.log(await participant1.getAddress());

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
    const UniswapV2ProtocolFactory = await ethers.getContractFactory("UniswapV2Protocol");
    const UniswapV2Protocol = UniswapV2ProtocolFactory.attach(
      contracts[5][0].contracts.UniswapV2Protocol.address, // The deployed contract address
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
    const tomorrow = new Date(currentDate.getTime() + 3 * 60 * 1000); // Add 2 days
    const init_date_UnixTimestampInSeconds = Math.floor(tomorrow.getTime() / 1000);

    const afterTomorrow = new Date(tomorrow.getTime() + 3 * 60 * 1000); // Add another day
    const end_date_UnixTimestampInSeconds = Math.floor(afterTomorrow.getTime() / 1000);
    // !ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

    // console.log("creating tournament");
    // await tournamentManager
    //   .connect(owner)
    //   .createTournament(
    //     55,
    //     1,
    //     enrollmentAmount,
    //     [FunToken.address, FunToken2.address],
    //     init_date_UnixTimestampInSeconds,
    //     end_date_UnixTimestampInSeconds,
    //     UniswapV2Protocol.address,
    //     ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", "0x43e94ce53938AAeBC0731969ADc0d923A1e11579"],
    //   );
    // console.log("tournament created");

    // !ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

    // console.log("approve fet");
    // await FunToken.approve(tournamentManager.address, enrollmentAmount);
    // await FunToken2.approve(tournamentManager.address, enrollmentAmount);
    // await FunToken.connect(signer1).approve(tournamentManager.address, enrollmentAmount);
    // await FunToken2.connect(signer1).approve(tournamentManager.address, enrollmentAmount);
    // await FunToken.connect(signer2).approve(tournamentManager.address, enrollmentAmount);
    // await FunToken2.connect(signer2).approve(tournamentManager.address, enrollmentAmount);
    // const allow = await FunToken.allowance(owner.getAddress(), tournamentManager.address);
    // console.log("allowance fet");

    // // const newTournament = await tournamentManager.tournaments(33);

    // // console.log("enrolled to ", 31, "num parts", newTournament.maxParticipants, "allow", allow, newTournament.initDate.toBigInt());

    // !ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    // await tournamentManager.connect(owner).enrollWithERC20(0);
    // await tournamentManager.connect(signer1).enrollWithERC20(0);
    // await tournamentManager.connect(signer2).enrollWithERC20(0);

    // const newTournament = await tournamentManager.tournaments(0);
    // console.log("enrolled to ", 31, "num parts", newTournament.numParticipants, newTournament.initDate.toBigInt());

    // !ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

    // console.log("waiting 1 minute to allow enrolls");

    // await tournamentManager.connect(owner).startERC20Tournament(0);
    // console.log("played!");

    // !ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

    // console.log("played!");

    // await MajorHashGame.connect(owner).play(0);
    // await MajorHashGame.connect(signer1).play(0);
    // await MajorHashGame.connect(signer2).play(0);

    // const newTournament1 = await tournamentManager.tournaments(0);

    // console.log(
    //   "SPONGE",
    //   newTournament1.resultsSpongeHash,
    //   "players",
    //   newTournament1.endDate.toBigInt(),
    //   newTournament1.deFiBridgeAddress,
    //   newTournament1.enrollmentAmount,
    // );
    // !ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

    filterResults = tournamentManager.filters.ResultCreated(0);
    mintResultCreated = await tournamentManager.queryFilter(filterResults);
    // console.log(mintResultCreated);

    eventsResultCreated = [];

    for (let i = 0; i < mintResultCreated.length; i++) {
      if (mintResultCreated[i].args.tournamentID === 0) {
        const player = mintResultCreated[i].args.player;
        const scoreNumber = mintResultCreated[i].args.scoreNumber.toBigInt();
        // console.log({player})

        eventsResultCreated.push({ address: player, score: scoreNumber });
      }
    }
    console.log("events good", eventsResultCreated);
    const backendLeaderBoard = getLeaderboard(0n, eventsResultCreated);
    // // console.log(backendLeaderBoard.positions);
    const index = backendLeaderBoard.positions.indexOf(0);

    const backendMerkleTree = getMerkleRoot(
      0,
      backendLeaderBoard.concatenatedStringBytes,
      backendLeaderBoard.positions,
      index,
    );

    console.log(
      "backend recreated sponge hash",
      backendLeaderBoard.spongeHash,
      "bytes",
      backendLeaderBoard.concatenatedStringBytes,
      backendLeaderBoard.positions,
      index,
      'wyyyyyyyyyyyyyy',
      backendMerkleTree.inputProof,
    );

    // !ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    // const gasLimit = 4000000; // Set your desired gas limit

    // await tournamentManager.createLeaderBoardMerkleTree(
    //   0,
    //   backendLeaderBoard.concatenatedStringBytes,
    //   backendLeaderBoard.positions,
    //   { gasLimit }
    // );
    const Tournament1 = await tournamentManager.tournaments(0);

    console.log(
      "tournament  sponge hash",
      Tournament1.resultsSpongeHash,
      Tournament1.merkleRoot,
      Tournament1.numParticipants,

    );
    console.log("owner",await tournamentManager.getParticipants(0,owner.getAddress()) );
    // !ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    // const gasLimit = 8000000; // Set your desired gas limit
    await tournamentManager.endERC20Tournament(0)
    console.log('tour ended')

    await tournamentManager
      .connect(signer1)
      .verifyAndClaim(0, backendMerkleTree.isLeft, index, backendMerkleTree.inputProof);
    console.log("verified");

  
  });
});
