import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentManager, FunToken, FunToken2, CompoundProtocol, MajorHashGame } from "../typechain-types";
import { getLeaderboard } from "../../nextjs/utils/leader-board/leaderboard";
import { getMerkleRoot } from "../../nextjs/utils/leader-board/merkle_tree_proof";
import { BigNumber, Signer } from "ethers";

describe("LeaderBoard and MerkleTree", function () {
  // We define a fixture to reuse the same setup in every test.
  const currentDate = new Date();
  const init_date_UnixTimestampInSeconds = 2;
  const end_date = new Date(currentDate.getTime() + 15 * 24 * 60 * 60 * 1000);
  const end_date_UnixTimestampInSeconds = Math.floor(end_date.getTime() / 1000);

  const enrollmentAmount = ethers.utils.parseEther("1");

  const events = [
    {
      player: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
      score_number: 333n,
    },
    {
      player: "0x11DfADcd62593325Bcf82Ed1f55d87840E93A977",
      score_number: 56565n,
    },
    {
      player: "0x74a81F84268744a40FEBc48f8b812a1f188D80C3",
      score_number: 888n,
    },
    {
      player: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
      score_number: 11n,
    },
    {
      player: "0x11DfADcd62593325Bcf82Ed1f55d87840E93A977",
      score_number: 15n,
    },
  ];
  const backendLeaderBoard = getLeaderboard(0n, events);
  const backendMerkleTree = getMerkleRoot(
    0,
    backendLeaderBoard.concatenatedStringBytes,
    backendLeaderBoard.positions,
    1,
  );

  // let events: { player: string; score_number: BigInt }[] = [];

  // let backendLeaderBoard: {
  //   concatenatedStringBytes: string;
  //   positions: number[];
  //   spongeHash: string;
  // } = {
  //   concatenatedStringBytes: "", // Default values or values of your choice
  //   positions: [],
  //   spongeHash: "",
  // };

  // let backendMerkleTree: {
  //   isLeft: boolean[];
  //   proof: {
  //     position: "left" | "right";
  //     data: Buffer;
  //   }[];
  //   root: string;
  // } = {
  //   isLeft: [],
  //   proof: [],
  //   root: "",
  // };

  let leaderBoard: TournamentManager;
  let funToken: FunToken;
  let funToken2: FunToken2;
  let compoundProtocol: CompoundProtocol;
  let majorHashGame: MajorHashGame;
  let owner: Signer, participant1: Signer, participant2: Signer, participant3: Signer, participant4: Signer;

  beforeEach("Deploy contracts", async () => {
    // Initialize some signers
    [owner, participant1, participant2, participant3, participant4] = await ethers.getSigners();

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
    // FunToken2 contract
    const FunToken2Factory = await ethers.getContractFactory("FunToken2");
    funToken2 = (await FunToken2Factory.deploy(owner.getAddress())) as FunToken2;
    await funToken2.deployed();

    await leaderBoard
      .connect(owner)
      .createTournament(
        10000,
        2,
        enrollmentAmount,
        [funToken.address],
        2 ** 30,
        2 ** 30,
        compoundProtocol.address,
        "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
      );
    await leaderBoard.setResult(0, events[0].player, events[0].score_number);
    await leaderBoard.setResult(0, events[1].player, events[1].score_number);
    await leaderBoard.setResult(0, events[2].player, events[2].score_number);
    await leaderBoard.setResult(0, events[3].player, events[3].score_number);
    await leaderBoard.setResult(0, events[4].player, events[4].score_number);

    // await funToken.connect(owner).transfer(await participant1.getAddress(), ethers.utils.parseEther("15"));
    // await funToken.connect(owner).transfer(await participant2.getAddress(), ethers.utils.parseEther("15"));
    // await funToken.connect(owner).transfer(await participant3.getAddress(), ethers.utils.parseEther("15"));
    // await funToken.connect(owner).transfer(await participant4.getAddress(), ethers.utils.parseEther("15"));

    // await funToken.connect(owner).approve(leaderBoard.address, enrollmentAmount);
    // await funToken.connect(participant1).approve(leaderBoard.address, enrollmentAmount);
    // await funToken.connect(participant2).approve(leaderBoard.address, enrollmentAmount);
    // await funToken.connect(participant3).approve(leaderBoard.address, enrollmentAmount);
    // await funToken.connect(participant4).approve(leaderBoard.address, enrollmentAmount);
    // await leaderBoard.connect(owner).enrollWithERC20(0);
    // await leaderBoard.connect(participant1).enrollWithERC20(0);
    // await leaderBoard.connect(participant2).enrollWithERC20(0);
    // await leaderBoard.connect(participant3).enrollWithERC20(0);
    // await leaderBoard.connect(participant4).enrollWithERC20(0);

    // await majorHashGame.connect(owner).play(0);
    // await majorHashGame.connect(participant1).play(0);
    // await majorHashGame.connect(participant2).play(0);
    // await majorHashGame.connect(participant3).play(0);
    // await majorHashGame.connect(participant4).play(0);

    // const addresses = [
    //   await owner.getAddress(),
    //   await participant1.getAddress(),
    //   await participant2.getAddress(),
    //   await participant3.getAddress(),
    //   await participant4.getAddress(),
    // ];

    // addresses.forEach(async (address, index) => {
    //   console.log(leaderBoard.filters.ResultCreated(address).topics);
    //   const topicsX = leaderBoard.filters.ResultCreated(0, address).topics?.[2] || "0";
    //   const decimalNumber = parseInt(Array.isArray(topicsX) ? topicsX[0] : topicsX, 16);
    //   // console.log(BigInt(decimalNumber));
    //   events.push({ player: address, score_number: BigInt(decimalNumber) });
    // });

    // backendLeaderBoard = getLeaderboard(0n, events);
    // backendMerkleTree = getMerkleRoot(0, backendLeaderBoard.concatenatedStringBytes, backendLeaderBoard.positions, 1);
  });


  it("It should generate the same Sponge Hash as the one generated by the Backend.", async () => {
    const spongeHash = await leaderBoard.getSpongeHash(0);
    expect(spongeHash.toString()).to.equal(backendLeaderBoard.spongeHash);
  });

  it("It should revert due to incorrect player classification ordering.", async () => {
    await expect(
      leaderBoard.createLeaderBoardMerkleTree(0, backendLeaderBoard.concatenatedStringBytes, [1, 2, 4, 0, 3]),
    ).to.be.revertedWith("Data corrupted: incorrect players classification.");
  });

  it("It should revert due to inequality in on-chain and off-chain Sponge Hash.", async () => {
    await expect(
      leaderBoard.createLeaderBoardMerkleTree(
        0,
        "0xc3d678b66703497daa19211eedff47f25394cdc3000000000000000000000000000000000000000000000000000000000000014d11dfadcd62593325bcf82ed1f55d87840e93a977000000000000000000000000000000000000000000000000000000000000dcf574a81f84268744a40febc48f8b812a1f188d80c30000000000000000000000000000000000000000000000000000000000000378c3d688b66703497daa19211eedff47f25384cdc3000000000000000000000000000000000000000000000000000000000000000b11dfadcd62593325bcf82ed1f55d87840e93a977000000000000000000000000000000000000000000000000000000000000000f",
        backendLeaderBoard.positions,
      ),
    ).to.be.revertedWith("Data corrupted: bad spongeHash recreation.");
  });

  it("It should generate the same Merkle Root as the one generated by the Backend.", async () => {
    await leaderBoard.createLeaderBoardMerkleTree(
      0,
      backendLeaderBoard.concatenatedStringBytes,
      backendLeaderBoard.positions,
    );
    const merkleRoot = await leaderBoard.getMerkleRoot(0);
    expect(merkleRoot.toString()).to.equal(backendMerkleTree.root);
  });
});
