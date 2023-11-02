// Import required libraries and artifacts
import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  TournamentManager,
  RocketProtocol,
  FunToken,
  FunToken2,
  CompoundProtocol,
  UniswapV2Protocol,
} from "../typechain-types";
import type { Signer } from "ethers";

describe("Tournament Management", function () {
  let tournamentManager: TournamentManager;
  let rocketProtocol: RocketProtocol;
  let compoundProtocol: CompoundProtocol;
  let uniswapProtocol: UniswapV2Protocol;
  let funToken: FunToken;
  let funToken2: FunToken2;
  let clone: CompoundProtocol;
  let owner: Signer, participant1: Signer, participant2: Signer;

  const currentDate = new Date();
  const tomorrow = new Date(currentDate.getTime() +   105 * 60 * 60 * 1000); // Add 105 hours
  const init_date_UnixTimestampInSeconds = Math.floor(tomorrow.getTime() / 1000);

  const afterTomorrow = new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000); // Add another 5 hours
  const end_date_UnixTimestampInSeconds = Math.floor(afterTomorrow.getTime() / 1000);

  const enrollmentAmount = ethers.utils.parseEther("1");

  before(async () => {
    // Initialize some signers
    [owner, participant1, participant2] = await ethers.getSigners();

    // Deploy the contracts
    // TournamentManager
    const TournamentManagerFactory = await ethers.getContractFactory("TournamentManager");
    tournamentManager = (await TournamentManagerFactory.deploy(owner.getAddress())) as TournamentManager;
    await tournamentManager.deployed();
    // Rocket protocol contract
    const RocketContractFactory = await ethers.getContractFactory("RocketProtocol");
    rocketProtocol = (await RocketContractFactory.deploy(owner.getAddress())) as RocketProtocol;
    await rocketProtocol.deployed();
    // Uniswap protocol contract
    const UniswapContractFactory = await ethers.getContractFactory("UniswapV2Protocol");
    uniswapProtocol = (await UniswapContractFactory.deploy(owner.getAddress())) as UniswapV2Protocol;
    await uniswapProtocol.deployed();
    // Rocket protocol contract
    const CompoundProtocolFactory = await ethers.getContractFactory("CompoundProtocol");
    compoundProtocol = (await CompoundProtocolFactory.deploy(owner.getAddress())) as CompoundProtocol;
    await compoundProtocol.deployed();
    // FunToken contract
    const FunTokenFactory = await ethers.getContractFactory("FunToken");
    funToken = (await FunTokenFactory.deploy(owner.getAddress())) as FunToken;
    await funToken.deployed();
    // FunToken2 contract
    const FunToken2Factory = await ethers.getContractFactory("FunToken2");
    funToken2 = (await FunToken2Factory.deploy(owner.getAddress())) as FunToken2;
    await funToken2.deployed();

    await funToken.transfer(participant1.getAddress(), ethers.utils.parseEther("15"));
    await funToken2.transfer(participant1.getAddress(), ethers.utils.parseEther("15"));

    await tournamentManager
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

    await tournamentManager
      .connect(owner)
      .createTournament(
        10000,
        1,
        enrollmentAmount,
        [],
        init_date_UnixTimestampInSeconds,
        end_date_UnixTimestampInSeconds,
        rocketProtocol.address,
        ["0xF09F0369aB0a875254fB565E52226c88f10Bc839"],
      );
    const newTournament = await tournamentManager.tournaments(0);

    clone = new ethers.Contract(newTournament.deFiBridgeAddress, compoundProtocol.interface, owner) as CompoundProtocol;
    await clone.deployed();


    // Enroll ETH participants
    await tournamentManager.enrollWithETH(1, { value: enrollmentAmount });
    await tournamentManager.connect(participant1).enrollWithETH(1, { value: enrollmentAmount });

    // Enroll ERC20 participants
    await funToken.connect(owner).approve(tournamentManager.address, enrollmentAmount);
    await tournamentManager.enrollWithERC20(0);
    await funToken.connect(participant1).approve(tournamentManager.address, enrollmentAmount);
    await tournamentManager.connect(participant1).enrollWithERC20(0);
    
  });

  it("should allow Owner to create a tournament, check all input parameters", async () => {
    const newTournament = await tournamentManager.tournaments(0);
    expect(newTournament).to.exist;
    expect(newTournament.ID).to.equal(0);
    expect(newTournament.maxParticipants).to.equal(10000);
    expect(newTournament.minParticipants).to.equal(1);
    expect(newTournament.enrollmentAmount).to.equal(enrollmentAmount);

    expect(newTournament.initDate).to.equal(init_date_UnixTimestampInSeconds);
    expect(newTournament.endDate).to.equal(end_date_UnixTimestampInSeconds);

    // expect(newTournament.DeFiBridge_address).to.equal(compoundProtocol.address);
    // expect(newTournament.DeFiProtocol_address).to.equal("0xF09F0369aB0a875254fB565E52226c88f10Bc839");

    expect(newTournament.aborted).to.equal(false);
    expect(newTournament.numParticipants).to.equal(2);

    expect(await tournamentManager.getAcceptedTokens(0)).to.deep.equal([funToken.address]);
  });

  it("should not allow non-Owner to create a tournament", async () => {

        expect(tournamentManager
          .connect(participant1)
          .createTournament(
            10000,
            250,
            enrollmentAmount,
            [funToken.address],
            init_date_UnixTimestampInSeconds,
            end_date_UnixTimestampInSeconds,
            compoundProtocol.address,
            ["0xF09F0369aB0a875254fB565E52226c88f10Bc839"],
          )).to.be.revertedWithCustomError(tournamentManager, "OwnableUnauthorizedAccount")
          .withArgs(participant1.getAddress());
        
  });

  it("should allow participants to enroll with ETH tokens", async () => {
    const newTournament = await tournamentManager.tournaments(1);
    // Check if the number of participants increased
    expect(newTournament.numParticipants).to.equal(2);
    // Check if the first participant's enrollment check is set correctly
    const participant1Enrollment = await tournamentManager.getParticipants(1, participant1.getAddress());
    expect(participant1Enrollment).to.equal(true);
  });

  it("should allow participants to enroll with ERC20 tokens", async () => {
    // Get the updated tournament data
    const updatedTournament = await tournamentManager.tournaments(0);
    // Check if the number of participants increased
    expect(updatedTournament.numParticipants).to.equal(2);
    // Check if the first participant's enrollment check is set correctly
    const participant1Enrollment = await tournamentManager.getParticipants(0, participant1.getAddress());
    expect(participant1Enrollment).to.equal(true);
  });

  it("should allow Admins to start an ETH tournament", async () => {
    await time.increase(3600 * 6);
    const tx = await tournamentManager.connect(owner).startETHTournament(1);
    // Wait for the transaction to be mined
    await tx.wait();
    // Check if the transaction receipt status is success
    const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
    expect(txReceipt.status).to.equal(1); // 1 indicates success
  });

  it("should allow Admins to start an ERC20 tournament", async () => {
    const tx = await tournamentManager.connect(owner).startERC20Tournament(0);
    await tx.wait();
    const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
    expect(txReceipt.status).to.equal(1); // 1 indicates success
  });
  // Add more test cases for other contract functions as needed
});
