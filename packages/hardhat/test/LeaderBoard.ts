import { expect } from "chai";
import { ethers, network } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { TournamentManager, FunToken, CompoundProtocol, MajorHashGame } from "../typechain-types";
import { getLeaderboard } from "../../nextjs/utils/leader-board/leaderboard";
import { getMerkleRoot } from "../../nextjs/utils/leader-board/merkle_tree_proof";
import type { Signer } from "ethers";

describe("LeaderBoard and MerkleTree", function () {
  // We define a fixture to reuse the same setup in every test.

  const enrollmentAmount = ethers.utils.parseEther("1");

  let leaderBoard: TournamentManager;
  let funToken: FunToken;
  let compoundProtocol: CompoundProtocol;
  let majorHashGame: MajorHashGame;
  let owner: Signer, participant1: Signer, participant2: Signer;

  type EventsResultCreated = {
    address: string;
    score: bigint;
  };

  let filter;
  let mintResultCreated;
  let eventsResultCreated: EventsResultCreated[];
  let badEventsResultCreated: EventsResultCreated[];

  before("Deploy contracts", async () => {
    // Initialize some signers
    [owner, participant1, participant2] = await ethers.getSigners();

    // Compound protocol contract
    const LeaderBoardFactory = await ethers.getContractFactory("TournamentManager");
    leaderBoard = (await LeaderBoardFactory.deploy(owner.getAddress())) as TournamentManager;
    await leaderBoard.deployed();
    // Compound protocol contract
    const CompoundProtocolFactory = await ethers.getContractFactory("CompoundProtocol");
    compoundProtocol = (await CompoundProtocolFactory.deploy(owner.getAddress())) as CompoundProtocol;
    await compoundProtocol.deployed();
    // Major hash game contract
    const MajorHashGameFactory = await ethers.getContractFactory("MajorHashGame");
    majorHashGame = (await MajorHashGameFactory.deploy(leaderBoard.address)) as MajorHashGame;
    await majorHashGame.deployed();
    // FunToken contract
    const FunTokenFactory = await ethers.getContractFactory("FunToken");
    funToken = (await FunTokenFactory.deploy(owner.getAddress())) as FunToken;
    await funToken.deployed();

    const currentDate = new Date();
    const tomorrow = new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000); // Add 24 hours
    const init_date_UnixTimestampInSeconds = Math.floor(tomorrow.getTime() / 1000);

    const afterTomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000); // Add another 24 hours
    const end_date_UnixTimestampInSeconds = Math.floor(afterTomorrow.getTime() / 1000);

    await leaderBoard
      .connect(owner)
      .createTournament(
        10000,
        1,
        enrollmentAmount,
        [funToken.address],
        init_date_UnixTimestampInSeconds,
        end_date_UnixTimestampInSeconds,
        compoundProtocol.address,
        ["0xF09F0369aB0a875254fB565E52226c88f10Bc839"],
      );

    await funToken.transfer(participant1.getAddress(), ethers.utils.parseEther("15"));
    await funToken.transfer(participant2.getAddress(), ethers.utils.parseEther("15"));

    await funToken.connect(owner).approve(leaderBoard.address, enrollmentAmount);
    await leaderBoard.enrollWithERC20(0);
    await funToken.connect(participant1).approve(leaderBoard.address, enrollmentAmount);
    await leaderBoard.connect(participant1).enrollWithERC20(0);
    await funToken.connect(participant2).approve(leaderBoard.address, enrollmentAmount);
    await leaderBoard.connect(participant2).enrollWithERC20(0);

    // advance time by one hour and mine a new block
    await time.increase(3600 * 50);
    await majorHashGame.connect(owner).play(0);
    const blockNumBefore1 = await ethers.provider.getBlockNumber();
    const blockBefore1 = await ethers.provider.getBlock(blockNumBefore1);
    const timestampBefore1 = blockBefore1.timestamp;
    // console.log("temps owner", timestampBefore1);
    await majorHashGame.connect(participant1).play(0);
    await majorHashGame.connect(participant2).play(0);
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    // console.log("temps player1", timestampBefore);

    filter = leaderBoard.filters.ResultCreated(0);
    mintResultCreated = await leaderBoard.queryFilter(filter);

    eventsResultCreated = [];

    for (let i = 0; i < mintResultCreated.length; i++) {
      const player = mintResultCreated[i].args.player;
      const scoreNumber = mintResultCreated[i].args.scoreNumber.toBigInt();

      eventsResultCreated.push({ address: player, score: scoreNumber });
    }

    badEventsResultCreated = [];

    for (let i = mintResultCreated.length - 1; (i = 0); i--) {
      const player = mintResultCreated[i].args.player;
      const scoreNumber = mintResultCreated[i].args.scoreNumber.toBigInt();

      badEventsResultCreated.push({ address: player, score: scoreNumber });
    }
  });

  it("It should generate the same Sponge Hash as the one generated by the Backend.", async () => {
    const backendLeaderBoard = getLeaderboard(0n, eventsResultCreated);
    const spongeHash = await leaderBoard.getSpongeHash(0);
    expect(spongeHash.toString()).to.equal(backendLeaderBoard.spongeHash);
  });

  it("It should revert due to inequality in on-chain and off-chain Sponge Hash.", async () => {
    const backendLeaderBoard = getLeaderboard(0n, badEventsResultCreated);
    await time.increase(3600 * 50);

    await expect(
      leaderBoard.endERC20Tournament(0, backendLeaderBoard.concatenatedStringBytes, backendLeaderBoard.positions),
    ).to.be.revertedWith("Data corrupted: bad spongeHash recreation.");
  });

  it("It should revert due to incorrect player classification ordering.", async () => {
    const backendLeaderBoard = getLeaderboard(0n, eventsResultCreated);

    await expect(
      leaderBoard.endERC20Tournament(
        0,
        backendLeaderBoard.concatenatedStringBytes,
        backendLeaderBoard.positions.reverse(),
      ),
    ).to.be.revertedWith("Data corrupted: incorrect player classification.");
  });

  it("It should generate the same Merkle Root as the one generated by the Backend.", async () => {
    const backendLeaderBoard = getLeaderboard(0n, eventsResultCreated);
    const backendMerkleTree = getMerkleRoot(
      0,
      backendLeaderBoard.concatenatedStringBytes,
      backendLeaderBoard.positions,
      0,
    );

    await leaderBoard.endERC20Tournament(0, backendLeaderBoard.concatenatedStringBytes, backendLeaderBoard.positions);

    const merkleRoot = await leaderBoard.getMerkleRoot(0);
    // console.log("dfada", merkleRoot.toString(), "bo", backendMerkleTree.root);
    expect(merkleRoot.toString()).to.equal(backendMerkleTree.root);
  });

  it("It should allow players to claim according to its position.", async () => {
    const backendLeaderBoard = getLeaderboard(0n, eventsResultCreated);
    // console.log(backendLeaderBoard.positions);
    const index = backendLeaderBoard.positions.indexOf(1);
    const backendMerkleTree = getMerkleRoot(
      0,
      backendLeaderBoard.concatenatedStringBytes,
      backendLeaderBoard.positions,
      index,
    );

    // console.log(backendMerkleTree.isLeft,backendMerkleTree.inputProof)

    const tx = await leaderBoard
      .connect(participant1)
      .verifyAndClaim(0, backendMerkleTree.isLeft, index, backendMerkleTree.inputProof);
    await tx.wait();
    // Check if the transaction receipt status is success
    const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
    expect(txReceipt.status).to.equal(1); // 1 indicates success
  });

  it("It should revert due to bad position recreation.", async () => {
    const backendLeaderBoard = getLeaderboard(0n, eventsResultCreated);
    // console.log(backendLeaderBoard.positions);
    const index = backendLeaderBoard.positions.indexOf(1);
    const backendMerkleTree = getMerkleRoot(
      0,
      backendLeaderBoard.concatenatedStringBytes,
      backendLeaderBoard.positions,
      index,
    );
    await expect(
      leaderBoard
        .connect(participant2)
        .verifyAndClaim(0, backendMerkleTree.isLeft, index, backendMerkleTree.inputProof),
    ).to.be.revertedWith("Merkle proof verification failed.");
  });
});
